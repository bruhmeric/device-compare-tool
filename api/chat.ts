
// FIX: Removed VercelRequest and VercelResponse as they are for the Node.js runtime, not the edge runtime.
import { GoogleGenAI, type Content } from "@google/genai";
import type { ChatMessage } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set in Vercel project settings");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Vercel enables streaming by default with this export
export const config = {
  runtime: 'edge',
};

// FIX: Changed handler signature to use the standard Request object for edge functions.
export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        // FIX: Use standard Response object for edge functions.
        return new Response(JSON.stringify({ message: 'Only POST requests are allowed' }), { 
            status: 405, 
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    // FIX: req.json() is available on the standard Request object.
    const { history, message, deviceOneName, deviceTwoName } = await req.json();

    if (!history || !message || !deviceOneName || !deviceTwoName) {
        return new Response(JSON.stringify({ message: 'Missing required parameters.' }), { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const systemInstruction = `You are a helpful AI assistant specializing in tech device comparisons. 
You have just provided an in-depth comparison between ${deviceOneName} and ${deviceTwoName}.
The user will now ask follow-up questions based on this specific comparison. 
Your answers should be concise, accurate, and directly related to the comparison context. 
Do not introduce new topics unless asked. Base your knowledge on the information you used for the original comparison.`;

        // FIX: Map client-side history to the format expected by the Gemini API.
        const geminiHistory = (history as ChatMessage[])
            .slice(1) // Remove initial assistant message for the SDK history
            .map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction,
            },
            history: geminiHistory as Content[],
        });

        const stream = await chat.sendMessageStream({ message });

        const readableStream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                for await (const chunk of stream) {
                    const text = chunk.text;
                    if (text) {
                        controller.enqueue(encoder.encode(text));
                    }
                }
                controller.close();
            }
        });

        return new Response(readableStream, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });

    } catch (error) {
        console.error("Error in /api/chat:", error);
        return new Response(JSON.stringify({ message: 'Failed to get chat response from AI.' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
