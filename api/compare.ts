
import { GoogleGenAI, Type } from "@google/genai";
import type { ComparisonResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set in Vercel project settings");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Vercel enables streaming by default with this export
export const config = {
  runtime: 'edge',
};

const ratingSchema = {
    type: Type.OBJECT,
    properties: {
        overall: { type: Type.NUMBER, description: "Overall score out of 10. Can be a float." },
        performance: { type: Type.NUMBER, description: "Performance score out of 10. Can be a float." },
        camera: { type: Type.NUMBER, description: "Camera score out of 10. Can be a float." },
        battery: { type: Type.NUMBER, description: "Battery life score out of 10. Can be a float." },
        display: { type: Type.NUMBER, description: "Display quality score out of 10. Can be a float." },
        value: { type: Type.NUMBER, description: "Value for money score out of 10. Can be a float." },
    },
    required: ["overall", "performance", "camera", "battery", "display", "value"]
};

const comparisonSchema = {
  type: Type.OBJECT,
  properties: {
    detailedSummary: {
        type: Type.OBJECT,
        properties: {
            overview: { type: Type.STRING, description: "A brief overall summary of the comparison, about 2-3 sentences." },
            keyDifferences: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 2-3 main differentiating factors." },
            bestForDeviceOne: { type: Type.STRING, description: "Describe the ideal user for the first device in one sentence." },
            bestForDeviceTwo: { type: Type.STRING, description: "Describe the ideal user for the second device in one sentence." },
        },
        required: ["overview", "keyDifferences", "bestForDeviceOne", "bestForDeviceTwo"]
    },
    winner: { type: Type.STRING, description: "The name of the winning device. If it's a tie, state 'It's a tie'." },
    winnerReason: { type: Type.STRING, description: "A short reason for the winner or why it's a tie." },
    deviceOne: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "The full, corrected name of the first device." },
        pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-5 key pros for this device." },
        cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-5 key cons for this device." },
        rating: ratingSchema
      },
      required: ["name", "pros", "cons", "rating"]
    },
    deviceTwo: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "The full, corrected name of the second device." },
        pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-5 key pros for this device." },
        cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-5 key cons for this device." },
        rating: ratingSchema
      },
      required: ["name", "pros", "cons", "rating"]
    }
  },
  required: ["detailedSummary", "winner", "winnerReason", "deviceOne", "deviceTwo"]
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ message: 'Only POST requests are allowed' }), { 
            status: 405, 
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const { deviceOne, deviceTwo } = await req.json();

    if (!deviceOne || !deviceTwo) {
        return new Response(JSON.stringify({ message: 'Please provide both device names.' }), { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    try {
        const prompt = `
            You are a tech comparison expert. Compare the following two devices: "${deviceOne}" and "${deviceTwo}".
            Provide a detailed analysis in JSON format based on the provided schema.
            Your analysis should include:
            1. A detailed summary including an overview, 2-3 key differences, and who each device is best for.
            2. A clear winner and a short reason why. If it's a tie or subjective, explain why.
            3. For each device:
            - Its full, corrected name.
            - A list of 3-5 key pros.
            - A list of 3-5 key cons.
            - A rating object with scores out of 10 (can be a float, e.g. 8.5) for: overall, performance, camera, battery, display, and value.
            Keep pros and cons concise and to the point.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: comparisonSchema,
            },
        });

        const jsonString = response.text.trim();
        
        return new Response(jsonString, {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error("Error in /api/compare:", error);
        return new Response(JSON.stringify({ message: "Failed to get comparison data from AI." }), {
             status: 500,
             headers: { 'Content-Type': 'application/json' }
        });
    }
}
