import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { invoke } from '@forge/bridge';

interface RiskAnalysisResult {
  sprintVixScore: number;
  crashProbability: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  projectedCompletionPct: number;
  keyDrivers: string[];
  f1Insight: string;
}

interface TelemetryResponse {
  success: boolean;
  telemetry: {
    sprint: string;
    vixIndex: number;
    probabilityOfFailure: string;
    status: string;
  };
  analysis: RiskAnalysisResult;
  error?: string;
}

// Mock Data for fallback when running outside of Jira (e.g., Preview/Dev)
const MOCK_DATA: TelemetryResponse = {
  success: true,
  telemetry: {
    sprint: "MONACO SPRINT (SIMULATION)",
    vixIndex: 82,
    probabilityOfFailure: "72.4%",
    status: "HIGH"
  },
  analysis: {
    sprintVixScore: 82,
    crashProbability: 0.724,
    riskLevel: 'HIGH',
    projectedCompletionPct: 0.78,
    keyDrivers: [
      "Critical Path blocked (Turn 4)",
      "Excessive Churn in Backend components"
    ],
    f1Insight: "CRITICAL: Telemetry indicates a likely DNF. Excessive Churn in Backend components is eating up performance. Box now for a scope reduction strategy."
  }
};

const App = () => {
  const [data, setData] = useState<TelemetryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We wrap the invoke call in an async function with try/catch
    // to gracefully handle the "Unable to establish a connection" error
    // which occurs when the app is run outside of an Atlassian product iframe.
    const fetchData = async () => {
      try {
        const res = await invoke('risk-engine-fn');
        setData(res as TelemetryResponse);
        setLoading(false);
      } catch (err) {
        console.warn('Bridge connection failed (likely running in preview/dev). Loading Simulation Data.', err);
        // Fallback to mock data so the UI can still be viewed/tested
        setTimeout(() => {
          setData(MOCK_DATA);
          setLoading(false);
        }, 800); // Small delay to simulate network
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <h2 className="f1-font">Initializing Strategy Engine...</h2>
        <p className="mono">Connecting to Pit Wall Telemetry</p>
      </div>
    );
  }

  if (!data || !data.success || !data.analysis) {
    return (
      <div className="error">
        <h2>Telemetry Offline</h2>
        <p>{data?.error || "No active sprint data detected in current context."}</p>
      </div>
    );
  }

  const { analysis, telemetry } = data;
  
  // Determine color based on risk
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'text-green';
      case 'MEDIUM': return 'text-yellow';
      case 'HIGH': return 'text-red'; // Orange-ish in CSS
      case 'CRITICAL': return 'text-red';
      default: return 'text-main';
    }
  };

  const riskColorClass = getRiskColor(analysis.riskLevel);

  return (
    <div className="container">
      <header className="header">
        <div className="brand">WILLIAMS STRATEGY DECK</div>
        <div className="mono" style={{ color: '#00A0E2' }}>LIVE TELEMETRY // {telemetry.sprint.toUpperCase()}</div>
      </header>

      <div className="telemetry-grid">
        {/* Main VIX Gauge */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span className="panel-title">SPRINT VOLATILITY INDEX (VIX)</span>
          <div className="vix-display">
            <div className={`vix-score ${riskColorClass}`}>{analysis.sprintVixScore}</div>
            <div className={`vix-label ${riskColorClass}`}>{analysis.riskLevel} RISK</div>
          </div>
        </div>

        {/* Probability Stats */}
        <div className="panel">
          <span className="panel-title">SIMULATION STATS (n=1000)</span>
          <div className="stat-row">
            <span className="stat-label">Crash Prob.</span>
            <span className={`stat-value ${analysis.crashProbability > 0.3 ? 'text-red' : 'text-green'}`}>
              {(analysis.crashProbability * 100).toFixed(1)}%
            </span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Proj. Completion</span>
            <span className="stat-value mono">
              {(analysis.projectedCompletionPct * 100).toFixed(1)}%
            </span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Status</span>
            <span className="stat-value mono">TRACKING</span>
          </div>
        </div>

        {/* Key Drivers */}
        <div className="panel">
          <span className="panel-title">RISK DRIVERS</span>
          {analysis.keyDrivers.length > 0 ? (
            analysis.keyDrivers.map((driver, idx) => (
              <div key={idx} className="driver-item">
                ⚠️ {driver}
              </div>
            ))
          ) : (
            <div className="driver-item" style={{ borderColor: 'var(--success)', background: 'rgba(0,204,68,0.1)' }}>
               Clean Air. No Issues.
            </div>
          )}
        </div>
      </div>

      {/* Strategic Insight */}
      <div className="insight-box">
        <span className="panel-title" style={{ color: '#00A0E2' }}>STRATEGY ENGINEER</span>
        <div className="insight-text">
          "{analysis.f1Insight}"
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
