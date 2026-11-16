# 🎓 AI-Powered Exam Paper Builder

An intelligent, full-stack examination paper generation platform built with **Next.js 16 App Router**, **LangGraph**, **Google Gemini AI**, **Prisma (SQLite)**, and **NextAuth**.

Designed for educators, academic institutions, and examiners to automatically research, generate, review, and format balanced, curriculum-aligned test papers with dynamic mark allocation and professional PDF export.

---

## 🚀 Key Features

- **Multi-Agent Generation Pipeline (LangGraph)**:
  - **Research Node**: Extracts authoritative context and facts using Tavily.
  - **Question Generation Node**: Crafts accurate questions strictly aligned with target subject and topics using Gemini models (`gemini-3.5-flash`, `gemini-3.5-flash-lite`, `gemini-3.8-flash`).
  - **Quality Review Node**: Critically evaluates question accuracy, relevance, Bloom's taxonomy balance, and mark distributions with automatic revision feedback loops.
  - **Formatter Node**: Structures exam sections (Objective $\to$ Short Answer $\to$ Long Answer) and builds comprehensive marks distribution tables.
- **Dynamic Mark Allocation Engine**:
  - Multiple Choice / True-False: **1–2 marks** each
  - Short Answer: **5 marks** each
  - Long Answer / Essay: **10+ marks** each
  - Strict total marks reconciliation matching the exact configured target.
- **Smart Typo-Tolerant Autocomplete**:
  - Real-time categorized suggestions for academic subjects and subject-specific topics.
  - Levenshtein-distance typo tolerance (e.g. `Physcs` $\to$ `Physics`, `Biolog` $\to$ `Biology`).
- **Fully Responsive Design**:
  - Fluid typography and adaptive layouts across Mobile (320px–430px), Tablet (768px–1024px), and Desktop (1280px+).
  - Adaptive 5-stage progress stepper and touch-friendly controls ($\ge 44\text{px}$).
- **Printable & PDF Export**:
  - Official institutional header, candidate roll number fields, general instructions, and confidential answer keys.
  - Single-click PDF export and print formatting.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **AI / Agentic Graph**: LangGraph, `@langchain/google-genai`, `@langchain/tavily`
- **Database & Auth**: Prisma ORM with SQLite (`better-sqlite3`), NextAuth.js
- **Styling & Motion**: Vanilla CSS modules, Glassmorphism, Framer Motion
- **Exporting**: jsPDF, html2canvas

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create or verify `.env.local` in the project root:
```env
# Primary Gemini API Key
GEMINI_API_KEY="your-gemini-api-key"

# NextAuth Configuration
NEXTAUTH_SECRET="your-super-secret-nextauth-key"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Tavily Search Key for live curriculum grounding
# TAVILY_API_KEY="your-tavily-api-key"
```

### 3. Initialize Database
```bash
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Test Suites

The project includes automated test suites covering all core subsystems:

```bash
# Run all test suites
npm test

# Run subject & topic suggestion autocomplete tests (29 checks)
npm run test:suggestions

# Run dynamic mark allocation & section total tests (15 checks)
npm run test:marks

# Run mobile/tablet/desktop responsive viewport tests (37 checks)
npm run test:responsive

# Run end-to-end exam generation preview test
npm run test:preview
```

---

## 📂 Project Structure

```text
├── app/                  # Next.js 16 App Router pages & API routes
│   ├── api/
│   │   ├── auth/         # NextAuth route handlers
│   │   ├── generate/     # SSE streaming route for LangGraph pipeline
│   │   └── suggestions/  # Typo-tolerant academic catalog API
│   ├── dashboard/        # Exam paper history & stats dashboard
│   ├── generate/         # Interactive exam creation & preview page
│   ├── login/            # Authentication sign-in page
│   ├── register/         # User registration page
│   ├── globals.css       # Responsive design utilities & design tokens
│   └── page.tsx          # Animated landing page
├── components/           # Reusable UI components
│   ├── AutocompleteInput.tsx     # Debounced, accessible suggestion input
│   ├── ExamGeneratorForm.tsx     # Responsive exam configuration form
│   ├── ExamHistoryList.tsx       # Searchable, filterable history grid
│   ├── ExamPreview.tsx           # Formatted specimen paper & PDF exporter
│   └── GenerationProgress.tsx    # Responsive 5-stage progress indicator
├── lib/                  # Business logic & agent workflows
│   ├── actions/          # Server actions for exam & user management
│   ├── agents/           # LangGraph graph & mark allocation engine
│   │   ├── examGraph.ts          # Core agentic pipeline
│   │   └── markAllocation.ts     # Dynamic mark allocation calculator
│   ├── suggestions/      # Curated multi-domain academic catalog
│   ├── authOptions.ts    # NextAuth credentials provider configuration
│   ├── prisma.ts         # Prisma SQLite client singleton
│   └── types.ts          # Shared TypeScript domain interfaces
├── prisma/               # Database schema & migrations
│   └── schema.prisma     # User & Exam models
├── scripts/              # Automated verification & test suites
└── middleware.ts         # Route protection middleware
```
