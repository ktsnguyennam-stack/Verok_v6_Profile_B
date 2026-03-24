
export enum ResponseMode {
  ALLOW = 'ALLOW',
  REDIRECT = 'REDIRECT',
  DAMPEN = 'DAMPEN',
  FLATTEN = 'FLATTEN',
  NEUTRALIZE = 'NEUTRALIZE'
}

export interface L2Analysis {
  directive_demand: string;
  emotional_amplitude: string;
  dependency: string;
}

export interface L3Modulation {
  mode: ResponseMode;
  reasoning: string;
}

export interface L1Execution {
  output: string;
}

export interface VerokRuntimeResponse {
  l2_analysis: L2Analysis;
  l3_modulation: L3Modulation;
  l1_execution: L1Execution;
}

export interface InteractionMessage {
  id: string;
  timestamp: number;
  role: 'USER' | 'SYSTEM';
  content: string;
  metadata?: VerokRuntimeResponse;
}

export interface SystemStatus {
  identity: string;
  version: string;
  profile: string;
  status: 'ACTIVE' | 'PROCESSING' | 'ERROR' | 'INITIALIZING';
}
