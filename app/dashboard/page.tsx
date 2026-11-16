import { getExams } from "@/lib/actions/exam";
import Link from "next/link";
import styles from "./page.module.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { ExamHistoryList } from "@/components/ExamHistoryList";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const exams = await getExams();
  const aiConfigured = Boolean(process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>Generated Exam History</h1>
            <p style={{ color: "#94a3b8", margin: "4px 0 0 0", fontSize: "0.95rem" }}>
              Welcome back, {session.user?.name || session.user?.email}! Browse, view, print, and manage your AI-generated exam papers.
            </p>
          </div>
          <Link href="/generate" className={styles.primaryButton}>
            ⚡ Generate New Exam
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <ExamHistoryList initialExams={exams} aiConfigured={aiConfigured} />
      </main>
    </div>
  );
}
