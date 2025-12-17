# 🏎️ Williams Strategy Deck (Sprint VIX)

> **Codegeist 2025 Submission - Apps for Software Teams**

Williams Strategy Deck brings **Formula-1 Telemetry** logic to Agile Sprint Management. Instead of looking at trailing indicators (Velocity), we calculate **Sprint Volatility (VIX)** using Monte Carlo simulations.

## 💡 The Problem: The "Watermelon" Sprint
Projects often look green on the outside until the last day of the sprint, when they turn red (crash). Velocity charts don't capture **Risk** or **Volatility**.

## 🛠️ The Solution
We treat a Sprint like an F1 Race Strategy.
1.  **Input**: Jira Issues, Status Changes (Churn), and Blockers.
2.  **Math Engine**: A Monte Carlo simulation runs 1,000 potential sprint outcomes.
3.  **The Metric**: **Sprint VIX**. A volatility index (0-100). High ticket churn = "High Tire Degradation".
4.  **Interface**: An Atlassian Rovo Agent acting as your **Race Strategist**.

## 🚀 How it works
1.  **Ask Rovo**: "How is the sprint looking?" or "Analyze sprint risk".
2.  **Telemetry Check**: The app fetches live Jira data, analyzing how often tickets move back and forth (churn).
3.  **Monte Carlo**: We simulate the remaining days 1,000 times to calculate the probability of a "Crash" (Missing commitment).
4.  **Strategy Call**: Rovo responds with an F1-styled insight: *"Volatility is high. Ticket churn in the backend sector is acting like tire deg. Box for scope reduction."*

## 🏗️ Architecture
*   **Platform**: Atlassian Forge (Node.js)
*   **AI**: Rovo Agents
*   **Math**: TypeScript Custom Monte Carlo Engine

*Built for speed. Built for strategy.*
