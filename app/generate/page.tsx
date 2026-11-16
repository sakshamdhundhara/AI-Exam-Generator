"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ExamGeneratorForm } from "@/components/ExamGeneratorForm";
import { GenerationProgress, ProgressEvent } from "@/components/GenerationProgress";
import { ExamPreview } from "@/components/ExamPreview";
import { ExamFormValues, ExamDocument } from "@/lib/types";
import { saveExam } from "@/lib/actions/exam";
import styles from "./page.module.css";

export default function GeneratePage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<ProgressEvent | null>(null);
  const [generatedExam, setGeneratedExam] = useState<ExamDocument | null>(null);
  const [lastFormValues, setLastFormValues] = useState<ExamFormValues | null>(null);

  const handleGenerate = async (values: ExamFormValues) => {
    setLastFormValues(values);
    setIsGenerating(true);
    setGeneratedExam(null);
    setCurrentStatus({
      step: "RESEARCH",
      message: "Starting exam generation pipeline...",
      progress: 10,
    });

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error(`Failed to generate exam (${response.statusText})`);
      }

      if (!response.body) {
        throw new Error("No response stream received");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            try {
              const data = JSON.parse(trimmed.replace(/^data:\s*/, ""));
              setCurrentStatus({
                step: data.step,
                message: data.message,
                progress: data.progress,
              });

              if (data.exam) {
                setGeneratedExam(data.exam);
              }
            } catch (err) {
              console.error("Failed to parse SSE event:", err);
            }
          }
        }
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      setCurrentStatus({
        step: "ERROR",
        message: err.message || "An unexpected error occurred",
        progress: 100,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (exam: ExamDocument) => {
    await saveExam(exam);
    router.push("/dashboard");
  };

  const handleRegenerate = () => {
    if (lastFormValues) {
      handleGenerate(lastFormValues);
    } else {
      setGeneratedExam(null);
      setCurrentStatus(null);
    }
  };

  const handleExport = (format: "PDF" | "PRINT") => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/dashboard" className={styles.backLink}>
            ← Dashboard
          </Link>
          <h1 className={styles.title}>Generate Exam</h1>
          <div style={{ width: "100px" }} />
        </div>
      </header>

      <main className={styles.main}>
        {generatedExam ? (
          <ExamPreview
            exam={generatedExam}
            onSave={handleSave}
            onRegenerate={handleRegenerate}
            onExport={handleExport}
          />
        ) : (
          <>
            <ExamGeneratorForm onSubmit={handleGenerate} isGenerating={isGenerating} />
            <GenerationProgress currentStatus={currentStatus} />
          </>
        )}
      </main>
    </div>
  );
}
