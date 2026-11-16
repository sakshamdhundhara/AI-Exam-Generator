"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExamFormValues, QuestionType, Difficulty } from "@/lib/types";
import { AutocompleteInput } from "./AutocompleteInput";

interface ExamGeneratorFormProps {
  onSubmit: (values: ExamFormValues) => void;
  isGenerating: boolean;
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "MCQ", label: "Multiple Choice" },
  { value: "SHORT_ANSWER", label: "Short Answer" },
  { value: "LONG_ANSWER", label: "Long Answer" },
  { value: "FILL_BLANK", label: "Fill in the Blanks" },
  { value: "TRUE_FALSE", label: "True / False" }
];

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
  { value: "MIXED", label: "Mixed" }
];

const AVAILABLE_MODELS = [
  { value: "gemini-3.5-flash", label: "Gemini 3.5 Flash", badge: "Recommended", desc: "Balanced performance & high accuracy" },
  { value: "gemini-3.5-flash-lite", label: "Gemini 3.5 Flash Lite", badge: "Fast", desc: "Ultra-fast generation & minimal latency" },
  { value: "gemini-3.8-flash", label: "Gemini 3.8 Flash", badge: "Deep Reasoning", desc: "Advanced reasoning for complex exams" }
];

const AVAILABLE_KEYS = [
  { label: "Auto Pool / Failover (Recommended)", desc: "Automatically rotates configured keys with fallback", index: undefined },
  { label: "Key 1 (...8SSQ)", desc: "Primary verified Gemini API Key", index: 0 },
  { label: "Key 2 (...n6Vg)", desc: "Secondary added Gemini API Key", index: 1 }
];

