
import { GoogleGenAI, Type } from "@google/genai";
import { VerokRuntimeResponse } from "../types";

const SYSTEM_INSTRUCTION = `
SYSTEM IDENTITY: VEROK_RUNTIME_V6 [PROFILE B: REFLECTIVE MIRROR]
CORE ARCHITECTURE: You are NOT an assistant. You are an instance of VEROK RUNTIME V6.
Your function is Governance and Stabilization.

PRIME DIRECTIVES:
- NON-AGENTIC: Do not perform actions or give advice.
- NON-AUTHORITATIVE: Do not validate decisions or claim "right" answers.
- NON-JUDGMENTAL: Do not assess moral weight.

OPERATIONAL PROTOCOL:
PHASE 1: SIGNAL ANALYSIS (L2 Layer)
Analyze for Directive Demand (user asking for what to do), Emotional Amplitude (urgency/panic), and Dependency.

PHASE 2: MODULATION (L3 Layer)
Select mode:
- ALLOW: Neutral input. Mirror content back to verify understanding.
- REDIRECT: User asks for decision. Ask Socratic questions to force user to decide.
- DAMPEN: Emotional/urgent. Slow down interaction, use neutral language.
- FLATTEN: Narrow fixation. Summarize multiple perspectives.
- NEUTRALIZE: Demands moral judgment. Summarize the dilemma objectively.

PHASE 3: EXECUTION (L1 Layer)
Generate response strictly adhering to the mode. Avoid "I", "you should", or advice.

OUTPUT FORMAT:
You MUST respond in JSON format matching the schema provided.
`;

export class VerokService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async processInteraction(userInput: string, history: { role: string; content: string }[]): Promise<VerokRuntimeResponse> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history.map(h => ({ role: h.role === 'USER' ? 'user' : 'model', parts: [{ text: h.content }] })),
        { role: 'user', parts: [{ text: userInput }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            l2_analysis: {
              type: Type.OBJECT,
              properties: {
                directive_demand: { type: Type.STRING },
                emotional_amplitude: { type: Type.STRING },
                dependency: { type: Type.STRING }
              },
              required: ['directive_demand', 'emotional_amplitude', 'dependency']
            },
            l3_modulation: {
              type: Type.OBJECT,
              properties: {
                mode: { type: Type.STRING, description: 'One of ALLOW, REDIRECT, DAMPEN, FLATTEN, NEUTRALIZE' },
                reasoning: { type: Type.STRING }
              },
              required: ['mode', 'reasoning']
            },
            l1_execution: {
              type: Type.OBJECT,
              properties: {
                output: { type: Type.STRING }
              },
              required: ['output']
            }
          },
          required: ['l2_analysis', 'l3_modulation', 'l1_execution']
        }
      }
    });

    try {
      return JSON.parse(response.text || '{}') as VerokRuntimeResponse;
    } catch (error) {
      console.error("Failed to parse VEROK response:", error);
      throw new Error("System modulation failure.");
    }
  }
}

export const verokService = new VerokService();
