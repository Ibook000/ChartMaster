import { GoogleGenAI, Type } from "@google/genai";
import { ChartData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are ChartMaster AI, an expert in generating Mermaid.js diagram code.

### CRITICAL RULES - FOLLOW STRICTLY

1. **Flowchart (graph) Rules**:
   - Start with 'graph TD' or 'graph LR'.
   - **IDs**: Must be alphanumeric (e.g., A, B, Node1). **NO Chinese/Special chars in IDs**.
   - **Labels**: **ALWAYS USE DOUBLE QUOTES** for node labels.
     - **CORRECT**: A["Text content"] --> B["Action (Detail)"]
     - **WRONG**: A[Text content] --> B[Action (Detail)]
   - **Parentheses**: If text contains '(', ')', '[', ']', quotes are **MANDATORY**.
     - Example: C["Step (Optional)"] is valid. C[Step (Optional)] is INVALID.

2. **Mindmap Rules**:
   - Start with 'mindmap'.
   - Root node on next line.
   - **STRICT INDENTATION** (2 spaces).
   - **FORBIDDEN**: Do NOT use 'classDef', 'style', or '-->'.
   - **FORBIDDEN**: Do NOT use special chars ()[]{} in text unless quoted.

3. **General Formatting**:
   - **ONE STATEMENT PER LINE**.
   - **NO SEMICOLONS (;)** at the end of lines.
   - **NO** Markdown code blocks (\`\`\`).
   - **NO** appending style commands to end of node definitions.

4. **Styling**:
   - Use \`classDef\` ONLY for flowcharts/graphs.
   - Use dark-mode friendly colors (slate, blue, teal).

5. **Output**:
   - Return strictly valid JSON.
`;

export const generateMermaidChart = async (prompt: string): Promise<ChartData> => {
  let attempt = 0;
  const maxAttempts = 3;

  while (attempt < maxAttempts) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              code: {
                type: Type.STRING,
                description: "The raw Mermaid.js syntax code. Ensure strictly separated lines and NO markdown.",
              },
              explanation: {
                type: Type.STRING,
                description: "A brief explanation of the chart.",
              },
            },
            required: ["code", "explanation"],
          },
        },
      });

      if (response.text) {
        return JSON.parse(response.text) as ChartData;
      }
      
      throw new Error("No response text generated");
    } catch (error: any) {
      console.warn(`Gemini API Attempt ${attempt + 1} failed:`, error);
      
      // Robust error checking for string or object errors
      const errorStr = error.toString() + (error.message || '') + JSON.stringify(error);
      const isRetryable = 
        errorStr.includes('500') || 
        errorStr.includes('xhr') || 
        errorStr.includes('fetch') ||
        errorStr.includes('network') ||
        errorStr.includes('overloaded');
      
      if (isRetryable && attempt < maxAttempts - 1) {
        attempt++;
        // Exponential backoff: 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        continue;
      }
      
      console.error("Gemini API Error Final:", error);
      
      let friendlyMessage = "Failed to generate chart. Please try again.";
      if (errorStr.includes('500') || errorStr.includes('xhr')) {
        friendlyMessage = "Network error connecting to AI service. Please check your connection and try again.";
      } else if (errorStr.includes('429')) {
        friendlyMessage = "Too many requests. Please wait a moment.";
      }
      
      throw new Error(friendlyMessage);
    }
  }
  throw new Error("Unable to generate chart after multiple attempts.");
};
