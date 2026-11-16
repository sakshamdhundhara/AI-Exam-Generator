/**
 * Test script to verify dynamic mark allocation by question type:
 * - 1-2 marks per MCQ / objective question
 * - 5 marks for SHORT_ANSWER
 * - 10+ marks for LONG_ANSWER
 * - Exact alignment with configured exam total marks
 */
import {
  planMarkDistribution,
  reconcileQuestionMarks,
  buildMarksDistributionTable
} from "../lib/agents/markAllocation.ts";
import type { Question } from "../lib/types.ts";

interface Result {
  name: string;
  passed: boolean;
  details: string;
}

const testResults: Result[] = [];

function check(condition: boolean, name: string, details: string) {
  testResults.push({ name, passed: condition, details });
  console.log(`  ${condition ? "✅ PASS" : "❌ FAIL"}: ${name}`);
  if (!condition) console.log(`     Details: ${details}`);
}

console.log("\n=======================================================");
console.log("⚖️  RUNNING DYNAMIC MARK ALLOCATION TEST SUITE");
console.log("=======================================================\n");

// ----------------------------------------------------
// Test 1: Mixed Exam (MCQ, SHORT_ANSWER, LONG_ANSWER) - 100 Marks, 20 Questions
// ----------------------------------------------------
console.log("📋 [Test 1] Mixed Exam: MCQ + Short + Long (100 Marks, 20 Questions)");
const plan1 = planMarkDistribution({
  subject: "Physics",
  topics: ["Mechanics"],
  totalMarks: 100,
  numQuestions: 20,
  questionTypes: ["MCQ", "SHORT_ANSWER", "LONG_ANSWER"],
  difficultyLevel: "MIXED"
});

const mcqAlloc1 = plan1.allocations.find(a => a.type === "MCQ")!;
const shortAlloc1 = plan1.allocations.find(a => a.type === "SHORT_ANSWER")!;
const longAlloc1 = plan1.allocations.find(a => a.type === "LONG_ANSWER")!;

const allMarks1 = plan1.allocations.flatMap(a => a.marksEach);
const sum1 = allMarks1.reduce((a, b) => a + b, 0);

console.log(`  - MCQs: ${mcqAlloc1.count} questions, marks: [${mcqAlloc1.marksEach.join(", ")}]`);
console.log(`  - Short: ${shortAlloc1.count} questions, marks: [${shortAlloc1.marksEach.join(", ")}]`);
console.log(`  - Long: ${longAlloc1.count} questions, marks: [${longAlloc1.marksEach.join(", ")}]`);
console.log(`  - Total Questions: ${allMarks1.length}, Total Marks: ${sum1}`);

check(
  mcqAlloc1.marksEach.every(m => m >= 1 && m <= 2),
  "MCQs allocated 1-2 marks each",
  `Found MCQ marks: ${JSON.stringify(mcqAlloc1.marksEach)}`
);
check(
  shortAlloc1.marksEach.every(m => m === 5),
  "Short answers allocated exactly 5 marks each",
  `Found Short marks: ${JSON.stringify(shortAlloc1.marksEach)}`
);
check(
  longAlloc1.marksEach.every(m => m >= 10),
  "Long answers allocated 10+ marks each",
  `Found Long marks: ${JSON.stringify(longAlloc1.marksEach)}`
);
check(
  sum1 === 100 && allMarks1.length === 20,
  "Total marks strictly equal 100 for 20 questions",
  `Sum is ${sum1}, count is ${allMarks1.length}`
);

// ----------------------------------------------------
// Test 2: Standard Term Exam (MCQ + SHORT_ANSWER) - 50 Marks, 16 Questions
// ----------------------------------------------------
console.log("\n📋 [Test 2] Mid-Term Exam: MCQ + Short Answer (50 Marks, 16 Questions)");
const plan2 = planMarkDistribution({
  subject: "Biology",
  topics: ["Genetics"],
  totalMarks: 50,
  numQuestions: 16,
  questionTypes: ["MCQ", "SHORT_ANSWER"],
  difficultyLevel: "MEDIUM"
});

const allMarks2 = plan2.allocations.flatMap(a => a.marksEach);
const sum2 = allMarks2.reduce((a, b) => a + b, 0);
const mcqs2 = plan2.allocations.find(a => a.type === "MCQ")!;
const shorts2 = plan2.allocations.find(a => a.type === "SHORT_ANSWER")!;

console.log(`  - MCQs: ${mcqs2.count} questions, marks: [${mcqs2.marksEach.slice(0, 5).join(", ")}...]`);
console.log(`  - Short: ${shorts2.count} questions, marks: [${shorts2.marksEach.join(", ")}]`);
console.log(`  - Total Sum: ${sum2}`);

check(
  mcqs2.marksEach.every(m => m >= 1 && m <= 2),
  "MCQs remain strictly within 1-2 marks",
  `MCQ marks: ${JSON.stringify(mcqs2.marksEach)}`
);
check(
  shorts2.marksEach.every(m => m >= 4 && m <= 6),
  "Short answers remain centered around 5 marks",
  `Short marks: ${JSON.stringify(shorts2.marksEach)}`
);
check(
  sum2 === 50 && allMarks2.length === 16,
  "Total marks strictly equal 50 for 16 questions",
  `Sum: ${sum2}`
);

