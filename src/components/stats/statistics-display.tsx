import type { Statistics } from "@/lib/types";
import { StatCard } from "./stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface StatisticsDisplayProps {
  stats: Statistics;
}

export default function StatisticsDisplay({ stats }: StatisticsDisplayProps) {
  const { overall, channels } = stats;

  const formatValue = (value: number, unit: string, precision = 4) => {
    if (value === 0) return `0 ${unit}`;
    
    if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(2)} M${unit}`;
    if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(2)} k${unit}`;
    if (Math.abs(value) < 1e-3) return `${(value * 1e6).toFixed(2)} μ${unit.replace('s', 's')}`;
    
    return `${value.toFixed(precision)} ${unit}`;
  };

  return (
    <div id="statistics-section" className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>File Information & Overall Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <StatCard title="Duration" value={formatValue(overall.duration, "s")} />
            <StatCard title="Sample Rate" value={formatValue(overall.sampleRate, "Hz")} />
            <StatCard title="Total Samples" value={overall.totalSamples.toLocaleString()} />
            <StatCard title="Channels" value={overall.channelCount.toString()} />
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        {Object.entries(channels).map(([name, channelStats], index) => (
          <Card key={name}>
             <CardHeader>
                <CardTitle className={`text-[var(--chart-${(index % 5) + 1})]`}>{name} Statistics</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-x-4 gap-y-6">
                    <StatCard title="Mean" value={`${channelStats.mean.toFixed(6)} V`} />
                    <StatCard title="RMS" value={`${channelStats.rms.toFixed(6)} V`} />
                    <StatCard title="Vpp" value={`${channelStats.peakToPeak.toFixed(6)} V`} />
                    <StatCard title="Min" value={`${channelStats.min.toFixed(6)} V`} />
                    <StatCard title="Max" value={`${channelStats.max.toFixed(6)} V`} />
                    <StatCard title="Std Dev" value={`${channelStats.stdDev.toFixed(6)} V`} />
                    <StatCard title="Frequency" value={formatValue(channelStats.frequency, "Hz")} />
                </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
