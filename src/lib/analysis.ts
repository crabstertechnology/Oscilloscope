import type { OscilloscopeData, Statistics, ChannelStats, OverallStats, ScopeSettings, ParsedData } from './types';

function parseHeaderValue(line: string): number | string | null {
  const parts = line.split(':');
  if (parts.length < 2) return null;
  const value = parts[1].trim();

  // Handle different value formats (e.g., "yes", "5.000000 volts per division")
  const lowerValue = value.toLowerCase();
  if (lowerValue === 'yes') return true;
  if (lowerValue === 'no') return false;

  const floatValue = parseFloat(value);
  if (!isNaN(floatValue)) {
    return floatValue;
  }

  return value; // Return as string if not a number or boolean-like
}

export function parseData(content: string, fileName: string): ParsedData {
  const lines = content.split(/\r?\n/);
  const time: number[] = [];
  const channels: { [key: string]: number[] } = {};
  
  let isHeader = true;
  const headerSettings: any = {
    channels: {}
  };

  const dataLines: string[] = [];
  const connectedChannels: string[] = [];

  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return; // Skip empty lines

    // Header parsing
    if (isHeader) {
      if (line.includes(':')) {
        if (line.toLowerCase().includes('time base')) {
          headerSettings.timePerDiv = parseHeaderValue(line);
        } else if (line.toLowerCase().includes('time offset')) {
          headerSettings.xPosition = parseHeaderValue(line);
        } else if (line.toLowerCase().includes('channel a sensitivity')) {
          if (!headerSettings.channels['Channel A']) headerSettings.channels['Channel A'] = {};
          headerSettings.channels['Channel A'].voltsPerDiv = parseHeaderValue(line);
        } else if (line.toLowerCase().includes('channel a offset')) {
          if (!headerSettings.channels['Channel A']) headerSettings.channels['Channel A'] = {};
          headerSettings.channels['Channel A'].yPosition = parseHeaderValue(line);
        } else if (line.toLowerCase().includes('channel a connected')) {
          if (parseHeaderValue(line) === true) connectedChannels.push('Channel A');
        } else if (line.toLowerCase().includes('channel b sensitivity')) {
          if (!headerSettings.channels['Channel B']) headerSettings.channels['Channel B'] = {};
          headerSettings.channels['Channel B'].voltsPerDiv = parseHeaderValue(line);
        } else if (line.toLowerCase().includes('channel b offset')) {
          if (!headerSettings.channels['Channel B']) headerSettings.channels['Channel B'] = {};
          headerSettings.channels['Channel B'].yPosition = parseHeaderValue(line);
        } else if (line.toLowerCase().includes('channel b connected')) {
           if (parseHeaderValue(line) === true) connectedChannels.push('Channel B');
        }
      }

      // Check for end of header
      if (trimmedLine.startsWith('Time') && trimmedLine.includes('Channel')) {
        isHeader = false;
      }
    } else {
        // Data lines start after header markers like "----" or the column headers themselves
        if (!line.includes('----')) {
             dataLines.push(line);
        }
    }
  });

  if (dataLines.length === 0) {
      // Fallback for files without a clear header/data separator
      lines.forEach(line => {
        const trimmedLine = line.trim();
         if (trimmedLine && !isNaN(parseFloat(trimmedLine.split(/[\s,t]+/)[0]))) {
            dataLines.push(trimmedLine);
         }
      });
  }

  dataLines.forEach(line => {
    const parts = line.trim().split(/[\s,t]+/).map(p => parseFloat(p)).filter(p => !isNaN(p));
    
    if (parts.length >= 2) {
      time.push(parts[0]);

      // Only process connected channels
      for (let i = 0; i < connectedChannels.length; i++) {
        const channelName = connectedChannels[i];
        if (parts.length > i + 1) {
            if (!channels[channelName]) {
                channels[channelName] = [];
            }
            channels[channelName].push(parts[i + 1]);
        }
      }
    }
  });


  if (time.length === 0) {
    throw new Error('No valid data points found in the file. Please check the file format.');
  }

  // Ensure all channel arrays have the same length
  const minLength = Math.min(time.length, ...Object.values(channels).map(c => c.length));
  const consistentTime = time.slice(0, minLength);
  const consistentChannels: { [key: string]: number[] } = {};
  for (const key in channels) {
    consistentChannels[key] = channels[key].slice(0, minLength);
  }

  const oscilloscopeData: OscilloscopeData = { fileName, time: consistentTime, channels: consistentChannels };
  
  // Finalize scope settings from header, ensuring all properties exist
  const finalScopeSettings: ScopeSettings = {
      timePerDiv: typeof headerSettings.timePerDiv === 'number' ? headerSettings.timePerDiv : 1e-3,
      xPosition: typeof headerSettings.xPosition === 'number' ? headerSettings.xPosition : 0,
      channels: {},
  };

  const allFoundChannels = Object.keys(headerSettings.channels);
  allFoundChannels.forEach(name => {
      const isConnected = connectedChannels.includes(name);
      finalScopeSettings.channels[name] = {
          voltsPerDiv: headerSettings.channels[name]?.voltsPerDiv ?? 1,
          yPosition: headerSettings.channels[name]?.yPosition ?? 0,
          enabled: isConnected,
      };
  });
  // Add any channels found in data but not header
  Object.keys(oscilloscopeData.channels).forEach(name => {
    if (!finalScopeSettings.channels[name]) {
        finalScopeSettings.channels[name] = {
            voltsPerDiv: 1,
            yPosition: 0,
            enabled: true
        }
    }
  });


  return { data: oscilloscopeData, scopeSettings: finalScopeSettings };
}

export function calculateStatistics(data: OscilloscopeData): Statistics {
  const channelNames = Object.keys(data.channels);

  const channelStats: { [key: string]: ChannelStats } = {};

  const timeInSeconds = data.time;

  channelNames.forEach(name => {
    const values = data.channels[name];
    if (values.length === 0) return;

    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;

    const sumSquares = values.reduce((a, b) => a + (b * b), 0);
    const rms = Math.sqrt(sumSquares / values.length);

    const max = Math.max(...values);
    const min = Math.min(...values);
    const peakToPeak = max - min;

    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Frequency estimation (zero-crossing)
    let zeroCrossings = 0;
    for (let i = 1; i < values.length; i++) {
      if ((values[i-1] - mean) * (values[i] - mean) < 0) {
        zeroCrossings++;
      }
    }
    const durationSec = timeInSeconds.length > 1 ? timeInSeconds[timeInSeconds.length - 1] - timeInSeconds[0] : 0;
    const frequency = durationSec > 0 ? zeroCrossings / (2 * durationSec) : 0;

    channelStats[name] = { mean, rms, peakToPeak, min, max, stdDev, frequency };
  });

  const duration = timeInSeconds.length > 1 ? (timeInSeconds[timeInSeconds.length - 1] - timeInSeconds[0]) : 0;
  const overallStats: OverallStats = {
    duration,
    sampleRate: timeInSeconds.length > 1 && duration > 0 ? (data.time.length / duration) : 0,
    totalSamples: data.time.length,
    channelCount: channelNames.length,
  };

  return { overall: overallStats, channels: channelStats };
}
