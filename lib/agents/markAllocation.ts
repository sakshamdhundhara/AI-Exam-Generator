import type { Question, QuestionType, ExamFormValues, MarksDistributionRow } from "../types.ts";

export interface TypeAllocationPlan {
  type: QuestionType;
  count: number;
  marksEach: number[];
  sectionTotal: number;
}

export interface ExamMarkPlan {
  totalQuestions: number;
  totalMarks: number;
  allocations: TypeAllocationPlan[];
  promptInstructions: string;
}

/**
 * Plans the ideal distribution of question counts and marks by type
 * enforcing:
 * - MCQ / TRUE_FALSE / FILL_BLANK: 1-2 marks each
 * - SHORT_ANSWER: 5 marks each
 * - LONG_ANSWER: 10+ marks each
 * - Sum of all marks === totalMarks
 */
export function planMarkDistribution(params: ExamFormValues): ExamMarkPlan {
  const totalQuestions = Math.max(1, params.numQuestions || 10);
  const totalMarks = Math.max(totalQuestions, params.totalMarks || 100);
  const types: QuestionType[] = params.questionTypes && params.questionTypes.length > 0 
    ? params.questionTypes 
    : ["MCQ", "SHORT_ANSWER"];

  const hasMCQ = types.includes("MCQ") || types.includes("TRUE_FALSE") || types.includes("FILL_BLANK");
  const hasShort = types.includes("SHORT_ANSWER");
  const hasLong = types.includes("LONG_ANSWER");

  // Determine initial question count weighting
  const weights: Record<string, number> = {};
  for (const t of types) {
    if (t === "MCQ" || t === "TRUE_FALSE" || t === "FILL_BLANK") weights[t] = 5;
    else if (t === "SHORT_ANSWER") weights[t] = 3;
    else if (t === "LONG_ANSWER") weights[t] = 2;
    else weights[t] = 2;
  }

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const counts: Record<string, number> = {};
  let assignedCount = 0;

  for (let i = 0; i < types.length; i++) {
    const t = types[i];
    if (i === types.length - 1) {
      counts[t] = Math.max(1, totalQuestions - assignedCount);
    } else {
      const c = Math.max(1, Math.round((weights[t] / totalWeight) * totalQuestions));
      counts[t] = c;
      assignedCount += c;
    }
  }

  // Adjust if assignedCount !== totalQuestions
  const countDiff = totalQuestions - Object.values(counts).reduce((a, b) => a + b, 0);
  if (countDiff !== 0) {
    const primaryType = types[0];
    counts[primaryType] = Math.max(1, counts[primaryType] + countDiff);
  }

  // Assign marks to each question
  const questionsMarks: Record<string, number[]> = {};
  for (const t of types) {
    const qCount = counts[t] || 1;
    if (t === "MCQ" || t === "TRUE_FALSE" || t === "FILL_BLANK") {
      // Default to 1-2 marks
      questionsMarks[t] = new Array(qCount).fill(2);
    } else if (t === "SHORT_ANSWER") {
      // Exactly 5 marks
      questionsMarks[t] = new Array(qCount).fill(5);
    } else if (t === "LONG_ANSWER") {
      // 10+ marks
      questionsMarks[t] = new Array(qCount).fill(10);
    } else {
      questionsMarks[t] = new Array(qCount).fill(5);
    }
  }

  // Balance total marks
  let currentSum = 0;
  for (const t of types) {
    currentSum += questionsMarks[t].reduce((a, b) => a + b, 0);
  }

  let markDiff = totalMarks - currentSum;

  if (markDiff > 0) {
    // We need more marks.
    // 1. Long answer questions get increased first (10+ marks rule: 10 -> 12, 15, etc.)
    if (hasLong && counts["LONG_ANSWER"] > 0) {
      const longList = questionsMarks["LONG_ANSWER"];
      let idx = 0;
      while (markDiff > 0) {
        longList[idx % longList.length] += 1;
        markDiff -= 1;
        idx++;
      }
    } else if (hasShort && counts["SHORT_ANSWER"] > 0 && !hasLong) {
      // If no long answers, distribute evenly across short answers
      const shortList = questionsMarks["SHORT_ANSWER"];
      let idx = 0;
      while (markDiff > 0) {
        shortList[idx % shortList.length] += 1;
        markDiff -= 1;
        idx++;
      }
    } else {
      // Upgrade MCQs from 1 to 2 marks if any are 1, or distribute across primary
      const primaryList = questionsMarks[types[0]];
      let idx = 0;
      while (markDiff > 0) {
        primaryList[idx % primaryList.length] += 1;
        markDiff -= 1;
        idx++;
      }
    }
  } else if (markDiff < 0) {
    // We have too many marks.
    // 1. If MCQs are at 2 marks, reduce to 1 mark (within 1-2 rule)
    for (const t of types) {
      if (t === "MCQ" || t === "TRUE_FALSE" || t === "FILL_BLANK") {
        const mcqList = questionsMarks[t];
        for (let i = 0; i < mcqList.length && markDiff < 0; i++) {
          if (mcqList[i] > 1) {
            mcqList[i] -= 1;
            markDiff += 1;
          }
        }
      }
    }

    // 2. If long answers are > 10, reduce towards 10 (never below 10)
    if (markDiff < 0 && hasLong) {
      const longList = questionsMarks["LONG_ANSWER"];
      for (let i = 0; i < longList.length && markDiff < 0; i++) {
        if (longList[i] > 10) {
          longList[i] -= 1;
          markDiff += 1;
        }
      }
    }
  }

  const allocations: TypeAllocationPlan[] = types.map(t => {
    const list = questionsMarks[t] || [];
    return {
      type: t,
      count: list.length,
      marksEach: list,
      sectionTotal: list.reduce((a, b) => a + b, 0)
    };
  });

  // Build prompt instructions for LLM
  const instructionsLines = allocations.map(a => {
    const avg = (a.sectionTotal / a.count).toFixed(1).replace(/\.0$/, "");
    const range = a.marksEach.every(m => m === a.marksEach[0])
      ? `${a.marksEach[0]} marks each`
      : `${Math.min(...a.marksEach)}-${Math.max(...a.marksEach)} marks each`;
    return `- ${a.count} ${a.type} questions: ${range} (Section Total: ${a.sectionTotal} marks)`;
  });

  const promptInstructions = `
DYNAMIC QUESTION-TYPE MARK ALLOCATION (STRICT REQUIREMENT):
${instructionsLines.join("\n")}
Total Marks for all ${totalQuestions} questions combined must equal EXACTLY ${totalMarks}.

Specific Type Rules:
- Multiple-Choice Questions (MCQ / TRUE_FALSE / FILL_BLANK): Must be 1 to 2 marks each.
- Short-Answer Questions (SHORT_ANSWER): Must be 5 marks each.
- Long-Answer Questions (LONG_ANSWER): Must be 10+ marks each (e.g., 10, 12, 15 marks).
`;

  return {
    totalQuestions,
    totalMarks,
    allocations,
    promptInstructions
  };
}

