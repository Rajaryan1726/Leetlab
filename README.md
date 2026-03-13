# 🧠 LeetLab

<div align="center">

![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10-3776AB?style=for-the-badge&logo=python&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**A full-stack AI platform for coding practice, resume analysis, and mock interview preparation.**

[Features](#-features) • [Screenshots](#-screenshots) • [Tech Stack](#-tech-stack) • [Architecture](#-architecture) • [Setup](#-setup) • [API](#-api-endpoints)

</div>

---

## ✨ Features

### 💻 Coding Platform
- LeetCode-style problem editor with real-time code execution
- Multi-language support (JavaScript, Python, and more)
- Submission history with acceptance rate tracking
- AI-powered per-problem analysis panel:
  - **Hint** — nudge in the right direction
  - **Suggestion** — better approach ideas
  - **Review** — code quality feedback
  - **Complexity** — time & space analysis
  - **Optimize** — performance improvements

### 📄 AI Resume Analysis
- Drag & drop PDF upload (max 5 MB)
- Dual AI: **DistilBERT ML model** + **Groq LLaMA** run in **parallel**
- Detected Job Category with model confidence %
- Overall Score (0–10) with level — Beginner / Intermediate / Advanced
- Skills detected, Missing Keywords, Strengths, Weaknesses, Suggestions

### 🎤 AI Mock Interview
- Real-time chat — AI reads your resume and asks **6 tailored questions**
- Questions based on your actual projects, skills, and experience
- Brief feedback after each answer before the next question

### 📊 Auto Scorecard
- Auto-generated after exactly 6 answers — no button needed
- 5 metrics: **Communication, Technical, Problem Solving, Confidence, Overall**
- Verdict: Ready for Senior / Junior Role / Needs Preparation
- Detailed Feedback + Tips to Improve

---

## 📸 Screenshots

### 💻 Coding Problem Editor
![Code Editor](https://raw.githubusercontent.com/Rajaryan1726/leetlab/main/screenshots/editor.png)

### 📄 Resume Upload
![Upload](https://raw.githubusercontent.com/Rajaryan1726/leetlab/main/screenshots/upload.png)

### 🔍 AI Resume Analysis
![Analysis Top](https://raw.githubusercontent.com/Rajaryan1726/leetlab/main/screenshots/analysis-top.png)
![Analysis Bottom](https://raw.githubusercontent.com/Rajaryan1726/leetlab/main/screenshots/analysis-bottom.png)

### 🎤 Mock Interview Chat
![Interview](https://raw.githubusercontent.com/Rajaryan1726/leetlab/main/screenshots/interview.png)

### 📊 Interview Scorecard
![Scorecard Top](https://raw.githubusercontent.com/Rajaryan1726/leetlab/main/screenshots/scorecard-top.png)
![Scorecard Bottom](https://raw.githubusercontent.com/Rajaryan1726/leetlab/main/screenshots/scorecard-bottom.png)

> 💡 To add screenshots: create a `screenshots/` folder in the repo root and add the images with the filenames above.

---

## 🛠️ Tech Stack

### Frontend — Port 5173
| Package | Purpose |
|---------|---------|
| React 18 + Vite | SPA framework |
| Zustand | Global state management |
| React Router DOM | Client-side routing |
| TailwindCSS + DaisyUI | Styling |
| Lucide React | Icons |
| React Hot Toast | Notifications |

### Backend — Port 3000
| Package | Purpose |
|---------|---------|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database |
| Cloudinary | PDF cloud storage |
| JWT + bcrypt | Auth & password hashing |
| Multer | File upload middleware |
| pdf-parse | PDF text extraction |
| groq-sdk | Groq AI client — LLaMA 3.1 8b |

### ML Server — Port 8000
| Package | Purpose |
|---------|---------|
| FastAPI + Uvicorn | Python async server |
| HuggingFace Transformers | DistilBERT model |
| PyTorch | Model inference |
| Pydantic | Request validation |

---

## 🏗️ Architecture

```
Browser  (React · 5173)
        │
        │  REST API
        ▼
Express Backend  (Node.js · 3000)
        │
        ├── Promise.all() ──┬──► FastAPI ML Server (8000)
        │   [parallel]      │    DistilBERT · 24 categories · 85.1% acc
        │                   │
        │                   └──► Groq Cloud API
        │                        LLaMA 3.1 8b instant
        │
        ├──► MongoDB  (Docker · 27017)
        └──► Cloudinary  (PDF storage)
```

> `Promise.all()` fires both ML inference and Groq simultaneously — saves ~2–3 seconds per resume analysis.

---

## 🤖 ML Model

Custom-trained **DistilBERT** for job category classification.

| Detail | Value |
|--------|-------|
| Base model | `distilbert-base-uncased` |
| Dataset | 2484 resumes, 24 job categories |
| Training platform | Kaggle — Tesla T4 GPU |
| Training time | ~25 minutes |
| Final accuracy | **85.1%** |
| Model size | 235.8 MB |

| Epoch | Train Loss | Val Loss | Accuracy |
|-------|-----------|----------|----------|
| 1 | 6.27 | 5.49 | 54.3% |
| 2 | 4.92 | 2.25 | 79.9% |
| 3 | 2.56 | 1.49 | 84.1% |
| 4 | 1.23 | 1.32 | **85.1%** |

---

## 📁 Project Structure

```
LeetLab/
├── Frontend/
│   └── src/
│       ├── page/
│       │   ├── MockInterviewPage.jsx    # Interview chat UI
│       │   └── UploadPage.jsx           # Resume upload + analysis results
│       ├── store/
│       │   ├── useInterviewStore.js     # Zustand — interview state + answerCount
│       │   └── useUploadStore.js        # Upload + analysis state
│       └── api/
│           └── upload.api.js
│
└── Backend/
    └── src/
        ├── controllers/
        │   └── resume.controllers.js    # analyzeResume · interviewChat · generateScorecard
        ├── routes/
        │   └── resume.route.js          # POST /analyze · /interview · /scorecard
        ├── ml_servers/
        │   ├── model_server.py          # FastAPI server — DistilBERT inference
        │   ├── requirements.txt
        │   └── resume_model_final/      # Trained model weights (download separately)
        └── index.js
```

---

## 🚀 Setup

### Prerequisites
- Node.js 18+
- Python 3.10+
- Docker
- [Groq API key](https://console.groq.com) — free
- [Cloudinary account](https://cloudinary.com) — free tier

### 1. Clone the repo
```bash
git clone https://github.com/Rajaryan1726/leetlab.git
cd leetlab
```

### 2. Backend
```bash
cd Backend
npm install
```

Create `Backend/.env`:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/leetlab
JWT_SECRET=your_secret_here
JWT_EXPIRY=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant

CLIENT_URL=http://localhost:5173
```

### 3. ML Server
```bash
cd Backend/src/ml_servers
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

> ⚠️ Download the trained model from [Releases](https://github.com/Rajaryan1726/leetlab/releases) and extract into `Backend/src/ml_servers/resume_model_final/`

### 4. Frontend
```bash
cd Frontend
npm install
```

Create `Frontend/.env`:
```
VITE_API_BASE_URL=http://localhost:3000
```

---

## ▶️ Running the Project

Open **4 terminals** and run in order:

```bash
# Terminal 1 — MongoDB (Docker)
docker start mongodb

# Terminal 2 — Backend API
cd Backend
npm run dev

# Terminal 3 — ML Server
cd Backend/src/ml_servers
source venv/bin/activate
uvicorn model_server:app --host 0.0.0.0 --port 8000 --reload

# Terminal 4 — Frontend
cd Frontend
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** 🎉

> First time Docker setup:
> ```bash
> docker run -d -p 27017:27017 --name mongodb mongo:latest
> ```
> After that, just use `docker start mongodb` every time.

---

## 📡 API Endpoints

All protected routes require `Authorization: Bearer <token>` header.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/register` | Register new user | ❌ |
| POST | `/api/v1/auth/login` | Login | ❌ |
| POST | `/api/v1/upload/resume` | Upload PDF to Cloudinary | ✅ |
| POST | `/api/v1/resume/analyze` | Full resume analysis (ML + Groq parallel) | ✅ |
| POST | `/api/v1/resume/interview` | Single interview chat turn | ✅ |
| POST | `/api/v1/resume/scorecard` | Generate final scorecard | ✅ |

<details>
<summary><b>Sample Response — /analyze</b></summary>

```json
{
  "success": true,
  "analysis": {
    "score": 8.2,
    "level": "intermediate",
    "skills": ["C++", "JavaScript", "React.js", "Node.js", "MongoDB", "Express.js"],
    "strengths": ["Strong full-stack experience", "Good project depth"],
    "weaknesses": ["Limited work experience", "No measurable achievements"],
    "missingKeywords": ["Python", "Data Structures", "Algorithms", "Cloud Computing"],
    "suggestions": ["Add measurable achievements", "Include relevant certifications"],
    "category": "INFORMATION-TECHNOLOGY",
    "categoryConfidence": 85.3
  }
}
```
</details>

<details>
<summary><b>Sample Response — /scorecard</b></summary>

```json
{
  "success": true,
  "scorecard": {
    "overallScore": 8,
    "communication": 9,
    "technical": 8,
    "problemSolving": 9,
    "confidence": 8,
    "verdict": "Ready for Junior Role",
    "strengths": ["Strong Node.js understanding", "Good problem-solving"],
    "weaknesses": ["Logging solutions lacking", "Error handling needs work"],
    "feedback": "Showed strong understanding of Node.js and Express...",
    "tips": ["Learn ELK stack for logging", "Improve edge case handling", "Focus on code modularity", "Practice code reviews"]
  }
}
```
</details>

---

## 🔄 Application Flow

```
1.  Register / Login
2.  Upload PDF resume
      └─ pdf-parse extracts text → Cloudinary stores file
3.  Promise.all() fires both simultaneously:
      ├─ DistilBERT ML Server → job category + confidence %
      └─ Groq LLaMA → score, skills, strengths, weaknesses, suggestions
4.  Full analysis displayed with cards and badges
5.  Click "Start Mock Interview"
      └─ React Router navigate() — Zustand state preserved (no page reload)
6.  resumeText saved in sessionStorage
7.  AI reads resume → sends first personalized question
8.  User answers → module-level answerCount++ (fixes stale closure bug)
9.  AI gives brief feedback → asks next question
10. After 6th answer → scorecard auto-generated via POST /scorecard
11. Scorecard: 5 metrics + verdict + tips displayed
```

---

## 🐛 Key Bugs Fixed

| # | Bug | Cause | Fix |
|---|-----|-------|-----|
| 1 | Question counter never reached 6 | Stale closure inside Zustand `sendMessage` | `let answerCount = 0` at module level — outside the store |
| 2 | `sendMessage` not triggering scorecard | Destructured fn captured old closure | `useInterviewStore.getState().sendMessage()` |
| 3 | Zustand state wiped on page change | `window.location.href` caused full reload | React Router `navigate("/mock-interview")` |
| 4 | `PayloadTooLargeError` on PDF upload | Express default 16kb body limit | `express.json({ limit: "10mb" })` |
| 5 | AI ending interview early | LLaMA generating closing remarks itself | System prompt: `"Do NOT conclude the interview yourself"` |
| 6 | ML model not loading | Wrong model folder path | `Backend/src/ml_servers/resume_model_final/` |
| 7 | `pip install` failing on Ubuntu | System-managed Python env | `pip install --break-system-packages` |
| 8 | `evaluation_strategy` error on Kaggle | Newer transformers renamed the arg | Changed to `eval_strategy` |
| 9 | Category badge missing from UI | Two upload components — wrong one rendered | Fixed `UploadPage.jsx` — the actual route component |
| 10 | Groq model 404 error | `llama3-8b-8192` decommissioned by Groq | Updated to `llama-3.1-8b-instant` |

---

## ⚙️ Technical Decisions

| Decision | Why |
|----------|-----|
| `let answerCount = 0` outside Zustand | JS closures inside Zustand don't see updated state — module scope fixes this |
| `useInterviewStore.getState()` in handlers | Direct store access avoids stale closure in event callbacks |
| `sessionStorage` for resumeText | Persists across React Router navigation without backend sessions |
| `Promise.all([mlCall, groqCall])` | Parallel execution — saves ~2–3 seconds per analysis request |
| FastAPI on separate port (8000) | Python ML ecosystem cleanly isolated from Node.js backend |
| DistilBERT over full BERT | 40% faster, 66M vs 110M params, retains 97% of BERT accuracy |
| Groq over OpenAI | 10× faster inference, generous free tier, LLaMA is open source |

---

## 📊 Project Stats

```
3      Servers running simultaneously
6      Interview questions per session  
5      Scorecard metrics evaluated
24     Job categories classified by ML model
85.1%  ML model accuracy
2484   Resumes in training dataset
25     Minutes to train on Tesla T4 GPU
10+    Bugs fixed during development
```

---

## 🙏 Acknowledgements

- [Groq](https://groq.com) — Ultra-fast LLaMA inference
- [HuggingFace](https://huggingface.co) — Transformers library
- [Kaggle](https://kaggle.com) — Dataset + free GPU for training
- [Cloudinary](https://cloudinary.com) — PDF file storage

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

<div align="center">
Made with ❤️ by <a href="https://github.com/Rajaryan1726">Rajaryan1726</a>
</div>