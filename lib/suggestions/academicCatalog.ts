export interface CatalogTopic {
  name: string;
  category: string;
  description: string;
  keywords?: string[];
}

export interface CatalogSubject {
  name: string;
  category: string;
  description: string;
  aliases?: string[];
  topics: CatalogTopic[];
}

export interface SuggestionResult {
  value: string;
  category: string;
  matchScore: number;
  description: string;
  isTypoCorrection?: boolean;
}

export interface SuggestionResponse {
  query: string;
  type: "subject" | "topic";
  resolvedSubject?: string;
  correctedQuery?: string;
  categories: string[];
  suggestions: SuggestionResult[];
}

// Comprehensive Academic Subject & Topic Catalog
export const ACADEMIC_CATALOG: CatalogSubject[] = [
  // --- Natural Sciences ---
  {
    name: "Physics",
    category: "Natural Sciences",
    description: "Study of matter, energy, motion, and fundamental forces of the universe.",
    aliases: ["General Physics", "AP Physics", "College Physics"],
    topics: [
      { name: "Classical Mechanics", category: "Mechanics", description: "Newtonian dynamics, kinematics, work-energy theorem, and momentum conservation." },
      { name: "Rotational Dynamics", category: "Mechanics", description: "Torque, angular momentum, moment of inertia, and rotational equilibrium." },
      { name: "Gravitation & Planetary Motion", category: "Mechanics", description: "Newton's law of gravitation, Kepler's laws, and gravitational potential energy." },
      { name: "Fluid Mechanics", category: "Mechanics", description: "Hydrostatic pressure, Pascal's principle, continuity equation, and Bernoulli's theorem." },
      { name: "Thermodynamics & Heat Transfer", category: "Thermal Physics", description: "Laws of thermodynamics, entropy, heat engines, and thermal conduction/radiation." },
      { name: "Kinetic Theory of Gases", category: "Thermal Physics", description: "Ideal gas law, molecular speeds, mean free path, and degrees of freedom." },
      { name: "Electrostatics & Electric Fields", category: "Electromagnetism", description: "Coulomb's law, Gauss's law, electric potential, and capacitance." },
      { name: "Current Electricity & Circuits", category: "Electromagnetism", description: "Ohm's law, Kirchhoff's circuit rules, RC circuits, and electrical power." },
      { name: "Magnetism & Magnetic Fields", category: "Electromagnetism", description: "Lorentz force, Biot-Savart law, Ampère's circuital law, and magnetic materials." },
      { name: "Electromagnetic Induction", category: "Electromagnetism", description: "Faraday's law, Lenz's law, self/mutual inductance, and AC generators." },
      { name: "Geometrical & Wave Optics", category: "Optics", description: "Refraction, Snell's law, thin lens formula, interference, and diffraction." },
      { name: "Quantum Physics & Photoelectric Effect", category: "Modern Physics", description: "Photons, de Broglie wavelength, Bohr model, and Heisenberg uncertainty." },
      { name: "Nuclear & Particle Physics", category: "Modern Physics", description: "Radioactive decay, nuclear fission and fusion, binding energy, and quarks." },
      { name: "Special Relativity", category: "Modern Physics", description: "Time dilation, length contraction, Lorentz transformations, and mass-energy equivalence." }
    ]
  },
  {
    name: "Chemistry",
    category: "Natural Sciences",
    description: "Study of substances, chemical bonds, reactions, and molecular structures.",
    aliases: ["General Chemistry", "AP Chemistry"],
    topics: [
      { name: "Atomic Structure & Periodic Trends", category: "Inorganic Chemistry", description: "Quantum numbers, electron configurations, ionization energy, and electronegativity." },
      { name: "Chemical Bonding & Molecular Geometry", category: "Inorganic Chemistry", description: "Ionic and covalent bonds, Lewis structures, VSEPR theory, and hybridization." },
      { name: "Coordination Compounds", category: "Inorganic Chemistry", description: "Ligands, coordination number, crystal field theory, and isomerism." },
      { name: "Chemical Thermodynamics & Thermochemistry", category: "Physical Chemistry", description: "Enthalpy, Hess's law, Gibbs free energy, and spontaneity." },
      { name: "Chemical Kinetics & Reaction Rates", category: "Physical Chemistry", description: "Rate laws, reaction order, Arrhenius equation, and catalysis mechanisms." },
      { name: "Chemical & Ionic Equilibrium", category: "Physical Chemistry", description: "Le Chatelier's principle, equilibrium constant (Kc/Kp), and solubility product (Ksp)." },
      { name: "Acids, Bases & Buffer Solutions", category: "Physical Chemistry", description: "pH calculations, Brønsted-Lowry/Lewis acids, and Henderson-Hasselbalch equation." },
      { name: "Electrochemistry & Redox Reactions", category: "Physical Chemistry", description: "Galvanic cells, Nernst equation, electrolysis, and standard reduction potentials." },
      { name: "Organic Reaction Mechanisms", category: "Organic Chemistry", description: "Nucleophilic substitutions (SN1/SN2), eliminations (E1/E2), and additions." },
      { name: "Hydrocarbons & Aromatic Compounds", category: "Organic Chemistry", description: "Alkanes, alkenes, alkynes, benzene reactivity, and aromaticity rules." },
      { name: "Biomolecules & Polymers", category: "Biochemistry", description: "Carbohydrates, amino acids, peptide bonds, nucleic acids, and synthetic polymers." }
    ]
  },
  {
    name: "Biology",
    category: "Natural Sciences",
    description: "Exploration of living organisms, cellular mechanisms, genetics, and ecology.",
    aliases: ["Biological Sciences", "AP Biology", "Life Sciences"],
    topics: [
      { name: "Cell Structure & Organelles", category: "Cellular Biology", description: "Prokaryotic vs eukaryotic cells, plasma membrane dynamics, and organelle functions." },
      { name: "Cellular Respiration & ATP Production", category: "Cellular Biology", description: "Glycolysis, Krebs cycle, electron transport chain, and oxidative phosphorylation." },
      { name: "Photosynthesis & Light Reactions", category: "Cellular Biology", description: "Light-dependent reactions, Calvin cycle, photophosphorylation, and chlorophyll." },
      { name: "Cell Division: Mitosis & Meiosis", category: "Genetics", description: "Stages of mitosis, meiotic crossing over, gametogenesis, and chromosomal segregation." },
      { name: "Mendelian Genetics & Heredity", category: "Genetics", description: "Monohybrid/dihybrid crosses, Punnett squares, sex linkage, and pedigree analysis." },
      { name: "Molecular Genetics & DNA Replication", category: "Molecular Biology", description: "DNA double helix, semi-conservative replication, transcription, and translation." },
      { name: "Gene Regulation & Biotechnology", category: "Molecular Biology", description: "Operon models, recombinant DNA technology, PCR, CRISPR, and gel electrophoresis." },
      { name: "Evolution & Natural Selection", category: "Evolutionary Biology", description: "Darwinian fitness, speciation mechanisms, Hardy-Weinberg equilibrium, and phylogenetics." },
      { name: "Ecology & Ecosystem Dynamics", category: "Ecology", description: "Trophic levels, energy flow, biogeochemical cycles, and population dynamics." },
      { name: "Human Circulatory & Respiratory Systems", category: "Human Physiology", description: "Cardiac cycle, systemic blood flow, gas exchange, and hemoglobin binding." },
      { name: "Human Nervous & Endocrine Systems", category: "Human Physiology", description: "Action potentials, synaptic transmission, reflex arcs, and hormonal signaling." },
      { name: "Immune System & Host Defense", category: "Immunology", description: "Innate vs adaptive immunity, antibody structure, T cells, and vaccination principles." }
    ]
  },

  // --- Computer Science & Engineering ---
  {
    name: "Computer Science",
    category: "Computer Science & Engineering",
    description: "Foundations of computation, software design, algorithms, and system architecture.",
    aliases: ["CS", "Computing", "Software Engineering"],
    topics: [
      { name: "Data Structures: Arrays, Lists & Trees", category: "Data Structures & Algorithms", description: "Linked lists, binary search trees, AVL trees, and dynamic arrays." },
      { name: "Graph Algorithms & Traversal", category: "Data Structures & Algorithms", description: "BFS, DFS, Dijkstra's algorithm, Bellman-Ford, and Minimum Spanning Trees." },
      { name: "Sorting, Searching & Big-O Complexity", category: "Data Structures & Algorithms", description: "QuickSort, MergeSort, binary search, asymptotic time, and space complexity." },
      { name: "Dynamic Programming & Greedy Algorithms", category: "Data Structures & Algorithms", description: "Memoization, tabulating subproblems, knapsack problems, and greedy choice." },
      { name: "Operating Systems & Process Concurrency", category: "Systems & Architecture", description: "Process scheduling, thread synchronization, deadlocks, and semaphores." },
      { name: "Virtual Memory & Paging", category: "Systems & Architecture", description: "Paging algorithms, page faults, TLB, memory segmentation, and cache hierarchies." },
      { name: "Database Management Systems & SQL", category: "Databases & Systems", description: "Relational modeling, normalization (1NF-BCNF), ACID transactions, and indexing." },
      { name: "Computer Networks & TCP/IP Protocol Suite", category: "Networks & Security", description: "OSI 7-layer model, TCP three-way handshake, routing algorithms, and DNS." },
      { name: "Cybersecurity & Cryptography", category: "Networks & Security", description: "Public key cryptography (RSA), hashing, authentication protocols, and vulnerability analysis." },
      { name: "Artificial Intelligence & Machine Learning", category: "Intelligent Systems", description: "Supervised learning, neural networks, gradient descent, and heuristic search." },
      { name: "Object-Oriented Programming & Design Patterns", category: "Software Engineering", description: "Encapsulation, polymorphism, SOLID principles, Factory, and Singleton patterns." }
    ]
  },
  {
    name: "Mathematics",
    category: "Mathematics & Statistics",
    description: "Rigorous study of numbers, structures, continuous change, and geometric spaces.",
    aliases: ["Pure Mathematics", "Applied Mathematics", "Math"],
    topics: [
      { name: "Differential Calculus & Derivatives", category: "Calculus", description: "Limits, continuity, chain rule, implicit differentiation, and optimization." },
      { name: "Integral Calculus & Fundamental Theorem", category: "Calculus", description: "Definite and indefinite integrals, integration by parts, and substitution." },
      { name: "Multivariable Calculus & Partial Derivatives", category: "Calculus", description: "Gradient vectors, Lagrange multipliers, double/triple integrals, and Green's theorem." },
      { name: "Linear Algebra: Matrices & Vector Spaces", category: "Linear Algebra", description: "Matrix operations, determinants, vector spaces, basis, and linear transformations." },
      { name: "Eigenvalues, Eigenvectors & Diagonalization", category: "Linear Algebra", description: "Characteristic polynomials, eigenspaces, spectral theorem, and PCA foundations." },
      { name: "Ordinary Differential Equations (ODEs)", category: "Differential Equations", description: "First-order separable ODEs, linear second-order equations, and Laplace transforms." },
      { name: "Discrete Mathematics & Graph Theory", category: "Discrete Math", description: "Propositional logic, set theory, combinatorics, graph coloring, and trees." },
      { name: "Probability Theory & Random Variables", category: "Probability & Statistics", description: "Conditional probability, Bayes' theorem, Poisson, and Normal distributions." },
      { name: "Complex Analysis & Contour Integration", category: "Advanced Mathematics", description: "Cauchy-Riemann equations, analytic functions, residue theorem, and conformal mapping." },
      { name: "Abstract Algebra: Groups, Rings & Fields", category: "Advanced Mathematics", description: "Group axioms, subgroups, isomorphism theorems, ring homomorphisms, and Galois theory." }
    ]
  },
  {
    name: "Economics",
    category: "Humanities & Social Sciences",
    description: "Analysis of resource allocation, market dynamics, fiscal policies, and economic growth.",
    aliases: ["Macroeconomics", "Microeconomics", "Business Economics"],
    topics: [
      { name: "Supply, Demand & Market Equilibrium", category: "Microeconomics", description: "Price elasticity, consumer surplus, deadweight loss, and market clearing price." },
      { name: "Consumer Theory & Utility Maximization", category: "Microeconomics", description: "Indifference curves, budget constraints, marginal rate of substitution." },
      { name: "Market Structures: Monopoly & Perfect Competition", category: "Microeconomics", description: "Monopolistic competition, oligopoly game theory, Nash equilibrium, and price setting." },
      { name: "National Income Accounting & GDP", category: "Macroeconomics", description: "Nominal vs real GDP, inflation measurements, CPI, and GDP deflators." },
      { name: "Monetary Policy & Central Banking", category: "Macroeconomics", description: "Interest rates, reserve requirements, open market operations, and money supply." },
      { name: "Fiscal Policy, Taxation & Public Debt", category: "Macroeconomics", description: "Government spending multipliers, Keynesian vs classical views, and budget deficits." },
      { name: "International Trade & Exchange Rates", category: "International Economics", description: "Comparative advantage, tariffs, quotas, balance of payments, and currency valuation." },
      { name: "Econometrics & Regression Modeling", category: "Quantitative Economics", description: "OLS regression, multicollinearity, heteroskedasticity, and time-series analysis." }
    ]
  },
  {
    name: "History",
    category: "Humanities & Social Sciences",
    description: "Chronicle of human civilizations, geopolitical transformations, and socio-cultural shifts.",
    aliases: ["World History", "Modern History", "European History"],
    topics: [
      { name: "Ancient Civilizations: Mesopotamia & Egypt", category: "Ancient World", description: "Fertile crescent, hieroglyphs, early legal codes, and dynastic rule." },
      { name: "Classical Greece & the Roman Empire", category: "Classical Era", description: "Athenian democracy, Pax Romana, Roman law, and Mediterranean hegemony." },
      { name: "The Middle Ages & Feudalism", category: "Medieval History", description: "Manorialism, the Crusades, Magna Carta, and monastic scholarship." },
      { name: "The Renaissance & Scientific Revolution", category: "Early Modern Era", description: "Humanism, printing press, heliocentric model, and artistic rediscovery." },
      { name: "The Industrial Revolution & Modernization", category: "Modern Era", description: "Steam power, urbanization, labor movements, and capitalist expansion." },
      { name: "World War I & the League of Nations", category: "Contemporary Era", description: "Alliance systems, trench warfare, Treaty of Versailles, and post-war disruption." },
      { name: "World War II & the Holocaust", category: "Contemporary Era", description: "Rise of fascism, Blitzkrieg, Pacific/European theaters, and Allied victory." },
      { name: "The Cold War & Geopolitical Blocs", category: "Contemporary Era", description: "Nuclear proliferation, NATO vs Warsaw Pact, proxy wars, and dissolution of the USSR." }
    ]
  },
  {
    name: "Psychology",
    category: "Humanities & Social Sciences",
    description: "Scientific investigation of mental processes, behavioral patterns, and cognition.",
    aliases: ["Psychological Sciences", "Behavioral Science"],
    topics: [
      { name: "Biological Bases of Behavior", category: "Neuropsychology", description: "Neuron anatomy, neurotransmitters, brain lobes, and the endocrine system." },
      { name: "Sensation & Perception", category: "Cognitive Psychology", description: "Sensory thresholds, Gestalt principles, depth perception, and sensory adaptation." },
      { name: "Learning & Conditioning: Classical & Operant", category: "Behavioral Psychology", description: "Pavlovian conditioning, Skinnerian reinforcement schedules, and behavior modification." },
      { name: "Memory Systems: Encoding, Storage & Retrieval", category: "Cognitive Psychology", description: "Working memory, episodic vs semantic memory, forgetting curves, and mnemonic strategies." },
      { name: "Developmental Psychology & Life Stages", category: "Developmental Psychology", description: "Piaget's cognitive stages, Erikson's psychosocial crises, and attachment theory." },
      { name: "Social Psychology & Group Dynamics", category: "Social Psychology", description: "Conformity (Asch), obedience (Milgram), bystander effect, and cognitive dissonance." },
      { name: "Psychological Disorders & DSM-5 Classification", category: "Clinical Psychology", description: "Anxiety disorders, mood disorders, schizophrenia, and diagnostic criteria." },
      { name: "Therapeutic Approaches: CBT & Psychodynamic", category: "Clinical Psychology", description: "Cognitive-behavioral therapy, psychoanalysis, humanistic therapy, and pharmacological treatments." }
    ]
  }
];

