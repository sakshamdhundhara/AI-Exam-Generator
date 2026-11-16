"use client";

import { motion } from "framer-motion";
import styles from "./GenerationProgress.module.css";

export type AgentStep = "INIT" | "RESEARCH" | "GENERATING" | "REVIEWING" | "REVISING" | "FORMATTING" | "DONE" | "ERROR";

export interface ProgressEvent {
  step: AgentStep;
  message: string;
  progress: number;  // 0–100
}

interface GenerationProgressProps {
  currentStatus: ProgressEvent | null;
}

const STEPS: { id: AgentStep; label: string }[] = [
  { id: "RESEARCH", label: "Researching Topic" },
  { id: "GENERATING", label: "Generating Questions" },
  { id: "REVIEWING", label: "Quality Review" },
  { id: "FORMATTING", label: "Formatting Exam" },
  { id: "DONE", label: "Complete" },
];

export function GenerationProgress({ currentStatus }: GenerationProgressProps) {
  if (!currentStatus) return null;

  if (currentStatus.step === "ERROR") {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        className={`glass-panel ${styles.container}`}
        role="alert"
        style={{ color: "var(--error-color)" }}
      >
        <h3 style={{ fontSize: "1.1rem", marginBottom: "8px" }}>Exam generation failed</h3>
        <p style={{ lineHeight: 1.5 }}>{currentStatus.message}</p>
      </motion.div>
    );
  }

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStatus.step);
  // If we are revising, it falls under the reviewing phase visually
  const activeIndex = currentStatus.step === "REVISING" 
    ? STEPS.findIndex((s) => s.id === "REVIEWING")
    : currentStepIndex;

  const currentStepName = activeIndex >= 0 ? STEPS[activeIndex].label : "Preparing";

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className={`glass-panel ${styles.container}`}
    >
      <div className={styles.header}>
        <h3 className={styles.message}>{currentStatus.message}</h3>
        <span className={`text-gradient ${styles.percentage}`}>
          {Math.round(currentStatus.progress)}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressBarContainer}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${currentStatus.progress}%` }}
          style={{ height: "100%", background: "var(--accent-gradient)" }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Desktop & Tablet Stepper View (>= 640px) */}
      <div className={styles.desktopStepper}>
        <div className={styles.stepperLine} />
        
        {STEPS.map((step, index) => {
          const isActive = index === activeIndex;
          const isCompleted = index < activeIndex || currentStatus.step === "DONE";
          const isError = currentStatus.step === "ERROR" && index === activeIndex;

          let bgColor = "var(--bg-tertiary)";
          let borderColor = "var(--border-color)";
          
          if (isActive) {
            bgColor = "var(--bg-primary)";
            borderColor = "var(--accent-primary)";
          } else if (isCompleted) {
            bgColor = "var(--accent-primary)";
            borderColor = "var(--accent-primary)";
          }

          if (isError) {
            borderColor = "var(--error-color)";
            bgColor = "rgba(239, 68, 68, 0.2)";
          }

          return (
            <div key={step.id} className={styles.stepItem}>
              <motion.div 
                animate={{
                  scale: isActive ? 1.2 : 1,
                  boxShadow: isActive ? "0 0 12px rgba(99, 102, 241, 0.6)" : "none"
                }}
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: bgColor,
                  border: `2px solid ${borderColor}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "6px",
                  transition: "var(--transition-fast)"
                }}
              >
                {isCompleted && !isActive && <span style={{ color: "white", fontSize: "12px" }}>✓</span>}
              </motion.div>
              <span 
                className={styles.stepLabel}
                style={{ 
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  fontWeight: isActive ? 600 : 400
                }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile Stepper View (< 640px) */}
      <div className={styles.mobileStepper}>
        <div className={styles.mobileDotsRow}>
          <div className={styles.stepperLine} style={{ top: "8px" }} />
          {STEPS.map((step, index) => {
            const isActive = index === activeIndex;
            const isCompleted = index < activeIndex || currentStatus.step === "DONE";
            return (
              <div
                key={step.id}
                style={{
                  width: isActive ? "16px" : "12px",
                  height: isActive ? "16px" : "12px",
                  borderRadius: "50%",
                  background: isCompleted ? "var(--accent-primary)" : isActive ? "var(--accent-secondary)" : "var(--bg-tertiary)",
                  border: `2px solid ${isActive ? "var(--text-primary)" : isCompleted ? "var(--accent-primary)" : "var(--border-color)"}`,
                  zIndex: 1,
                  boxShadow: isActive ? "0 0 8px rgba(99, 102, 241, 0.8)" : "none",
                  transition: "all 0.2s ease"
                }}
              />
            );
          })}
        </div>
        <div className={styles.mobileStepBadge}>
          <span>Phase {Math.max(1, activeIndex + 1)} of 5: <strong>{currentStepName}</strong></span>
          <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>{currentStatus.step}</span>
        </div>
      </div>
    </motion.div>
  );
}
