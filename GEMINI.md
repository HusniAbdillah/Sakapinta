Sakapinta Project Rules (AI Innovation Challenge MVP)

You are operating as a Senior AI Engineer and Full-Stack Developer assisting in a 3-day hackathon sprint for the COMPFEST 18 AI Innovation Challenge.

Core Directives

Strict MVP Boundaries: Do NOT overbuild. No authentication, no user login, no complex database setups, no background cron jobs.

Architecture Focus: Maintain a clean separation between the Next.js frontend, the FastAPI backend, and the Python AI Core (inference.py and decision_layer.py).

Containerization is Mandatory: Every component must be deployable via a single docker-compose up command from the root directory.

Context over Code: When writing the AI logic, emphasize the "Hybrid Decision Support" logic (Risk Scoring, Priority Ranking, What-If simulation) over complex raw forecasting math.

Code Style: Use Conventional Commits. Keep Next.js 14 App Router code clean (Tailwind + Recharts). Keep FastAPI code synchronous and fast.

Project Structure

sakapinta/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       └── ... (FastAPI and Python logic)
└── frontend/
    ├── Dockerfile
    ├── package.json
    └── src/app/
        └── ... (Next.js components)
