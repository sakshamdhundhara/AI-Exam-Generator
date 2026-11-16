/**
 * Test script to simulate user input across various subjects and topics,
 * preview suggestions, and verify contextual matching & typo tolerance.
 */
import {
  getSubjectSuggestions,
  getTopicSuggestions,
  resolveSubject,
  levenshteinDistance
} from "../lib/suggestions/academicCatalog.ts";

interface TestCaseResult {
  suite: string;
  name: string;
  passed: boolean;
  details: string;
}

const results: TestCaseResult[] = [];

function assert(condition: boolean, suite: string, name: string, details: string) {
  results.push({
    suite,
    name,
    passed: condition,
    details
  });
}

console.log("\n=======================================================");
console.log("🧪 RUNNING SUGGESTIONS & AUTOCOMPLETE TEST SUITE");
console.log("=======================================================\n");

// ----------------------------------------------------
// Test Suite 1: Subject Autocomplete (Prefix & Exact)
// ----------------------------------------------------
console.log("📋 [Suite 1] Subject Autocomplete & Categorization");
const subjectPrefixes = [
  { input: "Phys", expected: "Physics", expectedCat: "Natural Sciences" },
  { input: "Bio", expected: "Biology", expectedCat: "Natural Sciences" },
  { input: "Comp", expected: "Computer Science", expectedCat: "Computer Science & Engineering" },
  { input: "Math", expected: "Mathematics", expectedCat: "Mathematics & Statistics" },
  { input: "Econ", expected: "Economics", expectedCat: "Humanities & Social Sciences" },
  { input: "Hist", expected: "History", expectedCat: "Humanities & Social Sciences" }
];

for (const { input, expected, expectedCat } of subjectPrefixes) {
  const res = getSubjectSuggestions(input, 5);
  const topMatch = res.suggestions[0];
  const matched = topMatch?.value === expected && topMatch?.category === expectedCat;

  console.log(`  🔍 Input: "${input}" -> Top: "${topMatch?.value}" [${topMatch?.category}] (Score: ${topMatch?.matchScore?.toFixed(2)})`);
  assert(
    matched,
    "Suite 1: Subject Autocomplete",
    `Prefix "${input}" -> "${expected}"`,
    topMatch ? `Got "${topMatch.value}" (${topMatch.category})` : "No suggestions returned"
  );
}

// ----------------------------------------------------
// Test Suite 2: Subject Typo Tolerance & Correction
// ----------------------------------------------------
console.log("\n📋 [Suite 2] Subject Typo Tolerance & Auto-Correction");
const subjectTypos = [
  { typo: "Physcs", expected: "Physics" },
  { typo: "Biolog", expected: "Biology" },
  { typo: "Computr Scienc", expected: "Computer Science" },
  { typo: "Mathematiques", expected: "Mathematics" },
  { typo: "Chemstry", expected: "Chemistry" },
  { typo: "Psycology", expected: "Psychology" }
];

for (const { typo, expected } of subjectTypos) {
  const res = getSubjectSuggestions(typo, 5);
  const topMatch = res.suggestions[0];
  const matched = topMatch?.value === expected;
  const isTypoReported = res.correctedQuery === expected || topMatch?.isTypoCorrection;

  console.log(`  🔤 Typo: "${typo}" -> Corrected: "${topMatch?.value}" (Score: ${topMatch?.matchScore?.toFixed(2)}, TypoFlag: ${isTypoReported})`);
  assert(
    matched,
    "Suite 2: Subject Typo Tolerance",
    `Typo "${typo}" -> "${expected}"`,
    `Resolved: "${topMatch?.value}", Score: ${topMatch?.matchScore}`
  );
}

// ----------------------------------------------------
// Test Suite 3: Dynamic Contextual Topic Suggestions
// ----------------------------------------------------
console.log("\n📋 [Suite 3] Dynamic Contextual Topic Suggestions (Per Subject)");

const topicTests = [
  // Subject: Physics
  { subject: "Physics", query: "mech", expectedSubstring: "Mechanics", expectedCategory: "Mechanics" },
  { subject: "Physics", query: "mecanic", expectedSubstring: "Mechanics", expectedCategory: "Mechanics" }, // typo
  { subject: "Physics", query: "thermo", expectedSubstring: "Thermodynamics", expectedCategory: "Thermal Physics" },
  { subject: "Physics", query: "optik", expectedSubstring: "Optics", expectedCategory: "Optics" }, // typo

  // Subject: Biology
  { subject: "Biology", query: "cell", expectedSubstring: "Cell", expectedCategory: "Cellular Biology" },
  { subject: "Biology", query: "genetix", expectedSubstring: "Genetics", expectedCategory: "Genetics" }, // typo
  { subject: "Biology", query: "photosynthisis", expectedSubstring: "Photosynthesis", expectedCategory: "Cellular Biology" }, // typo
  { subject: "Biology", query: "circulat", expectedSubstring: "Circulatory", expectedCategory: "Human Physiology" },

  // Subject: Computer Science
  { subject: "Computer Science", query: "graph", expectedSubstring: "Graph", expectedCategory: "Data Structures & Algorithms" },
  { subject: "Computer Science", query: "algoritm", expectedSubstring: "Algorithms", expectedCategory: "Data Structures & Algorithms" }, // typo
  { subject: "Computer Science", query: "concur", expectedSubstring: "Concurrency", expectedCategory: "Systems & Architecture" },
  { subject: "Computer Science", query: "sql", expectedSubstring: "SQL", expectedCategory: "Databases & Systems" },

  // Subject: Mathematics
  { subject: "Mathematics", query: "deriv", expectedSubstring: "Derivatives", expectedCategory: "Calculus" },
  { subject: "Mathematics", query: "eigen", expectedSubstring: "Eigen", expectedCategory: "Linear Algebra" },
  { subject: "Mathematics", query: "integ", expectedSubstring: "Integral", expectedCategory: "Calculus" }
];