// Helper: Levenshtein Distance for typo detection
export function levenshteinDistance(s1: string, s2: string): number {
  const a = s1.toLowerCase();
  const b = s2.toLowerCase();
  const m = a.length;
  const n = b.length;

  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = [];
  for (let i = 0; i <= m; i++) {
    dp[i] = [i];
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,       // deletion
        dp[i][j - 1] + 1,       // insertion
        dp[i - 1][j - 1] + cost  // substitution
      );

      // Transposition check (Damerau-Levenshtein)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
      }
    }
  }

  return dp[m][n];
}

// Calculate match score between query and candidate string
export function calculateMatchScore(query: string, candidate: string, aliases: string[] = []): { score: number; isTypoCorrection: boolean } {
  const q = query.trim().toLowerCase();
  const c = candidate.trim().toLowerCase();

  if (!q) return { score: 1.0, isTypoCorrection: false };
  if (q === c) return { score: 1.0, isTypoCorrection: false };

  // Check aliases first
  for (const alias of aliases) {
    const a = alias.toLowerCase();
    if (a === q || a.startsWith(q)) {
      return { score: 0.98, isTypoCorrection: false };
    }
  }

  // Exact prefix match
  if (c.startsWith(q)) {
    return { score: 0.95 - (c.length - q.length) * 0.005, isTypoCorrection: false };
  }

  // Substring match
  if (c.includes(q)) {
    return { score: 0.88, isTypoCorrection: false };
  }

  // Word token matching
  const cWords = c.split(/[\s:,\-]+/).filter(Boolean);
  const qWords = q.split(/[\s:,\-]+/).filter(Boolean);

  let bestWordScore = 0;
  for (const qw of qWords) {
    for (const cw of cWords) {
      if (cw === qw) {
        bestWordScore = Math.max(bestWordScore, 0.9);
      } else if (cw.startsWith(qw)) {
        bestWordScore = Math.max(bestWordScore, 0.85);
      } else {
        const wDist = levenshteinDistance(qw, cw);
        const maxLen = Math.max(qw.length, cw.length);
        if (maxLen > 3 && wDist <= 2) {
          const wSim = 1 - wDist / maxLen;
          if (wSim > 0.65) {
            bestWordScore = Math.max(bestWordScore, wSim * 0.82);
          }
        }
      }
    }
  }

  // Overall string Levenshtein distance
  const dist = levenshteinDistance(q, c);
  const maxLen = Math.max(q.length, c.length);
  const sim = 1 - dist / maxLen;

  // Typo tolerance condition: high similarity despite not being an exact substring
  const isTypo = (dist <= 2 && q.length >= 4) || (dist <= 3 && q.length >= 7) || (sim > 0.65 && q.length >= 4);

  const finalScore = Math.max(bestWordScore, isTypo ? sim * 0.84 : 0);
  return {
    score: Math.min(1.0, Math.max(0, finalScore)),
    isTypoCorrection: isTypo && !c.includes(q)
  };
}

