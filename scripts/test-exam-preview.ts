import { examGraph } from "../lib/agents/examGraph.ts";
import type { ExamFormValues } from "../lib/types.ts";

async function run() {
  console.log("Starting test exam generation through examGraph...");
  const params: ExamFormValues = {
    subject: "Physics",
    topics: ["Mechanics", "Optics"],
    difficultyLevel: "MIXED",
    questionTypes: ["MCQ", "SHORT_ANSWER", "LONG_ANSWER"],
    numQuestions: 10,
    totalMarks: 50,
    timeLimit: 120,
    instituteName: "Institute of Academic Excellence",
    examType: "Mid-Term Examination",
    course: "Bachelor of Science in Physics",
    subjectCode: "PHY-201",
    semester: "III"
  };

  const startTime = Date.now();
  console.log("Invoking examGraph stream...");

  const stream = await examGraph.stream({
    params,
    webContext: [],
    draftQuestions: [],
    reviewFeedback: null,
    finalExam: null,
    revisionCount: 0,
    error: null,
    step: "INIT"
  });

  for await (const chunk of stream) {
    const nodeName = Object.keys(chunk)[0];
    const data = (chunk as any)[nodeName];
    console.log(`[${Math.round((Date.now() - startTime) / 1000)}s] Step: ${data.step || nodeName}`);
    if (data.finalExam) {
      console.log("\n================ GENERATION RESULT ================");
      console.log("Title:", data.finalExam.metadata?.course);
      console.log("Total Marks:", data.finalExam.totalMarks);
      console.log("Sections count:", data.finalExam.sections.length);
      let totalQuestions = 0;
      let computedTotalMarks = 0;
      for (const sec of data.finalExam.sections) {
        console.log(`\n--- ${sec.title} (Marks: ${sec.marks}) ---`);
        for (const q of sec.questions) {
          totalQuestions++;
          computedTotalMarks += q.marks;
          console.log(`[${q.id}] (${q.type}, ${q.marks} marks, ${q.difficulty}): ${q.text.substring(0, 80)}...`);
        }
      }
      console.log("\nTotal Questions:", totalQuestions);
      console.log("Calculated Total Marks:", computedTotalMarks);
      console.log("Matches Requested Total (50):", computedTotalMarks === 50);
    }
  }
}

run().catch(err => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
