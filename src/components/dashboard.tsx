import type { OscilloscopeData, Statistics, AppSettings } from '@/lib/types';
import ControlsPanel from './controls-panel';
import StatisticsDisplay from './stats/statistics-display';
import ChartDisplay from './charts/chart-display';
import ExportButtons from './export-buttons';
import { Button } from './ui/button';
import { Upload } from 'lucide-react';
import ScopeControls from './scope-controls';

interface DashboardProps {
  data: OscilloscopeData;
  stats: Statistics;
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onReset: () => void;
  onResetScope: () => void;
}

export default function Dashboard({ data, stats, settings, onSettingsChange, onReset, onResetScope }: DashboardProps) {
  const enabledChannels = Object.keys(settings.scope.channels).filter(
    (name) => settings.scope.channels[name].enabled
  );

  const chartContainerIds = settings.separatePlots
    ? enabledChannels.map((name) => `chart-${name.replace(/\s+/g, '-')}`)
    : ['chart-overlay'];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <ControlsPanel settings={settings} onSettingsChange={onSettingsChange} />
        <div className="flex gap-2 self-start pt-2">
            <ExportButtons data={data} />
            <Button variant="outline" onClick={onReset}>
                <Upload className="mr-2 h-4 w-4" /> New File
            </Button>
        </div>
      </div>
      
      {settings.showStats && (
        <StatisticsDisplay stats={stats} />
      )}
      
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <ChartDisplay 
            data={data} 
            settings={settings}
            chartContainerIds={chartContainerIds}
          />
        </div>
        <div className="xl:w-80 shrink-0">
          <ScopeControls 
            settings={settings.scope} 
            onSettingsChange={(scopeSettings) => onSettingsChange({...settings, scope: scopeSettings})}
            allChannelNames={Object.keys(settings.scope.channels)}
            onReset={onResetScope}
          />
        </div>
      </div>
    </div>
  );
}