// Find closest matching subject in catalog
export function resolveSubject(subjectInput: string): CatalogSubject | null {
  if (!subjectInput || !subjectInput.trim()) return null;
  const input = subjectInput.trim().toLowerCase();

  // 1. Direct or alias match
  for (const s of ACADEMIC_CATALOG) {
    if (s.name.toLowerCase() === input) return s;
    if (s.aliases?.some(a => a.toLowerCase() === input)) return s;
  }

  // 2. Prefix or substring match
  for (const s of ACADEMIC_CATALOG) {
    if (s.name.toLowerCase().startsWith(input) || input.startsWith(s.name.toLowerCase())) return s;
    if (s.aliases?.some(a => a.toLowerCase().startsWith(input))) return s;
  }

  // 3. Typo-tolerant best match
  let bestMatch: CatalogSubject | null = null;
  let highestScore = 0;

  for (const s of ACADEMIC_CATALOG) {
    const { score } = calculateMatchScore(input, s.name, s.aliases);
    if (score > highestScore && score >= 0.55) {
      highestScore = score;
      bestMatch = s;
    }
  }

  return bestMatch;
}

// Get categorized subject suggestions
export function getSubjectSuggestions(query: string = "", limit: number = 8): SuggestionResponse {
  const cleanQuery = query.trim();

  let scoredSubjects = ACADEMIC_CATALOG.map(subject => {
    const { score, isTypoCorrection } = calculateMatchScore(cleanQuery, subject.name, subject.aliases);
    return {
      value: subject.name,
      category: subject.category,
      matchScore: cleanQuery ? score : 1.0,
      description: subject.description,
      isTypoCorrection: cleanQuery ? isTypoCorrection : false
    };
  });

  if (cleanQuery) {
    scoredSubjects = scoredSubjects.filter(item => item.matchScore > 0.4);
    scoredSubjects.sort((a, b) => b.matchScore - a.matchScore);
  }

  const results = scoredSubjects.slice(0, limit);
  const categories = Array.from(new Set(results.map(r => r.category)));
  const topCorrection = results.find(r => r.isTypoCorrection)?.value;

  return {
    query: cleanQuery,
    type: "subject",
    correctedQuery: topCorrection,
    categories,
    suggestions: results
  };
}

