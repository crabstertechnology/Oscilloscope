export interface ChannelData {
  [channelName: string]: number[];
}

export interface OscilloscopeData {
  fileName: string;
  time: number[];
  channels: ChannelData;
}

export interface ChannelStats {
  mean: number;
  rms: number;
  peakToPeak: number;
  min: number;
  max: number;
  stdDev: number;
  frequency: number;
}

export interface OverallStats {
  duration: number;
  sampleRate: number;
  totalSamples: number;
  channelCount: number;
}

export interface Statistics {
  overall: OverallStats;
  channels: {
    [channelName: string]: ChannelStats;
  };
}

export interface ScopeChannelSettings {
  voltsPerDiv: number;
  yPosition: number; // This is now an absolute voltage offset
  enabled: boolean;
}

export interface ScopeSettings {
  timePerDiv: number;
  xPosition: number; // This is now an absolute time offset
  channels: {
    [key: string]: ScopeChannelSettings;
  };
}

export interface AppSettings {
  showGrid: boolean;
  showStats: boolean;
  separatePlots: boolean;
  chartType: 'line' | 'scatter';
  scope: ScopeSettings;
}

export interface ParsedData {
  data: OscilloscopeData;
  scopeSettings?: ScopeSettings;
}
