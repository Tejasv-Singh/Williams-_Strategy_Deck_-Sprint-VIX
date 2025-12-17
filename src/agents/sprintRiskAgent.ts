import { fetchActiveSprintData } from "../jira/fetchSprintData";
import { runSprintSimulation } from "../math/monteCarlo";

export async function sprintRiskAgentHandler(event: any) {
  try {
    console.log("🏎️ Williams Strategy Deck: Starting Telemetry Analysis...");

    // 1. Get Data
    const sprintData = await fetchActiveSprintData(event);
    
    // 2. Run Math Engine
    const riskAnalysis = runSprintSimulation(sprintData);

    console.log("✅ Analysis Complete:", JSON.stringify(riskAnalysis));

    // 3. Return JSON to Rovo
    // Rovo will use the LLM to process this JSON into the final conversational response
    return {
      success: true,
      telemetry: {
        sprint: sprintData.sprintName,
        vixIndex: riskAnalysis.sprintVixScore,
        probabilityOfFailure: `${(riskAnalysis.crashProbability * 100).toFixed(1)}%`,
        status: riskAnalysis.riskLevel
      },
      analysis: riskAnalysis,
      message: "Strategy engine calculation complete."
    };

  } catch (error) {
    console.error("❌ Telemetry Failure:", error);
    return {
      success: false,
      error: "Telemetry connection failed. Could not retrieve sprint data."
    };
  }
}
