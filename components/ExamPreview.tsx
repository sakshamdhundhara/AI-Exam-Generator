"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ExamDocument } from "@/lib/types";

interface ExamPreviewProps {
  exam: ExamDocument;
  onSave: (exam: ExamDocument) => Promise<void>;
  onRegenerate: () => void;
  onExport: (format: "PDF" | "PRINT") => void;
}

export function ExamPreview({ exam, onSave, onRegenerate, onExport }: ExamPreviewProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError("");
      await onSave(exam);
    } catch (err: any) {
      setSaveError(err.message || "Failed to save exam");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setIsDownloadingPDF(true);
      const element = document.getElementById("exam-paper-printable");
      if (!element) {
        onExport("PRINT");
        return;
      }

      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const safeSubject = (exam.metadata?.subject || "Exam").replace(/[^a-zA-Z0-9]/g, "_");
      pdf.save(`${safeSubject}_Exam.pdf`);
    } catch (err: any) {
      console.error("PDF generation failed, falling back to window.print():", err);
      if (typeof window !== "undefined") {
        window.print();
      }
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="exam-preview-container"
      style={{ maxWidth: "840px", margin: "24px auto", width: "100%" }}
    >
      <div className="no-print glass-panel" style={{ padding: "clamp(12px, 3vw, 18px)", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <h3 className="text-gradient" style={{ fontSize: "clamp(1.15rem, 3vw, 1.4rem)", margin: 0 }}>Exam Paper Preview</h3>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <button className="btn-secondary" onClick={() => setShowAnswerKey(!showAnswerKey)} style={{ minHeight: "40px", fontSize: "0.85rem", padding: "8px 14px" }}>
            {showAnswerKey ? "🔒 Hide Answer Key" : "🔑 Show Answer Key"}
          </button>
          <button className="btn-secondary" onClick={onRegenerate} style={{ minHeight: "40px", fontSize: "0.85rem", padding: "8px 14px" }}>
            🔄 Generate Another
          </button>
          <button className="btn-secondary" onClick={handleDownloadPDF} disabled={isDownloadingPDF} style={{ minHeight: "40px", fontSize: "0.85rem", padding: "8px 14px" }}>
            {isDownloadingPDF ? "Generating PDF..." : "📥 Download PDF"}
          </button>
          <button className="btn-secondary" onClick={() => window.print()} style={{ minHeight: "40px", fontSize: "0.85rem", padding: "8px 14px" }}>
            🖨️ Print
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={isSaving} style={{ minHeight: "40px", fontSize: "0.85rem", padding: "8px 16px" }}>
            {isSaving ? "Saving..." : "Save to Dashboard"}
          </button>
        </div>
      </div>

      {saveError && (
        <div className="no-print" style={{ color: "var(--error-color)", marginBottom: "16px", padding: "10px 14px", background: "rgba(239, 68, 68, 0.1)", borderRadius: "var(--border-radius-sm)" }}>
          {saveError}
        </div>
      )}

      {/* Printable Professional Exam Paper */}
      <div 
        id="exam-paper-printable"
        className="exam-paper" 
        style={{ 
          background: "white", 
          color: "#111827", 
          padding: "clamp(20px, 4.5vw, 48px)", 
          borderRadius: "var(--border-radius-sm)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          fontFamily: "'Inter', sans-serif",
          width: "100%",
          boxSizing: "border-box"
        }}
      >
        {/* Header Block */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h1 style={{ fontSize: "clamp(1.25rem, 3.5vw, 1.75rem)", fontWeight: "700", color: "#1a2b4c", letterSpacing: "0.5px", marginBottom: "4px", lineHeight: "1.25" }}>
            {exam.metadata?.instituteName || "GREEN VALLEY INSTITUTE OF TECHNOLOGY"}
          </h1>
          <div style={{ fontSize: "clamp(0.8rem, 2vw, 0.9rem)", color: "#555555", fontStyle: "italic", marginBottom: "12px" }}>
            {exam.metadata?.tagline || "(Sample / Specimen Paper — For Practice Only)"}
          </div>
          <div style={{ height: "2px", background: "#1a2b4c", margin: "12px 0" }} />
          
          <h2 style={{ fontSize: "clamp(1.1rem, 2.8vw, 1.35rem)", color: "#1a2b4c", fontWeight: "600", marginBottom: "6px" }}>
            {exam.metadata?.examType || "End-Semester Examination"}
          </h2>
          <div style={{ fontSize: "clamp(0.88rem, 2vw, 1rem)", color: "#333333", marginBottom: "4px" }}>
            <strong>Course:</strong> {exam.metadata?.course || "B.Tech Computer Science & Engineering"}
          </div>
          <div style={{ fontSize: "clamp(0.88rem, 2vw, 1rem)", color: "#333333", marginBottom: "16px" }}>
            <strong>Subject:</strong> {exam.metadata?.subject} {exam.metadata?.subjectCode ? `(${exam.metadata.subjectCode})` : ""}
          </div>
        </div>

        {/* Info Table with Responsive Wrapper */}
        <div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", marginBottom: "20px" }}>
          <table style={{ width: "100%", minWidth: "460px", borderCollapse: "collapse", fontSize: "0.92rem" }}>
            <tbody>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "6px 8px", fontWeight: "bold", width: "18%" }}>Time Allowed:</td>
                <td style={{ padding: "6px 8px", width: "32%" }}>{exam.metadata?.timeAllowed || (exam.timeLimit ? `${Math.round(exam.timeLimit / 60)} Hours` : "3 Hours")}</td>
                <td style={{ padding: "6px 8px", fontWeight: "bold", width: "20%" }}>Maximum Marks:</td>
                <td style={{ padding: "6px 8px", width: "30%" }}>{exam.totalMarks}</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "6px 8px", fontWeight: "bold" }}>Semester:</td>
                <td style={{ padding: "6px 8px" }}>{exam.metadata?.semester || "V"}</td>
                <td style={{ padding: "6px 8px", fontWeight: "bold" }}>Date:</td>
                <td style={{ padding: "6px 8px" }}>___________</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "6px 8px", fontWeight: "bold" }}>Roll No.:</td>
                <td style={{ padding: "6px 8px" }}>___________</td>
                <td style={{ padding: "6px 8px", fontWeight: "bold" }}>Set:</td>
                <td style={{ padding: "6px 8px" }}>{exam.metadata?.examSet || "A"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* General Instructions */}
        {exam.instructions && exam.instructions.length > 0 && (
          <div style={{ marginBottom: "24px", background: "#f8fafc", padding: "clamp(12px, 3vw, 18px)", borderRadius: "6px", borderLeft: "4px solid #1a2b4c" }}>
            <h3 style={{ fontSize: "1rem", color: "#1a2b4c", fontWeight: "700", marginBottom: "8px" }}>General Instructions</h3>
            <ol style={{ paddingLeft: "20px", margin: "0", fontSize: "0.9rem", color: "#334155" }}>
              {exam.instructions.map((inst, i) => (
                <li key={i} style={{ marginBottom: "4px", lineHeight: "1.5" }}>{inst}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Marks Distribution Table with Responsive Horizontal Scroll */}
        {((exam.metadata?.marksDistribution && exam.metadata.marksDistribution.length > 0) || (exam.sections && exam.sections.length > 0)) && (
          <div style={{ marginBottom: "32px" }}>
            <h3 style={{ fontSize: "1rem", color: "#1a2b4c", fontWeight: "700", marginBottom: "10px" }}>Marks Distribution</h3>
            <div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", borderRadius: "4px" }}>
              <table style={{ width: "100%", minWidth: "480px", borderCollapse: "collapse", fontSize: "0.88rem", border: "1px solid #cbd5e1" }}>
                <thead>
                  <tr style={{ background: "#1a2b4c", color: "white", textAlign: "left" }}>
                    <th style={{ padding: "8px 12px", border: "1px solid #cbd5e1" }}>Section</th>
                    <th style={{ padding: "8px 12px", border: "1px solid #cbd5e1" }}>Description</th>
                    <th style={{ padding: "8px 12px", border: "1px solid #cbd5e1", textAlign: "center" }}>No. of Questions</th>
                    <th style={{ padding: "8px 12px", border: "1px solid #cbd5e1", textAlign: "center" }}>Marks Each</th>
                    <th style={{ padding: "8px 12px", border: "1px solid #cbd5e1", textAlign: "center" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {exam.metadata?.marksDistribution && exam.metadata.marksDistribution.length > 0
                    ? exam.metadata.marksDistribution.map((row, idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? "#ffffff" : "#f4f6fa" }}>
                          <td style={{ padding: "8px 12px", border: "1px solid #cbd5e1", fontWeight: "bold", textAlign: "center" }}>{row.section}</td>
                          <td style={{ padding: "8px 12px", border: "1px solid #cbd5e1" }}>{row.description}</td>
                          <td style={{ padding: "8px 12px", border: "1px solid #cbd5e1", textAlign: "center" }}>{row.count}</td>
                          <td style={{ padding: "8px 12px", border: "1px solid #cbd5e1", textAlign: "center" }}>{row.each}</td>
                          <td style={{ padding: "8px 12px", border: "1px solid #cbd5e1", textAlign: "center", fontWeight: "bold" }}>{row.total}</td>
                        </tr>
                      ))
                    : exam.sections.map((sec, idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? "#ffffff" : "#f4f6fa" }}>
                          <td style={{ padding: "8px 12px", border: "1px solid #cbd5e1", fontWeight: "bold", textAlign: "center" }}>{String.fromCharCode(65 + idx)}</td>
                          <td style={{ padding: "8px 12px", border: "1px solid #cbd5e1" }}>{sec.title}</td>
                          <td style={{ padding: "8px 12px", border: "1px solid #cbd5e1", textAlign: "center" }}>{sec.questions.length}</td>
                          <td style={{ padding: "8px 12px", border: "1px solid #cbd5e1", textAlign: "center" }}>{sec.questions[0]?.marks ? `${sec.questions[0].marks}` : "Varies"}</td>
                          <td style={{ padding: "8px 12px", border: "1px solid #cbd5e1", textAlign: "center", fontWeight: "bold" }}>{sec.marks}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div style={{ height: "1px", background: "#cbd5e1", margin: "24px 0 32px 0" }} />

        {/* Exam Question Sections */}
        <div className="exam-sections">
          {exam.sections.map((section, sIdx) => {
            const sectionLetter = String.fromCharCode(65 + sIdx);
            return (
              <div key={sIdx} style={{ marginBottom: "36px" }}>
                <div style={{ marginBottom: "12px", borderBottom: "2px solid #1a2b4c", paddingBottom: "6px", display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "8px" }}>
                  <h2 style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.25rem)", color: "#1a2b4c", fontWeight: "700", margin: "0" }}>
                    {section.title.startsWith("Section") ? section.title : `Section ${sectionLetter} — ${section.title}`}
                  </h2>
                  <span style={{ fontSize: "0.95rem", fontWeight: "bold", color: "#1a2b4c", whiteSpace: "nowrap" }}>
                    ({section.marks} marks)
                  </span>
                </div>
                {section.instructions && (
                  <p style={{ fontStyle: "italic", color: "#475569", marginBottom: "20px", fontSize: "0.92rem", lineHeight: "1.45" }}>
                    Instruction: {section.instructions}
                  </p>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {section.questions.map((q, qIdx) => (
                    <div key={q.id || qIdx} style={{ pageBreakInside: "avoid" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", gap: "8px", flexWrap: "wrap" }}>
                        <div style={{ fontWeight: "600", fontSize: "0.96rem", color: "#0f172a", flex: "1 1 260px", lineHeight: "1.5" }}>
                          <b>Q{qIdx + 1}.</b> {q.text}
                        </div>
                        {q.marks ? (
                          <span style={{ fontWeight: "bold", color: "#64748b", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                            [{q.marks} {q.marks === 1 ? "mark" : "marks"}]
                          </span>
                        ) : null}
                      </div>
                      
                      {/* MCQ Options formatted in flexible auto-fit grid */}
                      {q.options && q.options.length > 0 && (
                        <div style={{ 
                          display: "grid", 
                          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", 
                          gap: "8px clamp(8px, 2vw, 16px)", 
                          marginLeft: "clamp(8px, 2.5vw, 24px)", 
                          marginTop: "8px" 
                        }}>
                          {q.options.map((opt: any, optIdx: number) => {
                            const isCorrectOpt = typeof opt === "object" && opt.isCorrect;
                            const optText = typeof opt === "string" ? opt : `(${opt.label?.toLowerCase() || String.fromCharCode(97 + optIdx)}) ${opt.text}`;
                            return (
                              <div key={optIdx} style={{ 
                                fontSize: "0.95rem", 
                                color: showAnswerKey && isCorrectOpt ? "#047857" : "#334155",
                                fontWeight: showAnswerKey && isCorrectOpt ? "600" : "400"
                              }}>
                                {optText} {showAnswerKey && isCorrectOpt && " ✓"}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {q.type === "SHORT_ANSWER" && !showAnswerKey && (
                        <div style={{ marginTop: "12px", marginLeft: "clamp(8px, 2vw, 24px)", borderBottom: "1px dashed #cbd5e1", height: "40px" }} />
                      )}

                      {q.type === "LONG_ANSWER" && !showAnswerKey && (
                        <div style={{ marginTop: "12px", marginLeft: "clamp(8px, 2vw, 24px)", display: "flex", flexDirection: "column", gap: "20px" }}>
                          <div style={{ borderBottom: "1px dashed #cbd5e1" }} />
                          <div style={{ borderBottom: "1px dashed #cbd5e1" }} />
                          <div style={{ borderBottom: "1px dashed #cbd5e1" }} />
                        </div>
                      )}

                      {q.type === "FILL_BLANK" && !showAnswerKey && (
                        <div style={{ marginTop: "12px", marginLeft: "clamp(8px, 2vw, 24px)", borderBottom: "1px dashed #cbd5e1", height: "24px", width: "clamp(120px, 40%, 240px)" }} />
                      )}
                      
                      {q.type === "TRUE_FALSE" && !showAnswerKey && (
                        <div style={{ marginTop: "6px", marginLeft: "clamp(8px, 2vw, 24px)", fontStyle: "italic", fontSize: "0.9rem", color: "#475569" }}>
                          ( True  /  False )
                        </div>
                      )}

                      {/* Inline Answer & Explanation Box */}
                      {showAnswerKey && (q.answer || q.explanation) && (
                        <div style={{ marginTop: "12px", marginLeft: "clamp(8px, 2vw, 24px)", padding: "clamp(10px, 2vw, 14px)", background: "#f0fdf4", borderLeft: "4px solid #10b981", borderRadius: "4px", fontSize: "0.92rem", color: "#064e3b" }}>
                          {q.answer && (
                            <div style={{ fontWeight: "600", marginBottom: "4px", wordBreak: "break-word" }}>
                              ✔ Answer: {q.answer}
                            </div>
                          )}
                          {q.explanation && (
                            <div style={{ color: "#047857", fontSize: "0.88rem", lineHeight: "1.45", wordBreak: "break-word" }}>
                              <strong>Explanation:</strong> {q.explanation}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "40px", paddingTop: "16px", borderTop: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.9rem", fontStyle: "italic" }}>
          — End of Examination Paper —
        </div>
      </div>
    </motion.div>
  );
}
