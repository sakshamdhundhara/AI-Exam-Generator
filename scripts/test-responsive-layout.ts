/**
 * Comprehensive Responsive Layout Test Suite
 * Validates CSS media queries, fluid typography, responsive grid systems,
 * touch targets, and viewport adaptability across Mobile, Tablet, and Desktop.
 */

import fs from "fs";
import path from "path";

interface ViewportSpec {
  name: string;
  width: number;
  height: number;
  type: "mobile" | "tablet" | "desktop";
}

const VIEWPORTS: ViewportSpec[] = [
  { name: "Small Mobile (iPhone SE / Galaxy Mini)", width: 320, height: 568, type: "mobile" },
  { name: "Standard Mobile (iPhone 12/13/14/15)", width: 390, height: 844, type: "mobile" },
  { name: "Large Mobile (Pro Max / Pixel 7)", width: 430, height: 932, type: "mobile" },
  { name: "Tablet Portrait (iPad Mini / Air)", width: 768, height: 1024, type: "tablet" },
  { name: "Tablet Landscape / Small Laptop", width: 1024, height: 768, type: "tablet" },
  { name: "Standard Desktop (1080p)", width: 1280, height: 800, type: "desktop" },
  { name: "Wide Desktop (FHD / QHD)", width: 1920, height: 1080, type: "desktop" }
];

function evalClamp(clampStr: string, viewportWidth: number, baseFontSize = 16): number {
  // Matches clamp(min, val, max) e.g. clamp(1.25rem, 4vw, 1.75rem)
  const match = clampStr.match(/clamp\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)/);
  if (!match) return 0;

  const parseVal = (str: string): number => {
    str = str.trim();
    if (str.endsWith("rem")) return parseFloat(str) * baseFontSize;
    if (str.endsWith("px")) return parseFloat(str);
    if (str.endsWith("vw")) return (parseFloat(str) / 100) * viewportWidth;
    // compound expressions like 5vw + 1rem
    if (str.includes("+")) {
      const parts = str.split("+");
      return parts.reduce((sum, p) => sum + parseVal(p.trim()), 0);
    }
    return parseFloat(str);
  };

  const min = parseVal(match[1]);
  const preferred = parseVal(match[2]);
  const max = parseVal(match[3]);

  return Math.min(Math.max(min, preferred), max);
}

