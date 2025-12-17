import { SprintData, SprintIssue, RiskAnalysisResult } from "../types/sprint";
import { CONSTANTS } from "../utils/constants";

/**
 * Monte Carlo Simulation for Sprint Risk
 * 
 * Instead of simple velocity division, we simulate the sprint 1000 times.
 * Each incomplete issue is treated as a probabilistic event.
 * 
 * Probability of Completion (P) = Base Rate - (Churn Penalty) - (Blocker Penalty)
 */
export function runSprintSimulation(data: SprintData): RiskAnalysisResult {
  const incompleteIssues = data.issues.filter(i => i.status !== 'Done' && i.status !== 'Closed');
  const pointsToFinish = data.totalPoints - data.completedPoints;
  
  if (pointsToFinish <= 0) {
    return {
        sprintVixScore: 0,
        crashProbability: 0,
        riskLevel: 'LOW',
        projectedCompletionPct: 100,
        keyDrivers: ["All work complete"],
        f1Insight: "Chequered flag waved. Outstanding lap."
    };
  }

  let failures = 0;
  let totalPointsDeliveredSum = 0;

  // Run Simulation N times
  for (let i = 0; i < CONSTANTS.SIMULATION_RUNS; i++) {
    let simulatedPoints = 0;

    incompleteIssues.forEach(issue => {
      // Base probability of finishing in remaining time
      // Simple decay: fewer days = lower chance
      let prob = 0.85; 

      // 1. Churn Penalty (Volatility)
      // High churn indicates misunderstood requirements
      if (issue.statusChanges > CONSTANTS.CHURN_THRESHOLD_HIGH) {
        prob -= 0.25; 
      } else if (issue.statusChanges > 1) {
        prob -= 0.1;
      }

      // 2. Blocker Penalty (Safety Car)
      if (issue.isBlocked) {
        prob -= CONSTANTS.BLOCKER_IMPACT_FACTOR;
      }

      // Roll the dice
      if (Math.random() < prob) {
        simulatedPoints += issue.storyPoints;
      }
    });

    const totalSimulated = data.completedPoints + simulatedPoints;
    totalPointsDeliveredSum += totalSimulated;

    // A "Crash" is defined as missing the commitment by > 10%
    if (totalSimulated < (data.totalPoints * 0.9)) {
      failures++;
    }
  }

  // Calculate Metrics
  const crashProbability = failures / CONSTANTS.SIMULATION_RUNS;
  const projectedCompletionPct = (totalPointsDeliveredSum / CONSTANTS.SIMULATION_RUNS) / data.totalPoints;
  
  // Calculate VIX (Volatility Index)
  // We map the crash probability to a 0-100 scale, boosted by high churn
  const avgChurn = incompleteIssues.reduce((sum, i) => sum + i.statusChanges, 0) / (incompleteIssues.length || 1);
  let sprintVixScore = Math.min(100, (crashProbability * 100) + (avgChurn * 5));
  
  // Determine Key Drivers
  const drivers: string[] = [];
  if (avgChurn > 2) drivers.push("Excessive Ticket Churn (Tire Degradation)");
  if (data.daysRemaining < 3 && pointsToFinish > (data.totalPoints * 0.3)) drivers.push("Tight Pit Window (Time/Scope Mismatch)");
  if (incompleteIssues.some(i => i.isBlocked)) drivers.push("Yellow Flags (Blocked Issues)");

  // Determine Risk Level
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (sprintVixScore > CONSTANTS.RISK_HIGH) riskLevel = 'CRITICAL';
  else if (sprintVixScore > CONSTANTS.RISK_MEDIUM) riskLevel = 'HIGH';
  else if (sprintVixScore > CONSTANTS.RISK_LOW) riskLevel = 'MEDIUM';

  return {
    sprintVixScore: Math.round(sprintVixScore),
    crashProbability,
    riskLevel,
    projectedCompletionPct,
    keyDrivers: drivers,
    f1Insight: generateF1Insight(sprintVixScore, drivers)
  };
}

function generateF1Insight(score: number, drivers: string[]): string {
  if (score > 75) {
    return `CRITICAL: Telemetry indicates a likely DNF. ${drivers[0] || 'High volatility'} is eating up performance. Box now for a scope reduction strategy.`;
  } else if (score > 50) {
    return `WARNING: Tire degradation is high. We are losing grip on the sprint commitment. Recommend reducing pace or clearing blocks immediately.`;
  } else {
    return `OPTIMAL: Telemetry is green. Pace is good. Maintain delta management to the finish line.`;
  }
}
