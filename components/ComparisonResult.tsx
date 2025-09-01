
import React from 'react';
import type { ComparisonResult, DeviceComparison } from '../types';
import { CheckIcon, XIcon } from './Icons';

interface ComparisonResultProps {
  result: ComparisonResult;
}

const RatingBar: React.FC<{ label: string; score: number }> = ({ label, score }) => {
    const percentage = score * 10;
    const colorClass = percentage >= 75 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500';
    
    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-slate-300">{label}</span>
                <span className="text-sm font-bold text-cyan-300">{score.toFixed(1)}/10</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                    className={`${colorClass} h-2 rounded-full transition-all duration-500 ease-out`} 
                    style={{ width: `${percentage}%` }}
                    aria-valuenow={score}
                    aria-valuemin={0}
                    aria-valuemax={10}
                    role="progressbar"
                    aria-label={`${label} rating: ${score} out of 10`}
                ></div>
            </div>
        </div>
    );
};

const DeviceCard: React.FC<{ device: DeviceComparison }> = ({ device }) => (
  <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col">
    <h3 className="text-2xl font-bold text-center mb-6 text-slate-100">{device.name}</h3>
    <div className="space-y-6 flex-grow">
      <div>
        <h4 className="flex items-center text-lg font-semibold text-green-400 mb-3">
          <CheckIcon className="w-5 h-5 mr-2" />
          Pros
        </h4>
        <ul className="space-y-2 list-inside">
          {device.pros.map((pro, index) => (
            <li key={index} className="text-slate-300 flex items-start">
              <span className="text-green-400 mr-2 mt-1">&#8226;</span>
              <span>{pro}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="flex items-center text-lg font-semibold text-red-400 mb-3">
          <XIcon className="w-5 h-5 mr-2" />
          Cons
        </h4>
        <ul className="space-y-2 list-inside">
          {device.cons.map((con, index) => (
            <li key={index} className="text-slate-300 flex items-start">
              <span className="text-red-400 mr-2 mt-1">&#8226;</span>
              <span>{con}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
    <div className="mt-6 pt-6 border-t border-slate-700">
        <h4 className="text-lg font-semibold text-cyan-300 mb-4 text-center">Ratings</h4>
        <div className="space-y-3">
            <RatingBar label="Overall" score={device.rating.overall} />
            <RatingBar label="Performance" score={device.rating.performance} />
            <RatingBar label="Camera" score={device.rating.camera} />
            <RatingBar label="Battery" score={device.rating.battery} />
            <RatingBar label="Display" score={device.rating.display} />
            <RatingBar label="Value" score={device.rating.value} />
        </div>
    </div>
  </div>
);

const ComparisonResultDisplay: React.FC<ComparisonResultProps> = ({ result }) => {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4 text-cyan-300">Summary & Verdict</h2>
        <p className="text-slate-300 text-center mb-6">{result.detailedSummary.overview}</p>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <h3 className="font-semibold text-slate-200 mb-2">Key Differences</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                    {result.detailedSummary.keyDifferences.map((diff, i) => <li key={i}>{diff}</li>)}
                </ul>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                 <h3 className="font-semibold text-slate-200 mb-2">Best For...</h3>
                 <p className="text-slate-400 mb-2"><strong>{result.deviceOne.name}:</strong> {result.detailedSummary.bestForDeviceOne}</p>
                 <p className="text-slate-400"><strong>{result.deviceTwo.name}:</strong> {result.detailedSummary.bestForDeviceTwo}</p>
            </div>
        </div>
        
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
          <p className="text-center font-semibold text-slate-100">
            <span className="font-bold text-yellow-400">Winner: {result.winner}</span> - {result.winnerReason}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <DeviceCard device={result.deviceOne} />
        <DeviceCard device={result.deviceTwo} />
      </div>
    </div>
  );
};

export default ComparisonResultDisplay;