// Get categorized topic suggestions dynamically linked to the subject
export function getTopicSuggestions(subjectInput: string = "", query: string = "", limit: number = 10): SuggestionResponse {
  const cleanSubject = subjectInput.trim();
  const cleanQuery = query.trim();

  const resolved = resolveSubject(cleanSubject);
  let candidateTopics: CatalogTopic[] = [];

  if (resolved) {
    candidateTopics = resolved.topics;
  } else if (!cleanSubject) {
    // If no subject entered, offer cross-disciplinary popular topics
    candidateTopics = ACADEMIC_CATALOG.flatMap(s => s.topics);
  } else {
    // Subject is custom or not in catalog; gather all topics and search by query
    candidateTopics = ACADEMIC_CATALOG.flatMap(s => s.topics);
  }

  let scoredTopics = candidateTopics.map(topic => {
    const { score, isTypoCorrection } = calculateMatchScore(cleanQuery, topic.name, topic.keywords);
    return {
      value: topic.name,
      category: topic.category,
      matchScore: cleanQuery ? score : 1.0,
      description: topic.description,
      isTypoCorrection: cleanQuery ? isTypoCorrection : false
    };
  });

  if (cleanQuery) {
    scoredTopics = scoredTopics.filter(item => item.matchScore > 0.4);
    scoredTopics.sort((a, b) => b.matchScore - a.matchScore);
  }

  const results = scoredTopics.slice(0, limit);
  const categories = Array.from(new Set(results.map(r => r.category)));
  const topCorrection = results.find(r => r.isTypoCorrection)?.value;

  return {
    query: cleanQuery,
    type: "topic",
    resolvedSubject: resolved ? resolved.name : cleanSubject || undefined,
    correctedQuery: topCorrection,
    categories,
    suggestions: results
  };
}