for (const { subject, query, expectedSubstring, expectedCategory } of topicTests) {
  const res = getTopicSuggestions(subject, query, 5);
  const found = res.suggestions.find(s => 
    s.value.toLowerCase().includes(expectedSubstring.toLowerCase()) &&
    s.category.toLowerCase().includes(expectedCategory.toLowerCase())
  );

  console.log(`  💡 [${subject}] Query: "${query}" -> Top: "${res.suggestions[0]?.value}" (${res.suggestions[0]?.category})`);
  assert(
    !!found,
    "Suite 3: Dynamic Topic Suggestions",
    `[${subject}] "${query}" -> contains "${expectedSubstring}" in "${expectedCategory}"`,
    found ? `Found: "${found.value}" (${found.category})` : `Top was: "${res.suggestions[0]?.value}" (${res.suggestions[0]?.category})`
  );
}

// ----------------------------------------------------
// Test Suite 4: Contextual Switch & Subject Isolation
// ----------------------------------------------------
console.log("\n📋 [Suite 4] Contextual Switch & Subject Isolation");

// Searching "circuits" in Physics should return electrical circuits; in Biology it should not dominate with electrical circuits
const physicsCircuits = getTopicSuggestions("Physics", "circuit", 3);
const bioCircuits = getTopicSuggestions("Biology", "circuit", 3);

console.log(`  🔬 Physics "circuit": "${physicsCircuits.suggestions[0]?.value}" (${physicsCircuits.suggestions[0]?.category})`);
console.log(`  🧬 Biology "circuit": "${bioCircuits.suggestions[0]?.value || 'None'}" (${bioCircuits.suggestions[0]?.category || 'None'})`);

assert(
  physicsCircuits.suggestions[0]?.value.includes("Circuits") && physicsCircuits.suggestions[0]?.category === "Electromagnetism",
  "Suite 4: Contextual Switch",
  "Physics 'circuit' returns electrical circuits",
  physicsCircuits.suggestions[0]?.value || "None"
);

// ----------------------------------------------------
// Test Suite 5: Typo in Subject Field + Topic Linking
// ----------------------------------------------------
console.log("\n📋 [Suite 5] Typo in Subject Input + Linked Topic Query");

// User has "Physcs" (typo) in the subject box and searches for "gravit"
const linkedTypoRes = getTopicSuggestions("Physcs", "gravit", 3);
const hasGravitation = linkedTypoRes.suggestions.some(s => s.value.includes("Gravitation"));

console.log(`  🔗 Subject typo "Physcs" resolved to: "${linkedTypoRes.resolvedSubject}"`);
console.log(`  🪐 Topic "gravit" -> "${linkedTypoRes.suggestions[0]?.value}" (${linkedTypoRes.suggestions[0]?.category})`);

assert(
  linkedTypoRes.resolvedSubject === "Physics" && hasGravitation,
  "Suite 5: Subject Typo + Topic Linking",
  "Subject typo 'Physcs' resolves to Physics and suggests Gravitation",
  `Resolved: "${linkedTypoRes.resolvedSubject}", Topic: "${linkedTypoRes.suggestions[0]?.value}"`
);

// ----------------------------------------------------
// Test Summary
// ----------------------------------------------------
console.log("\n=======================================================");
console.log("📊 TEST EXECUTION SUMMARY");
console.log("=======================================================");

const total = results.length;
const passed = results.filter(r => r.passed).length;
const failed = total - passed;

console.log(`Total Tests : ${total}`);
console.log(`Passed      : ${passed} ✅`);
console.log(`Failed      : ${failed} ${failed === 0 ? "🎉" : "❌"}`);

if (failed > 0) {
  console.log("\nFailed Tests Details:");
  results.filter(r => !r.passed).forEach(r => {
    console.log(`  ❌ [${r.suite}] ${r.name} - ${r.details}`);
  });
  process.exit(1);
} else {
  console.log("\n✨ All suggestion, autocomplete, and contextual tests passed successfully!\n");
  process.exit(0);
}
