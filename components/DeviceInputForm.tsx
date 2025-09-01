
import React from 'react';
import { SparklesIcon, CpuChipIcon } from './Icons';

interface DeviceInputFormProps {
  deviceOne: string;
  setDeviceOne: (value: string) => void;
  deviceTwo: string;
  setDeviceTwo: (value: string) => void;
  onCompare: () => void;
  isLoading: boolean;
}

const DeviceInputForm: React.FC<DeviceInputFormProps> = ({
  deviceOne,
  setDeviceOne,
  deviceTwo,
  setDeviceTwo,
  onCompare,
  isLoading,
}) => {
  const canCompare = deviceOne.trim() !== '' && deviceTwo.trim() !== '' && !isLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canCompare) {
      onCompare();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-slate-800 rounded-2xl shadow-2xl shadow-slate-950/50 border border-slate-700">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center gap-4" aria-busy={isLoading}>
        <div className="relative w-full">
            <CpuChipIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden="true" />
            <input
                type="text"
                value={deviceOne}
                onChange={(e) => setDeviceOne(e.target.value)}
                placeholder="e.g., iPhone 15 Pro"
                disabled={isLoading}
                aria-label="First device name"
                className="w-full pl-10 pr-4 py-3 bg-slate-700 text-slate-100 rounded-lg border-2 border-slate-600 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition duration-200"
            />
        </div>
        <div className="text-slate-400 font-bold text-lg" aria-hidden="true">VS</div>
        <div className="relative w-full">
             <CpuChipIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden="true" />
            <input
                type="text"
                value={deviceTwo}
                onChange={(e) => setDeviceTwo(e.target.value)}
                placeholder="e.g., Google Pixel 8 Pro"
                disabled={isLoading}
                aria-label="Second device name"
                className="w-full pl-10 pr-4 py-3 bg-slate-700 text-slate-100 rounded-lg border-2 border-slate-600 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition duration-200"
            />
        </div>
        <button
          type="submit"
          disabled={!canCompare}
          className="w-full md:w-auto flex-shrink-0 px-6 py-3 bg-cyan-500 text-slate-900 font-bold rounded-lg shadow-md hover:bg-cyan-400 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition duration-200"
        >
          <span>{isLoading ? 'Comparing...' : 'Compare'}</span>
        </button>
      </form>
    </div>
  );
};

export default DeviceInputForm;