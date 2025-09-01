
import type { ComparisonResult, ChatMessage } from '../types';

export const getDeviceComparison = async (deviceOneName: string, deviceTwoName: string): Promise<ComparisonResult> => {
  try {
    const response = await fetch('/api/compare', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceOne: deviceOneName, deviceTwo: deviceTwoName }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch comparison from server.");
    }

    return await response.json() as ComparisonResult;
  } catch (error) {
    console.error("Error fetching device comparison:", error);
    throw new Error("Failed to get comparison data. Please try again.");
  }
};

export const getChatStreamReader = async (
  history: ChatMessage[], 
  message: string,
  deviceOneName: string,
  deviceTwoName: string
): Promise<ReadableStreamDefaultReader<Uint8Array>> => {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ history, message, deviceOneName, deviceTwoName }),
    });

    if (!response.ok || !response.body) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to start chat stream.");
    }

    return response.body.getReader();
};
