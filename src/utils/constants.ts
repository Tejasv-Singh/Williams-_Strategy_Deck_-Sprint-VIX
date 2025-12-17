export const CONSTANTS = {
  SIMULATION_RUNS: 1000,
  CHURN_THRESHOLD_HIGH: 3, // If ticket moves status > 3 times, it's high risk
  BLOCKER_IMPACT_FACTOR: 0.2, // Blocked tickets have 20% less chance of completion
  VIX_SCALING_FACTOR: 100,
  
  // Risk Thresholds
  RISK_LOW: 25,
  RISK_MEDIUM: 50,
  RISK_HIGH: 75
};
