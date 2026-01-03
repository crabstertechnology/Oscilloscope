'use client';

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCcw, ChevronUp, ChevronDown } from "lucide-react";
import type { ScopeSettings, ScopeChannelSettings } from "@/lib/types";

interface ScopeControlsProps {
  settings: ScopeSettings;
  onSettingsChange: (settings: ScopeSettings) => void;
  allChannelNames: string[];
  onReset: () => void;
}

const TIMEBASE_VALUES = [
  1e-9, 2e-9, 5e-9, 10e-9, 20e-9, 50e-9, 100e-9, 200e-9, 500e-9,
  1e-6, 2e-6, 5e-6, 10e-6, 20e-6, 50e-6, 100e-6, 200e-6, 500e-6,
  1e-3, 2e-3, 5e-3, 10e-3, 20e-3, 50e-3, 100e-3, 200e-3, 500e-3,
  1, 2, 5
]; // s/Div

const VOLTAGE_SCALE_VALUES = [
  0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50
]; // V/Div

const findClosestValue = (arr: number[], value: number) => {
    if (value === null || value === undefined) return arr[0];
    return arr.reduce((prev, curr) => (Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev));
};

const formatValue = (value: number, unit: string) => {
    if (value === null || value === undefined) return `N/A ${unit}`;
    if (value === 0) return `0 ${unit}`;
    const absValue = Math.abs(value);
    if (absValue >= 1) return `${value.toPrecision(3)} ${unit}`;
    if (absValue >= 1e-3) return `${(value * 1e3).toPrecision(3)} m${unit}`;
    if (absValue >= 1e-6) return `${(value * 1e6).toPrecision(3)} µ${unit}`;
    return `${(value * 1e9).toPrecision(3)} n${unit}`;
};

export default function ScopeControls({ settings, onSettingsChange, allChannelNames, onReset }: ScopeControlsProps) {

  const adjustValue = (arr: number[], currentValue: number, direction: 'increase' | 'decrease'): number => {
    const closestVal = findClosestValue(arr, currentValue);
    const currentIndex = arr.indexOf(closestVal);
    let newIndex = currentIndex;

    if (direction === 'increase' && currentIndex < arr.length - 1) {
      newIndex = currentIndex + 1;
    } else if (direction === 'decrease' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    }
    return arr[newIndex];
  };

  const handleTimebaseAdjust = (direction: 'increase' | 'decrease') => {
    const newValue = adjustValue(TIMEBASE_VALUES, settings.timePerDiv, direction);
    onSettingsChange({ ...settings, timePerDiv: newValue });
  };
  
  const handleXPosAdjust = (direction: 'increase' | 'decrease') => {
    const increment = settings.timePerDiv / 10; // Pan by 1/10th of a division
    const newXPos = settings.xPosition + (direction === 'increase' ? increment : -increment);
    onSettingsChange({ ...settings, xPosition: newXPos });
  };

  const handleChannelScaleAdjust = (channelName: string, direction: 'increase' | 'decrease') => {
    const currentScale = settings.channels[channelName].voltsPerDiv;
    const newScale = adjustValue(VOLTAGE_SCALE_VALUES, currentScale, direction);
    handleChannelChange(channelName, 'voltsPerDiv', newScale);
  };

  const handleChannelPosAdjust = (channelName: string, direction: 'increase' | 'decrease') => {
    const currentScale = settings.channels[channelName].voltsPerDiv;
    const increment = currentScale / 10; // Position moves by 1/10th of a division
    const currentPos = settings.channels[channelName].yPosition;
    const newPos = currentPos + (direction === 'increase' ? increment : -increment);
    handleChannelChange(channelName, 'yPosition', newPos);
  };

  const handleChannelChange = (channelName: string, key: keyof Omit<ScopeChannelSettings, 'enabled'>, value: number) => {
    onSettingsChange({
      ...settings,
      channels: {
        ...settings.channels,
        [channelName]: {
          ...settings.channels[channelName],
          [key]: value,
        },
      },
    });
  };

  return (
    <Card className="w-full md:w-[320px]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Scope Controls</CardTitle>
        <Button variant="ghost" size="icon" onClick={onReset} title="Reset Scope Controls">
            <RefreshCcw className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        {/* Timebase */}
        <div className="space-y-2 p-3 rounded-lg border bg-secondary/30">
          <Label className="font-semibold text-center block">Horizontal</Label>
          <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground w-16">Time/Div</span>
              <div className="flex items-center gap-1">
                <Button size="icon-sm" variant="outline" onClick={() => handleTimebaseAdjust('decrease')}><ChevronDown className="h-4 w-4" /></Button>
                <span className="font-mono text-sm w-24 text-center">{formatValue(settings.timePerDiv, 's')}</span>
                <Button size="icon-sm" variant="outline" onClick={() => handleTimebaseAdjust('increase')}><ChevronUp className="h-4 w-4" /></Button>
              </div>
          </div>
          <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground w-16">X Position</span>
              <div className="flex items-center gap-1">
                <Button size="icon-sm" variant="outline" onClick={() => handleXPosAdjust('decrease')}><ChevronDown className="h-4 w-4" /></Button>
                <span className="font-mono text-sm w-24 text-center">{formatValue(settings.xPosition, 's')}</span>
                <Button size="icon-sm" variant="outline" onClick={() => handleXPosAdjust('increase')}><ChevronUp className="h-4 w-4" /></Button>
              </div>
          </div>
        </div>

        {/* Channel Controls */}
        {allChannelNames.map((name, index) => {
            const channelSettings = settings.channels[name];
            const isEnabled = channelSettings?.enabled ?? false;

            return (
              <div key={name} className={`space-y-2 p-3 rounded-lg border bg-secondary/30 ${!isEnabled ? 'opacity-50' : ''}`}>
                <Label className="font-semibold text-center block" style={{ color: isEnabled ? `hsl(var(--chart-${(index % 5) + 1}))` : 'hsl(var(--muted-foreground))' }}>
                    {name} { !isEnabled && '(Not Connected)'}
                </Label>
                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground w-16">Volts/Div</span>
                    <div className="flex items-center gap-1">
                      <Button size="icon-sm" variant="outline" onClick={() => handleChannelScaleAdjust(name, 'decrease')} disabled={!isEnabled}><ChevronDown className="h-4 w-4" /></Button>
                      <span className="font-mono text-sm w-24 text-center">{formatValue(channelSettings?.voltsPerDiv, 'V')}</span>
                      <Button size="icon-sm" variant="outline" onClick={() => handleChannelScaleAdjust(name, 'increase')} disabled={!isEnabled}><ChevronUp className="h-4 w-4" /></Button>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground w-16">Y Position</span>
                     <div className="flex items-center gap-1">
                      <Button size="icon-sm" variant="outline" onClick={() => handleChannelPosAdjust(name, 'decrease')} disabled={!isEnabled}><ChevronDown className="h-4 w-4" /></Button>
                      <span className="font-mono text-sm w-24 text-center">{formatValue(channelSettings?.yPosition, 'V')}</span>
                      <Button size="icon-sm" variant="outline" onClick={() => handleChannelPosAdjust(name, 'increase')} disabled={!isEnabled}><ChevronUp className="h-4 w-4" /></Button>
                    </div>
                </div>
              </div>
            )
        })}
      </CardContent>
    </Card>
  );
}