// ----------------------------------------------------
// Test 3: Objective Only Exam (MCQ) - 40 Marks, 20 Questions
// ----------------------------------------------------
console.log("\n📋 [Test 3] Objective Quiz: MCQ Only (40 Marks, 20 Questions)");
const plan3 = planMarkDistribution({
  subject: "Chemistry",
  topics: ["Atomic Structure"],
  totalMarks: 40,
  numQuestions: 20,
  questionTypes: ["MCQ"],
  difficultyLevel: "EASY"
});

const mcqs3 = plan3.allocations.find(a => a.type === "MCQ")!;
const sum3 = mcqs3.marksEach.reduce((a, b) => a + b, 0);

console.log(`  - MCQs: ${mcqs3.count} questions @ ${mcqs3.marksEach[0]} marks each = Total: ${sum3}`);

check(
  mcqs3.marksEach.every(m => m === 2),
  "All 20 MCQs allocated exactly 2 marks each",
  `Marks: ${JSON.stringify(mcqs3.marksEach)}`
);
check(sum3 === 40, "Sum equals exactly 40 marks", `Sum: ${sum3}`);

// ----------------------------------------------------
// Test 4: Reconciler with LLM Marks Deviations
// ----------------------------------------------------
console.log("\n📋 [Test 4] Reconciler: Correcting LLM Draft Marks Deviations");
const mockDraftQuestions: Question[] = [
  // LLM gave MCQs wrong marks (e.g. 5 or 8 marks)
  { id: "q-1", type: "MCQ", text: "Q1", marks: 6, difficulty: "EASY", topic: "T1" },
  { id: "q-2", type: "MCQ", text: "Q2", marks: 4, difficulty: "EASY", topic: "T1" },
  { id: "q-3", type: "MCQ", text: "Q3", marks: 5, difficulty: "EASY", topic: "T1" },
  // LLM gave Short Answer wrong mark (e.g. 2 marks instead of 5)
  { id: "q-4", type: "SHORT_ANSWER", text: "Q4", marks: 2, difficulty: "MEDIUM", topic: "T1" },
  { id: "q-5", type: "SHORT_ANSWER", text: "Q5", marks: 3, difficulty: "MEDIUM", topic: "T1" },
  // LLM gave Long Answer 6 marks instead of 10+
  { id: "q-6", type: "LONG_ANSWER", text: "Q6", marks: 6, difficulty: "HARD", topic: "T1" },
  { id: "q-7", type: "LONG_ANSWER", text: "Q7", marks: 8, difficulty: "HARD", topic: "T1" }
];

console.log("  Initial Unreconciled Marks:", mockDraftQuestions.map(q => `${q.type}:${q.marks}`).join(", "));
const reconciled = reconcileQuestionMarks(mockDraftQuestions, 50);
console.log("  Reconciled Dynamic Marks :", reconciled.map(q => `${q.type}:${q.marks}`).join(", "));

const reconciledSum = reconciled.reduce((a, b) => a + b.marks, 0);
const reconciledMCQs = reconciled.filter(q => q.type === "MCQ");
const reconciledShorts = reconciled.filter(q => q.type === "SHORT_ANSWER");
const reconciledLongs = reconciled.filter(q => q.type === "LONG_ANSWER");

check(
  reconciledMCQs.every(q => q.marks >= 1 && q.marks <= 2),
  "Reconciled MCQs strictly clamped to 1-2 marks",
  `Got: ${reconciledMCQs.map(q => q.marks).join(", ")}`
);
check(
  reconciledShorts.every(q => q.marks === 5),
  "Reconciled Short answers strictly allocated 5 marks",
  `Got: ${reconciledShorts.map(q => q.marks).join(", ")}`
);
check(
  reconciledLongs.every(q => q.marks >= 10),
  "Reconciled Long answers strictly allocated 10+ marks",
  `Got: ${reconciledLongs.map(q => q.marks).join(", ")}`
);
check(
  reconciledSum === 50,
  "Reconciled total sum equals exactly 50",
  `Sum: ${reconciledSum}`
);

// ----------------------------------------------------
// Test 5: Section Marks Distribution Table Builder
// ----------------------------------------------------
console.log("\n📋 [Test 5] Official Marks Distribution Table Generation");
const sections = [
  {
    title: "Section A: Multiple Choice Questions",
    instructions: "Answer all",
    marks: 6,
    questions: reconciledMCQs
  },
  {
    title: "Section B: Short Answer Questions",
    instructions: "Answer all",
    marks: 10,
    questions: reconciledShorts
  },
  {
    title: "Section C: Long Answer Questions",
    instructions: "Answer all",
    marks: 34,
    questions: reconciledLongs
  }
];

const table = buildMarksDistributionTable(sections);
console.log("  Generated Marks Distribution Table:");
console.table(table);

check(
  table.length === 3 && table[0].section === "A" && table[1].section === "B" && table[2].section === "C",
  "Table correctly formats Section A, B, C",
  JSON.stringify(table)
);
check(
  table[0].each === "2" && table[1].each === "5" && table[2].total === "34",
  "Table accurately reflects dynamic marks each and section totals",
  JSON.stringify(table)
);

// ----------------------------------------------------
// Summary
// ----------------------------------------------------
console.log("\n=======================================================");
console.log("📊 SUMMARY");
console.log("=======================================================");
const passed = testResults.filter(r => r.passed).length;
const total = testResults.length;
console.log(`Total Checks : ${total}`);
console.log(`Passed       : ${passed} ✅`);
console.log(`Failed       : ${total - passed} ${total - passed === 0 ? "🎉" : "❌"}`);

if (passed === total) {
  console.log("\n✨ All dynamic mark allocation tests passed flawlessly!\n");
  process.exit(0);
} else {
  process.exit(1);
}
