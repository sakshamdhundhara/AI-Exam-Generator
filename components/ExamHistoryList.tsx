"use client";

import { useState } from "react";
import { deleteExam } from "@/lib/actions/exam";
import { ExamPreview } from "./ExamPreview";
import { ExamDocument } from "@/lib/types";

interface ExamRecord {
  id: string;
  subject: string;
  totalMarks: number;
  numQuestions: number;
  difficulty: string;
  timeLimit: number | null;
  topics: string;
  questionTypes: string;
  content: string;
  status: string;
  createdAt: Date;
}

interface ExamHistoryListProps {
  initialExams: ExamRecord[];
  aiConfigured: boolean;
}

export function ExamHistoryList({ initialExams, aiConfigured }: ExamHistoryListProps) {
  const [exams, setExams] = useState<ExamRecord[]>(initialExams);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("ALL");
  const [selectedExamDoc, setSelectedExamDoc] = useState<ExamDocument | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const filteredExams = exams.filter((exam) => {
    const matchesSearch = exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.topics.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDiff = selectedDifficulty === "ALL" || exam.difficulty === selectedDifficulty;
    return matchesSearch && matchesDiff;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this exam paper from history?")) return;
    try {
      setIsDeletingId(id);
      await deleteExam(id);
      setExams((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      alert("Failed to delete exam: " + err.message);
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleViewExam = (exam: ExamRecord) => {
    try {
      const parsedDoc = JSON.parse(exam.content) as ExamDocument;
      setSelectedExamDoc(parsedDoc);
    } catch (err) {
      alert("Failed to parse exam content.");
    }
  };

  const parseTopics = (topicsStr: string): string[] => {
    try {
      const res = JSON.parse(topicsStr);
      return Array.isArray(res) ? res : [topicsStr];
    } catch {
      return [topicsStr];
    }
  };

  const totalQuestionsSum = exams.reduce((sum, e) => sum + e.numQuestions, 0);

  return (
    <div>
      {/* Stats Summary Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: "clamp(12px, 2vw, 16px)", marginBottom: "32px" }}>
        <div style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "12px", padding: "clamp(16px, 3vw, 20px)" }}>
          <div style={{ color: "#94a3b8", fontSize: "0.82rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total Exams Generated</div>
          <div style={{ fontSize: "clamp(1.6rem, 4vw, 2rem)", fontWeight: "700", color: "#60a5fa", marginTop: "4px" }}>{exams.length}</div>
        </div>
        <div style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "12px", padding: "clamp(16px, 3vw, 20px)" }}>
          <div style={{ color: "#94a3b8", fontSize: "0.82rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Questions Created</div>
          <div style={{ fontSize: "clamp(1.6rem, 4vw, 2rem)", fontWeight: "700", color: "#34d399", marginTop: "4px" }}>{totalQuestionsSum}</div>
        </div>
        <div style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "12px", padding: "clamp(16px, 3vw, 20px)" }}>
          <div style={{ color: "#94a3b8", fontSize: "0.82rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>AI Engine Status</div>
          <div style={{ fontSize: "clamp(1rem, 2.5vw, 1.2rem)", fontWeight: "600", color: "#a78bfa", marginTop: "8px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: aiConfigured ? "#10b981" : "#ef4444", display: "inline-block", flexShrink: 0 }}></span>
            <span>{aiConfigured ? "Gemini API key active" : "Gemini API key missing"}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
        <input 
          type="text" 
          placeholder="🔍 Search history by subject or topic..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: "1 1 260px",
            width: "100%",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "8px",
            padding: "10px 16px",
            color: "#f8fafc",
            outline: "none",
            fontSize: "0.95rem",
            minHeight: "44px"
          }}
        />
        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.85rem", color: "#94a3b8", marginRight: "4px" }}>Difficulty:</span>
          {["ALL", "EASY", "MEDIUM", "HARD", "MIXED"].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              style={{
                background: selectedDifficulty === diff ? "#3b82f6" : "rgba(255, 255, 255, 0.06)",
                color: selectedDifficulty === diff ? "#ffffff" : "#cbd5e1",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "6px",
                padding: "6px 12px",
                fontSize: "0.82rem",
                cursor: "pointer",
                fontWeight: "500",
                minHeight: "36px"
              }}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* History Grid */}
      {filteredExams.length === 0 ? (
        <div style={{ textTransform: "none", textAlign: "center", padding: "60px 20px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "16px", border: "1px dashed rgba(255, 255, 255, 0.1)" }}>
          <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>No exam paper history found matching your filters.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))", gap: "clamp(14px, 2.5vw, 20px)" }}>
          {filteredExams.map((exam) => {
            const topicsList = parseTopics(exam.topics);
            const formattedDate = new Date(exam.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            });

            return (
              <div 
                key={exam.id}
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "transform 0.2s, border-color 0.2s"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#f8fafc", margin: 0 }}>
                      {exam.subject}
                    </h3>
                    <span style={{
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      padding: "4px 10px",
                      borderRadius: "9999px",
                      background: exam.difficulty === "EASY" ? "rgba(16, 185, 129, 0.2)" : exam.difficulty === "MEDIUM" ? "rgba(59, 130, 246, 0.2)" : exam.difficulty === "HARD" ? "rgba(249, 115, 22, 0.2)" : "rgba(168, 85, 247, 0.2)",
                      color: exam.difficulty === "EASY" ? "#34d399" : exam.difficulty === "MEDIUM" ? "#60a5fa" : exam.difficulty === "HARD" ? "#fb923c" : "#c084fc"
                    }}>
                      {exam.difficulty}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "16px", fontSize: "0.9rem", color: "#cbd5e1", marginBottom: "12px" }}>
                    <div>📝 <strong>{exam.numQuestions}</strong> Questions</div>
                    <div>🎯 <strong>{exam.totalMarks}</strong> Marks</div>
                    <div>⏱️ <strong>{exam.timeLimit || 60}</strong> Mins</div>
                  </div>

                  {/* Topics Chips */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                    {topicsList.slice(0, 3).map((topic, i) => (
                      <span key={i} style={{ background: "rgba(255, 255, 255, 0.08)", color: "#94a3b8", fontSize: "0.78rem", padding: "2px 8px", borderRadius: "4px" }}>
                        {topic}
                      </span>
                    ))}
                    {topicsList.length > 3 && (
                      <span style={{ fontSize: "0.78rem", color: "#64748b", padding: "2px 4px" }}>
                        +{topicsList.length - 3} more
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "16px" }}>
                    Generated: {formattedDate}
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ display: "flex", gap: "10px", borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "14px" }}>
                  <button 
                    onClick={() => handleViewExam(exam)}
                    style={{
                      flex: 1,
                      background: "#3b82f6",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      fontSize: "0.88rem",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    👁️ View Exam Paper
                  </button>
                  <button 
                    onClick={() => handleDelete(exam.id)}
                    disabled={isDeletingId === exam.id}
                    style={{
                      background: "rgba(239, 68, 68, 0.15)",
                      color: "#f87171",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      fontSize: "0.88rem",
                      cursor: "pointer"
                    }}
                  >
                    {isDeletingId === exam.id ? "Deleting..." : "🗑️"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for viewing exam document */}
      {selectedExamDoc && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(6px)",
            zIndex: 1000,
            overflowY: "auto",
            padding: "clamp(10px, 3vw, 24px)"
          }}
        >
          <div style={{ maxWidth: "860px", margin: "0 auto", position: "relative", width: "100%" }}>
            <button 
              onClick={() => setSelectedExamDoc(null)}
              style={{
                position: "sticky",
                top: "12px",
                float: "right",
                zIndex: 1010,
                background: "#ef4444",
                color: "#ffffff",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                fontSize: "1.2rem",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              aria-label="Close modal"
            >
              ✕
            </button>
            <ExamPreview 
              exam={selectedExamDoc}
              onSave={async () => { alert("Exam is already saved in history!"); }}
              onRegenerate={() => { setSelectedExamDoc(null); }}
              onExport={() => { window.print(); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
