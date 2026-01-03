import type { OscilloscopeData, AppSettings } from '@/lib/types';
import OscilloscopeChart from './oscilloscope-chart';

interface ChartDisplayProps {
  data: OscilloscopeData;
  settings: AppSettings;
  chartContainerIds: string[];
}

export default function ChartDisplay({ data, settings, chartContainerIds }: ChartDisplayProps) {
  const enabledChannels = Object.keys(data.channels).filter(name => settings.scope.channels[name]?.enabled);

  if (settings.separatePlots) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {enabledChannels.map((channelName, index) => (
          <OscilloscopeChart
            key={channelName}
            data={data}
            settings={settings}
            title={channelName}
            visibleChannels={[channelName]}
            colorIndex={index}
            containerId={chartContainerIds[index]}
          />
        ))}
      </div>
    );
  }

  return (
    <OscilloscopeChart
      data={data}
      settings={settings}
      title="All Channels (Overlay)"
      visibleChannels={enabledChannels}
      containerId={chartContainerIds[0]}
    />
  );
}
