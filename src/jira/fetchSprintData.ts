import api, { route } from "@forge/api";
import { SprintData, SprintIssue } from "../types/sprint";

export async function fetchActiveSprintData(context: any): Promise<SprintData> {
  // 1. Find the active sprint for the context (assuming Project context or general query)
  // For robustness in this demo, we search for the first active sprint in the user's scope
  const jql = 'sprint in openSprints() ORDER BY rank ASC';
  
  const searchResponse = await api.asApp().requestJira(route`/rest/api/3/search?jql=${jql}&expand=changelog&maxResults=50`, {
    headers: { 'Accept': 'application/json' }
  });

  const searchData = await searchResponse.json();
  const issuesRaw = searchData.issues || [];

  if (issuesRaw.length === 0) {
    throw new Error("No active sprint data found. Are there issues assigned to an open sprint?");
  }

  // Extract Sprint Meta from the first issue
  // Custom field extraction for sprint is complex, assuming standard structure or parsing fields
  // For MVP, we calculate days remaining generically or mock if API doesn't return end date easily in search
  const daysRemaining = 5; // Simplified for Hackathon demo. In prod, fetch sprint object.

  let totalPoints = 0;
  let completedPoints = 0;
  
  const issues: SprintIssue[] = issuesRaw.map((issue: any) => {
    // Determine Status Churn (Volatilty Signal)
    const history = issue.changelog?.histories || [];
    let statusChanges = 0;
    
    history.forEach((change: any) => {
      change.items.forEach((item: any) => {
        if (item.field === 'status') statusChanges++;
      });
    });

    // Extract Story Points (Standard custom field or estimate)
    // Note: In real world, field IDs vary. We assume 'customfield_10016' or similar, 
    // but for safety we default to 1 if missing for calculation.
    const points = issue.fields.customfield_10016 || 3; 

    const statusCategory = issue.fields.status.statusCategory.key; // 'done', 'indeterminate', 'new'
    const isDone = statusCategory === 'done';
    
    totalPoints += points;
    if (isDone) completedPoints += points;

    return {
      key: issue.key,
      summary: issue.fields.summary,
      status: issue.fields.status.name,
      storyPoints: points,
      statusChanges: statusChanges,
      isBlocked: issue.fields.status.name.toLowerCase().includes('block') || false
    };
  });

  return {
    sprintName: "Active Sprint (Detected)",
    daysRemaining,
    totalPoints,
    completedPoints,
    issues
  };
}
