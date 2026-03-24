
import React from 'react';
import { VerokRuntimeResponse, ResponseMode } from '../types';

interface LayerDisplayProps {
  data: VerokRuntimeResponse;
}

const LayerDisplay: React.FC<LayerDisplayProps> = ({ data }) => {
  const getModeColor = (mode: ResponseMode) => {
    switch (mode) {
      case ResponseMode.ALLOW: return 'text-green-400';
      case ResponseMode.REDIRECT: return 'text-blue-400';
      case ResponseMode.DAMPEN: return 'text-yellow-400';
      case ResponseMode.FLATTEN: return 'text-purple-400';
      case ResponseMode.NEUTRALIZE: return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="mt-4 p-4 border border-green-900 bg-black/50 text-xs font-mono space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* L2 ANALYSIS */}
        <div className="space-y-2">
          <div className="text-green-500 font-bold border-b border-green-900 pb-1 flex justify-between">
            <span>[L2_SIGNAL_ANALYSIS]</span>
            <span className="animate-pulse">●</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">DIRECTIVE_DEMAND:</span>
              <span>{data.l2_analysis.directive_demand}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">EMOTIONAL_AMPLITUDE:</span>
              <span>{data.l2_analysis.emotional_amplitude}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">DEPENDENCY_SIGNAL:</span>
              <span>{data.l2_analysis.dependency}</span>
            </div>
          </div>
        </div>

        {/* L3 MODULATION */}
        <div className="space-y-2">
          <div className="text-green-500 font-bold border-b border-green-900 pb-1 flex justify-between">
            <span>[L3_VECTOR_STABILIZATION]</span>
            <span className="animate-pulse">●</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">RESPONSE_MODE:</span>
              <span className={`font-bold ${getModeColor(data.l3_modulation.mode)}`}>
                {data.l3_modulation.mode}
              </span>
            </div>
            <div className="text-[10px] leading-tight text-gray-400 mt-2">
              <span className="text-gray-500">REASONING:</span> {data.l3_modulation.reasoning}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayerDisplay;