export function ExamGeneratorForm({ onSubmit, isGenerating }: ExamGeneratorFormProps) {
  const [subject, setSubject] = useState("");
  const [totalMarks, setTotalMarks] = useState<number>(100);
  const [numQuestions, setNumQuestions] = useState<number>(20);
  const [timeLimit, setTimeLimit] = useState<number>(60);
  
  const [instituteName, setInstituteName] = useState("GREEN VALLEY INSTITUTE OF TECHNOLOGY");
  const [course, setCourse] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [examType, setExamType] = useState("End-Semester Examination");

  const [topicInput, setTopicInput] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>(["MCQ", "SHORT_ANSWER"]);
  const [difficultyLevel, setDifficultyLevel] = useState<Difficulty>("MIXED");
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.5-flash");
  const [selectedKeyIndex, setSelectedKeyIndex] = useState<number | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recommendedTopics, setRecommendedTopics] = useState<string[]>([]);
  
  const [error, setError] = useState("");

  // Dynamically load recommended topic chips when subject changes
  useEffect(() => {
    if (!subject.trim()) {
      setRecommendedTopics([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggestions?type=topic&subject=${encodeURIComponent(subject)}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.suggestions) {
            setRecommendedTopics(data.suggestions.map((s: any) => s.value));
          }
        }
      } catch (e) {
        console.warn("Could not fetch topic suggestions:", e);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [subject]);

  const handleAddTopic = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && topicInput.trim() !== "") {
      e.preventDefault();
      if (!topics.includes(topicInput.trim())) {
        setTopics([...topics, topicInput.trim()]);
      }
      setTopicInput("");
    }
  };

  const removeTopic = (topicToRemove: string) => {
    setTopics(topics.filter((t) => t !== topicToRemove));
  };

  const toggleQuestionType = (type: QuestionType) => {
    if (selectedTypes.includes(type)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter((t) => t !== type));
      }
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setError("Please enter a subject.");
      return;
    }
    if (topics.length === 0) {
      setError("Please add at least one topic.");
      return;
    }
    if (totalMarks <= 0 || numQuestions <= 0) {
      setError("Marks and number of questions must be positive.");
      return;
    }
    
    setError("");
    onSubmit({
      subject,
      totalMarks,
      numQuestions,
      topics,
      questionTypes: selectedTypes,
      difficultyLevel,
      model: selectedModel,
      apiKeyIndex: selectedKeyIndex,
      timeLimit,
      instituteName,
      course,
      subjectCode,
      examType
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel"
      style={{ padding: "clamp(16px, 4vw, 32px)", maxWidth: "800px", margin: "0 auto", width: "100%" }}
    >
      <h2 className="text-gradient" style={{ marginBottom: "20px", fontSize: "clamp(1.4rem, 4vw, 1.85rem)" }}>Configure Exam</h2>
      
      {error && (
        <div style={{ color: "var(--error-color)", marginBottom: "16px", padding: "12px", background: "rgba(239, 68, 68, 0.1)", borderRadius: "var(--border-radius-sm)", fontSize: "0.9rem" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Subject</label>
          <AutocompleteInput
            type="subject"
            placeholder="e.g. Physics, Biology, Computer Science, Economics"
            value={subject}
            onChange={setSubject}
            onSelect={(val) => setSubject(val)}
            disabled={isGenerating}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Topics (Search, select, or press Enter to add)</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
            <AnimatePresence>
              {topics.map((topic) => (
                <motion.div
                  key={topic}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  style={{
                    background: "var(--accent-primary)",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.88rem",
                    maxWidth: "100%",
                    wordBreak: "break-word"
                  }}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{topic}</span>
                  <button 
                    type="button" 
                    onClick={() => removeTopic(topic)}
                    style={{ color: "white", opacity: 0.8, cursor: "pointer", fontSize: "1.1rem", padding: "0 2px" }}
                    disabled={isGenerating}
                    aria-label={`Remove topic ${topic}`}
                  >
                    &times;
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <AutocompleteInput
            type="topic"
            placeholder={subject ? `Search topics in ${subject}...` : "Select a subject first, or type any topic..."}
            value={topicInput}
            onChange={setTopicInput}
            onSelect={(val) => {
              if (!topics.includes(val.trim())) {
                setTopics([...topics, val.trim()]);
              }
              setTopicInput("");
            }}
            onKeyDown={handleAddTopic}
            subjectContext={subject}
            disabled={isGenerating}
          />

          {/* Quick topic suggestion chips for the active subject */}
          {recommendedTopics.filter(t => !topics.includes(t)).length > 0 && (
            <div style={{ marginTop: "10px" }}>
              <div style={{ fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.5)", marginBottom: "6px" }}>
                💡 Suggested for {subject}:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {recommendedTopics
                  .filter(t => !topics.includes(t))
                  .map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => setTopics(prev => [...prev, topic])}
                      disabled={isGenerating}
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px dashed rgba(255, 255, 255, 0.2)",
                        borderRadius: "14px",
                        padding: "5px 10px",
                        minHeight: "32px",
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        textAlign: "left"
                      }}
                    >
                      + {topic}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: "clamp(12px, 2vw, 16px)" }}>
          <div className="form-group">
            <label className="form-label">Total Marks</label>
            <input 
              type="number" 
              className="form-input" 
              value={totalMarks}
              onChange={(e) => setTotalMarks(Number(e.target.value))}
              disabled={isGenerating}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Number of Questions</label>
            <input 
              type="number" 
              className="form-input" 
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              disabled={isGenerating}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Time Limit (mins)</label>
            <input 
              type="number" 
              className="form-input" 
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              disabled={isGenerating}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Question Types</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {QUESTION_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => toggleQuestionType(type.value)}
                disabled={isGenerating}
                style={{
                  padding: "8px 14px",
                  minHeight: "40px",
                  borderRadius: "20px",
                  border: `1px solid ${selectedTypes.includes(type.value) ? "var(--accent-primary)" : "var(--border-color)"}`,
                  background: selectedTypes.includes(type.value) ? "rgba(99, 102, 241, 0.2)" : "transparent",
                  color: selectedTypes.includes(type.value) ? "var(--text-primary)" : "var(--text-secondary)",
                  transition: "var(--transition-fast)",
                  fontSize: "0.88rem",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Difficulty</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 110px), 1fr))", gap: "8px" }}>
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff.value}
                type="button"
                onClick={() => setDifficultyLevel(diff.value)}
                disabled={isGenerating}
                style={{
                  padding: "10px 8px",
                  minHeight: "44px",
                  borderRadius: "var(--border-radius-sm)",
                  border: `1px solid ${difficultyLevel === diff.value ? "var(--accent-secondary)" : "var(--border-color)"}`,
                  background: difficultyLevel === diff.value ? "rgba(139, 92, 246, 0.2)" : "transparent",
                  color: difficultyLevel === diff.value ? "var(--text-primary)" : "var(--text-secondary)",
                  transition: "var(--transition-fast)",
                  fontWeight: difficultyLevel === diff.value ? 600 : 400,
                  fontSize: "0.9rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Select AI Model</label>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              disabled={isGenerating}
              style={{
                background: "rgba(99, 102, 241, 0.15)",
                border: "1px solid var(--accent-primary)",
                color: "var(--text-primary)",
                padding: "6px 12px",
                minHeight: "36px",
                borderRadius: "16px",
                fontSize: "0.82rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              ⚙️ Model & Key Modal
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))", gap: "10px" }}>
            {AVAILABLE_MODELS.map((m) => {
              const isSelected = selectedModel === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setSelectedModel(m.value)}
                  disabled={isGenerating}
                  style={{
                    padding: "12px 14px",
                    minHeight: "68px",
                    borderRadius: "var(--border-radius-sm)",
                    border: `1px solid ${isSelected ? "var(--accent-primary)" : "var(--border-color)"}`,
                    background: isSelected ? "rgba(99, 102, 241, 0.2)" : "transparent",
                    color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "var(--transition-fast)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.88rem" }}>{m.label}</span>
                    <span style={{ fontSize: "0.68rem", padding: "2px 6px", borderRadius: "8px", background: isSelected ? "var(--accent-primary)" : "rgba(255,255,255,0.1)", color: "#fff", whiteSpace: "nowrap" }}>
                      {m.badge}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.75rem", opacity: 0.75, marginTop: "4px", lineHeight: "1.3" }}>{m.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        <button 
          type="submit" 
          className="btn-primary" 
          style={{ width: "100%", marginTop: "16px", minHeight: "48px", fontSize: "1.05rem" }}
          disabled={isGenerating}
        >
          {isGenerating ? "Generating Exam..." : "Generate Exam"}
        </button>
      </form>

      {/* Model & API Key Selection Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(8px)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "clamp(12px, 3vw, 24px)"
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="glass-panel"
              style={{
                width: "100%",
                maxWidth: "560px",
                maxHeight: "90vh",
                overflowY: "auto",
                padding: "clamp(16px, 4vw, 28px)",
                position: "relative",
                border: "1px solid var(--border-color)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.3rem" }}>⚡ Model & API Key Configuration</h3>
                  <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    Select your preferred Gemini AI model and active API credentials.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "none",
                    color: "var(--text-secondary)",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    fontSize: "1.1rem",
                    cursor: "pointer"
                  }}
                >
                  &times;
                </button>
              </div>

              {/* Model Choice inside Modal */}
              <div style={{ marginBottom: "20px" }}>
                <label className="form-label" style={{ marginBottom: "8px" }}>Select AI Model</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {AVAILABLE_MODELS.map((m) => {
                    const isSelected = selectedModel === m.value;
                    return (
                      <div
                        key={m.value}
                        onClick={() => setSelectedModel(m.value)}
                        style={{
                          padding: "12px 14px",
                          borderRadius: "var(--border-radius-sm)",
                          border: `1px solid ${isSelected ? "var(--accent-primary)" : "var(--border-color)"}`,
                          background: isSelected ? "rgba(99, 102, 241, 0.2)" : "rgba(255, 255, 255, 0.03)",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "0.95rem", color: isSelected ? "var(--text-primary)" : "var(--text-secondary)" }}>
                            {isSelected ? "● " : "○ "} {m.label}
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginLeft: "18px" }}>
                            {m.desc}
                          </div>
                        </div>
                        <span style={{ fontSize: "0.75rem", padding: "3px 8px", borderRadius: "10px", background: "rgba(99, 102, 241, 0.3)", color: "var(--accent-primary)" }}>
                          {m.badge}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* API Key Choice inside Modal */}
              <div style={{ marginBottom: "24px" }}>
                <label className="form-label" style={{ marginBottom: "8px" }}>Select Gemini API Key</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {AVAILABLE_KEYS.map((k) => {
                    const isSelected = selectedKeyIndex === k.index;
                    return (
                      <div
                        key={k.label}
                        onClick={() => setSelectedKeyIndex(k.index)}
                        style={{
                          padding: "12px 14px",
                          borderRadius: "var(--border-radius-sm)",
                          border: `1px solid ${isSelected ? "var(--accent-secondary)" : "var(--border-color)"}`,
                          background: isSelected ? "rgba(139, 92, 246, 0.2)" : "rgba(255, 255, 255, 0.03)",
                          cursor: "pointer"
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: "0.95rem", color: isSelected ? "var(--text-primary)" : "var(--text-secondary)" }}>
                          {isSelected ? "● " : "○ "} {k.label}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginLeft: "18px" }}>
                          {k.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                className="btn-primary"
                onClick={() => setIsModalOpen(false)}
                style={{ width: "100%", padding: "10px" }}
              >
                Apply Selection
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
