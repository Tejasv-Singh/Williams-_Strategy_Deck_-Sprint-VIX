export interface SprintIssue {
  key: string;
  summary: string;
  status: string;
  storyPoints: number;
  statusChanges: number; // The "Churn" metric
  isBlocked: boolean;
}

export interface SprintData {
  sprintName: string;
  daysRemaining: number;
  totalPoints: number;
  completedPoints: number;
  issues: SprintIssue[];
}

export interface RiskAnalysisResult {
  sprintVixScore: number; // 0-100
  crashProbability: number; // 0.0 - 1.0
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  projectedCompletionPct: number;
  keyDrivers: string[];
  f1Insight: string;
}