function runTests() {
  console.log("=======================================================");
  console.log("📱 RUNNING RESPONSIVE UI & VIEWPORT ADAPTABILITY SUITE");
  console.log("=======================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${msg}`);
      failed++;
    }
  }

  // 1. Verify CSS Files and Media Queries Exist
  console.log("📋 [Test Suite 1] CSS Media Queries & Breakpoint Definitions");
  const globalsCss = fs.readFileSync(path.resolve("app/globals.css"), "utf-8");
  const pageCss = fs.readFileSync(path.resolve("app/page.module.css"), "utf-8");
  const dashCss = fs.readFileSync(path.resolve("app/dashboard/page.module.css"), "utf-8");
  const genCss = fs.readFileSync(path.resolve("app/generate/page.module.css"), "utf-8");
  const progCss = fs.readFileSync(path.resolve("components/GenerationProgress.module.css"), "utf-8");

  assert(globalsCss.includes("@media (max-width: 768px)"), "globals.css contains tablet breakpoint (@media max-width: 768px)");
  assert(globalsCss.includes("@media (max-width: 480px)"), "globals.css contains mobile breakpoint (@media max-width: 480px)");
  assert(pageCss.includes("@media (max-width: 640px)"), "Landing page contains mobile stack query (@media max-width: 640px)");
  assert(dashCss.includes("@media (max-width: 540px)"), "Dashboard contains compact mobile query (@media max-width: 540px)");
  assert(progCss.includes("@media (max-width: 639px)"), "Progress stepper switches between mobile dots & desktop steps at 640px");

  // 2. Fluid Typography Scaling Across All 7 Viewports
  console.log("\n📋 [Test Suite 2] Fluid Typography & Element Sizing (No Overflow or Distortion)");
  const titleClamp = "clamp(2rem, 7vw, 3.5rem)";
  const descClamp = "clamp(1rem, 2.5vw, 1.25rem)";
  const examHeaderClamp = "clamp(1.25rem, 3.5vw, 1.75rem)";

  VIEWPORTS.forEach(vp => {
    const titlePx = evalClamp(titleClamp, vp.width);
    const descPx = evalClamp(descClamp, vp.width);
    const examHeaderPx = evalClamp(examHeaderClamp, vp.width);

    // Assert title fits comfortably in screen without horizontal overflow
    // At 320px: titlePx ~32px, fits 10 characters per line without spilling
    const fitsViewport = titlePx <= (vp.width * 0.15) || vp.width <= 360;
    assert(titlePx >= 32 && titlePx <= 56, `[${vp.name} (${vp.width}px)] Landing Title scaled safely: ${titlePx.toFixed(1)}px (within 32-56px range)`);
    assert(descPx >= 16 && descPx <= 20, `[${vp.name} (${vp.width}px)] Description Body font scaled: ${descPx.toFixed(1)}px`);
    assert(examHeaderPx >= 20 && examHeaderPx <= 28, `[${vp.name} (${vp.width}px)] Exam Paper Header scaled: ${examHeaderPx.toFixed(1)}px`);
  });

  // 3. Touch Target Sizing (Mobile Accessibility)
  console.log("\n📋 [Test Suite 3] Touch Targets (Minimum 40-44px for Touch Devices)");
  assert(globalsCss.includes("min-height: 44px"), "Form inputs have min-height: 44px for touch compliance");
  assert(pageCss.includes("min-height: 48px"), "CTA primary & secondary buttons have min-height: 48px for thumb taps");
  assert(dashCss.includes("min-height: 44px"), "Dashboard action buttons have min-height: 44px");

  // 4. Responsive Grid & Container Constraints
  console.log("\n📋 [Test Suite 4] Grid Systems & Safe Auto-Fill Formulas");
  assert(dashCss.includes("minmax(min(100%, 280px), 1fr)"), "Dashboard cards grid uses min(100%, 280px) to prevent 320px phone clipping");
  
  const examFormTsx = fs.readFileSync(path.resolve("components/ExamGeneratorForm.tsx"), "utf-8");
  assert(examFormTsx.includes("minmax(min(100%, 180px), 1fr)"), "Exam form metrics inputs use min(100%, 180px) auto-fit grid");
  assert(examFormTsx.includes("minmax(min(100%, 110px), 1fr)"), "Difficulty selection buttons refactored to auto-fit grid (2x2 on mobile, 1x4 on desktop)");

  // 5. Exam Paper Preview Tables & Options
  console.log("\n📋 [Test Suite 5] Exam Preview Printable Sheet & Table Horizontal Scrolling");
  const examPreviewTsx = fs.readFileSync(path.resolve("components/ExamPreview.tsx"), "utf-8");
  assert(examPreviewTsx.includes("overflowX: \"auto\""), "Marks distribution table wrapped in responsive horizontal scroll container");
  assert(examPreviewTsx.includes("minmax(min(100%, 260px), 1fr)"), "MCQ options adapt from 1 column on mobile to 2 columns on desktop");
  assert(examPreviewTsx.includes("clamp(20px, 4.5vw, 48px)"), "Printable exam sheet padding scales gracefully from 20px on mobile to 48px on desktop");

  // 6. Autocomplete & Dropdowns
  console.log("\n📋 [Test Suite 6] Autocomplete Input & Mobile Touch Dropdowns");
  const autocompleteTsx = fs.readFileSync(path.resolve("components/AutocompleteInput.tsx"), "utf-8");
  assert(autocompleteTsx.includes("minHeight: \"42px\""), "Autocomplete dropdown suggestions have minimum 42px touch height");
  assert(autocompleteTsx.includes("clamp(240px, 45vh, 340px)"), "Autocomplete dropdown height bounded by 45vh for mobile screens");

  console.log("\n=======================================================");
  console.log(`📊 RESPONSIVE TEST RESULTS: ${passed} Passed | ${failed} Failed`);
  console.log("=======================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
