import Resolver from '@forge/resolver';
import { sprintRiskAgentHandler } from './agents/sprintRiskAgent';

// 1. Resolver for Custom UI (Global Page)
const resolver = new Resolver();

resolver.define('risk-engine-fn', async (req) => {
  // Pass the context from the UI request
  return await sprintRiskAgentHandler(req.context);
});

export const handler = resolver.getDefinitions();

// 2. Direct Handler for Rovo Agent
// Rovo invokes the function directly with an event object, not via the Resolver protocol
export const rovoHandler = async (event) => {
  return await sprintRiskAgentHandler(event);
};
