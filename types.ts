import type { Chat } from '@google/genai';

export interface DeviceRating {
  overall: number;
  performance: number;
  camera: number;
  battery: number;
  display: number;
  value: number;
}

export interface DeviceComparison {
  name: string;
  pros: string[];
  cons:string[];
  rating: DeviceRating;
}

export interface ComparisonResult {
  detailedSummary: {
    overview: string;
    keyDifferences: string[];
    bestForDeviceOne: string;
    bestForDeviceTwo: string;
  };
  winner: string;
  winnerReason: string;
  deviceOne: DeviceComparison;
  deviceTwo: DeviceComparison;
}


export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatState {
  instance: Chat | null;
  history: ChatMessage[];
  isTyping: boolean;
}