/**
 * Reconciles and validates question marks on generated draft questions
 * ensuring exact alignment with configured exam total marks and strict type rules.
 */
export function reconcileQuestionMarks(questions: Question[], targetTotal: number): Question[] {
  if (!questions || questions.length === 0) return [];

  // Pass 1: Clamp and conform to type rules
  for (const q of questions) {
    const t = q.type;
    const current = Number(q.marks) || 1;

    if (t === "MCQ" || t === "TRUE_FALSE" || t === "FILL_BLANK") {
      // Rule: 1-2 marks per MCQ
      q.marks = Math.max(1, Math.min(2, Math.round(current)));
    } else if (t === "SHORT_ANSWER") {
      // Rule: 5 marks per short answer
      q.marks = 5;
    } else if (t === "LONG_ANSWER") {
      // Rule: 10+ marks per long answer
      q.marks = Math.max(10, Math.round(current));
    } else {
      q.marks = Math.max(1, Math.round(current));
    }
  }

  // Pass 2: Calculate difference with target total marks
  let currentTotal = questions.reduce((acc, q) => acc + (q.marks || 0), 0);
  let diff = targetTotal - currentTotal;

  if (diff === 0) return questions;

  const longQs = questions.filter(q => q.type === "LONG_ANSWER");
  const shortQs = questions.filter(q => q.type === "SHORT_ANSWER");
  const mcqQs = questions.filter(q => q.type === "MCQ" || q.type === "TRUE_FALSE" || q.type === "FILL_BLANK");

  if (diff > 0) {
    // Need more marks:
    // 1. First add to Long Answer (10+ marks rule)
    if (longQs.length > 0) {
      let idx = 0;
      while (diff > 0) {
        longQs[idx % longQs.length].marks += 1;
        diff -= 1;
        idx++;
      }
    } else if (mcqQs.some(q => q.marks === 1)) {
      // 2. Upgrade 1-mark MCQs to 2-mark MCQs
      for (const q of mcqQs) {
        if (diff > 0 && q.marks === 1) {
          q.marks = 2;
          diff -= 1;
        }
      }
    }

    // 3. If still needed, distribute across Short Answer
    if (diff > 0 && shortQs.length > 0) {
      let idx = 0;
      while (diff > 0) {
        shortQs[idx % shortQs.length].marks += 1;
        diff -= 1;
        idx++;
      }
    } else if (diff > 0 && questions.length > 0) {
      // Fallback: distribute across last questions
      let idx = 0;
      while (diff > 0) {
        questions[idx % questions.length].marks += 1;
        diff -= 1;
        idx++;
      }
    }
  } else if (diff < 0) {
    // Need fewer marks:
    // 1. Reduce Long Answers if > 10 (keeping >= 10)
    for (const q of longQs) {
      while (diff < 0 && q.marks > 10) {
        q.marks -= 1;
        diff += 1;
      }
    }

    // 2. Reduce MCQs from 2 to 1 (keeping >= 1)
    for (const q of mcqQs) {
      if (diff < 0 && q.marks > 1) {
        q.marks = 1;
        diff += 1;
      }
    }

    // 3. If still need reduction and Short Answers > 4
    for (const q of shortQs) {
      if (diff < 0 && q.marks > 4) {
        q.marks -= 1;
        diff += 1;
      }
    }
  }

  // Final sanity check
  const finalSum = questions.reduce((acc, q) => acc + (q.marks || 0), 0);
  const finalDiff = targetTotal - finalSum;
  if (finalDiff !== 0 && questions.length > 0) {
    // Prefer adjusting long answer, then short answer
    const targetQ = longQs[0] || shortQs[0] || questions[questions.length - 1];
    targetQ.marks = Math.max(1, targetQ.marks + finalDiff);
  }

  return questions;
}

/**
 * Generates the official Marks Distribution metadata table for sections
 */
export function buildMarksDistributionTable(sections: { title: string; questions: Question[]; marks: number }[]): MarksDistributionRow[] {
  return sections.map((sec, idx) => {
    const qCount = sec.questions.length;
    const marksList = sec.questions.map(q => q.marks);
    const minM = Math.min(...marksList);
    const maxM = Math.max(...marksList);
    const eachStr = minM === maxM ? `${minM}` : `${minM}-${maxM}`;

    const typeName = sec.questions[0]?.type || "Mixed";
    let desc = "Assessment questions";
    if (typeName === "MCQ") desc = "Multiple choice objective questions";
    else if (typeName === "SHORT_ANSWER") desc = "Short conceptual explanations";
    else if (typeName === "LONG_ANSWER") desc = "Comprehensive analytical answers";
    else if (typeName === "TRUE_FALSE") desc = "True / False conceptual validation";
    else if (typeName === "FILL_BLANK") desc = "Fill in the blank questions";

    return {
      section: String.fromCharCode(65 + idx), // A, B, C, ...
      description: desc,
      count: `${qCount}`,
      each: eachStr,
      total: `${sec.marks}`
    };
  });
}
