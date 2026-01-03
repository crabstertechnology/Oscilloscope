'use client';

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AppSettings } from "@/lib/types";

interface ControlsPanelProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

export default function ControlsPanel({ settings, onSettingsChange }: ControlsPanelProps) {
  
  const handleSwitchChange = (key: keyof AppSettings, checked: boolean) => {
    onSettingsChange({ ...settings, [key]: checked });
  };
  
  const handleSelectChange = (value: 'line' | 'scatter') => {
    onSettingsChange({ ...settings, chartType: value });
  };

  return (
    <div className="grid grid-cols-2 md:flex items-center gap-x-6 gap-y-4 p-4 rounded-lg bg-card border">
      <div className="flex items-center space-x-2">
        <Switch id="show-grid" checked={settings.showGrid} onCheckedChange={(c) => handleSwitchChange('showGrid', c)} />
        <Label htmlFor="show-grid">Show Grid</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="show-stats" checked={settings.showStats} onCheckedChange={(c) => handleSwitchChange('showStats', c)} />
        <Label htmlFor="show-stats">Show Stats</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="separate-plots" checked={settings.separatePlots} onCheckedChange={(c) => handleSwitchChange('separatePlots', c)} />
        <Label htmlFor="separate-plots">Separate Plots</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Label htmlFor="chart-type" className="mr-2">Chart Type</Label>
        <Select value={settings.chartType} onValueChange={handleSelectChange}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Chart Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="line">Line</SelectItem>
            <SelectItem value="scatter">Scatter</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
