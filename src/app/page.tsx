"use client";

import { useState, useCallback } from 'react';
import Header from '@/components/layout/header';
import FileUpload from '@/components/file-upload';
import Dashboard from '@/components/dashboard';
import WelcomeGuide from '@/components/welcome-guide';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import type { OscilloscopeData, Statistics, AppSettings, ScopeSettings, ParsedData } from '@/lib/types';
import { parseData, calculateStatistics } from '@/lib/analysis';

export default function Home() {
  const [data, setData] = useState<OscilloscopeData | null>(null);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const getDefaultScopeSettings = useCallback((data: OscilloscopeData): ScopeSettings => {
    const totalTime = (data.time[data.time.length - 1] - data.time[0]); // in seconds
    const timePerDiv = totalTime > 0 ? totalTime / 10 : 1e-3; // 10 divisions on screen

    const channelSettings: { [key: string]: { voltsPerDiv: number; yPosition: number; enabled: boolean; } } = {};
    Object.keys(data.channels).forEach(channelName => {
      const channelData = data.channels[channelName];
      const maxV = Math.max(...channelData.map(Math.abs));
      const voltsPerDiv = Math.ceil(maxV / 4); // Aim for 8 divisions total (+/-4)

      channelSettings[channelName] = {
        voltsPerDiv: voltsPerDiv > 0 ? voltsPerDiv : 1,
        yPosition: 0,
        enabled: true,
      };
    });

    return {
      timePerDiv: timePerDiv > 0 ? timePerDiv : 1e-3, // sensible default
      xPosition: totalTime/2, // Center the initial view
      channels: channelSettings,
    };
  }, []);

  const handleFileProcess = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setData(null);
    setStats(null);
    setSettings(null);

    try {
      const content = await file.text();
      if (!content) {
        throw new Error('File is empty.');
      }
      
      const parsedResult: ParsedData = parseData(content, file.name);
      const parsedData = parsedResult.data;
      const calculatedStats = calculateStatistics(parsedData);
      
      setData(parsedData);
      setStats(calculatedStats);
      
      const initialScopeSettings = parsedResult.scopeSettings ? parsedResult.scopeSettings : getDefaultScopeSettings(parsedData);

      setSettings({
        showGrid: true,
        showStats: true,
        separatePlots: false,
        chartType: 'line',
        scope: initialScopeSettings,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Processing Error",
        description: errorMessage,
      });
      setData(null);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [toast, getDefaultScopeSettings]);

  const handleResetScope = useCallback(() => {
    if (data && settings) {
      // We can't just re-run getDefaultScopeSettings as the header might have initial settings
      // A full re-process could work, but for now, we just reset to the default view.
      // A more robust implementation might store the "from-header" settings separately.
      const defaultScopeSettings = getDefaultScopeSettings(data);
      setSettings({ ...settings, scope: defaultScopeSettings });
    }
  }, [data, settings, getDefaultScopeSettings]);

  const resetApp = () => {
    setData(null);
    setStats(null);
    setError(null);
    setSettings(null);
    setIsLoading(false);
  }

  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-7xl mx-auto">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <LoadingSpinner />
              <p className="text-muted-foreground">Processing your data...</p>
            </div>
          )}

          {!data && !isLoading && (
            <div className="space-y-12">
              <FileUpload onFileProcess={handleFileProcess} error={error} />
              <WelcomeGuide />
            </div>
          )}

          {data && stats && settings && !isLoading && (
            <Dashboard 
              data={data} 
              stats={stats} 
              settings={settings} 
              onSettingsChange={setSettings}
              onReset={resetApp}
              onResetScope={handleResetScope}
            />
          )}
        </div>
      </main>
    </>
  );
}
