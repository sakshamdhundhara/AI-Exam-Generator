"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface SuggestionItem {
  value: string;
  category: string;
  matchScore: number;
  description: string;
  isTypoCorrection?: boolean;
}

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: string, item?: SuggestionItem) => void;
  placeholder?: string;
  type: "subject" | "topic";
  subjectContext?: string;
  disabled?: boolean;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function AutocompleteInput({
  value,
  onChange,
  onSelect,
  placeholder = "Type to search...",
  type,
  subjectContext = "",
  disabled = false,
  className = "form-input",
  onKeyDown,
  inputRef: externalInputRef
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [correctedQuery, setCorrectedQuery] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const internalInputRef = useRef<HTMLInputElement>(null);
  const inputRef = externalInputRef || internalInputRef;
  const listboxId = useId();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    let isCancelled = false;
    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          type,
          query: value,
          subject: subjectContext,
          limit: "10"
        });

        const res = await fetch(`/api/suggestions?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch suggestions");
        const data = await res.json();

        if (!isCancelled && data.success) {
          setSuggestions(data.suggestions || []);
          setCorrectedQuery(data.correctedQuery || null);
          setHighlightedIndex(-1);
        }
      } catch (err) {
        console.warn("Autocomplete fetch failed:", err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }, 120);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [value, type, subjectContext]);

  // Group suggestions by category
  const groupedSuggestions = suggestions.reduce<Record<string, SuggestionItem[]>>((acc, item) => {
    const cat = item.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const flattenedSuggestions = Object.values(groupedSuggestions).flat();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onKeyDown) {
      // Pass through if consumer wants special behavior
      onKeyDown(e);
      if (e.defaultPrevented) return;
    }

    if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setIsOpen(true);
      return;
    }

    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => 
        prev < flattenedSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => 
        prev > 0 ? prev - 1 : flattenedSuggestions.length - 1
      );
    } else if (e.key === "Enter" && highlightedIndex >= 0 && highlightedIndex < flattenedSuggestions.length) {
      e.preventDefault();
      const selected = flattenedSuggestions[highlightedIndex];
      onSelect(selected.value, selected);
      setIsOpen(false);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSelect = (item: SuggestionItem) => {
    onSelect(item.value, item);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  let globalIndexCounter = 0;

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <input
          ref={inputRef}
          type="text"
          className={className}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          style={{ width: "100%", paddingRight: isLoading ? "36px" : "12px" }}
        />
        {isLoading && (
          <div
            style={{
              position: "absolute",
              right: "12px",
              width: "16px",
              height: "16px",
              border: "2px solid rgba(255,255,255,0.2)",
              borderTopColor: "var(--accent-primary)",
              borderRadius: "50%",
              animation: "spin 0.6s linear infinite",
              pointerEvents: "none"
            }}
          />
        )}
      </div>

      <AnimatePresence>
        {isOpen && flattenedSuggestions.length > 0 && (
          <motion.div
            id={listboxId}
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              right: 0,
              zIndex: 999,
              background: "#18181b",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "12px",
              boxShadow: "0 16px 36px rgba(0, 0, 0, 0.6)",
              maxHeight: "clamp(240px, 45vh, 340px)",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              padding: "6px"
            }}
          >
            {correctedQuery && (
              <div
                style={{
                  padding: "8px 12px",
                  margin: "4px 4px 8px 4px",
                  background: "rgba(99, 102, 241, 0.15)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  color: "#c7d2fe",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <span>💡</span>
                <span>
                  Typo detected. Showing results matching <strong>{correctedQuery}</strong>
                </span>
              </div>
            )}

            {Object.entries(groupedSuggestions).map(([category, items]) => (
              <div key={category} style={{ marginBottom: "6px" }}>
                <div
                  style={{
                    padding: "4px 10px",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "rgba(255, 255, 255, 0.45)",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                    marginBottom: "4px"
                  }}
                >
                  {category}
                </div>
                {items.map((item) => {
                  const currentIndex = globalIndexCounter++;
                  const isHighlighted = highlightedIndex === currentIndex;

                  return (
                    <div
                      key={item.value}
                      role="option"
                      aria-selected={isHighlighted}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setHighlightedIndex(currentIndex)}
                      style={{
                        padding: "8px 12px",
                        minHeight: "42px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        background: isHighlighted ? "rgba(99, 102, 241, 0.25)" : "transparent",
                        border: isHighlighted ? "1px solid rgba(99, 102, 241, 0.5)" : "1px solid transparent",
                        transition: "all 0.12s ease",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        gap: "2px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 600, fontSize: "0.92rem", color: isHighlighted ? "#ffffff" : "#f4f4f5" }}>
                          {item.value}
                        </span>
                        {item.isTypoCorrection && (
                          <span
                            style={{
                              fontSize: "0.68rem",
                              padding: "2px 6px",
                              borderRadius: "6px",
                              background: "rgba(245, 158, 11, 0.2)",
                              color: "#f59e0b",
                              fontWeight: 600
                            }}
                          >
                            Suggested
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <span style={{ fontSize: "0.76rem", color: "rgba(255, 255, 255, 0.5)", lineHeight: 1.3 }}>
                          {item.description}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
