"use client"

import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import type { OscilloscopeData, AppSettings } from '@/lib/types';

interface OscilloscopeChartProps {
  data: OscilloscopeData;
  settings: AppSettings;
  title: string;
  visibleChannels: string[];
  colorIndex?: number;
  containerId: string;
}

const MAX_POINTS_TO_RENDER = 5000;
const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];


const CustomGrid = ({ x, y, width, height, xTicks, yTicks }: any) => {
  if (!xTicks || !yTicks) return null;

  return (
    <g className="recharts-custom-grid">
      {/* Vertical grid lines */}
      {xTicks.map((tick: any, i: number) => (
        <line
          key={`v-grid-${i}`}
          x1={tick.coordinate}
          y1={y}
          x2={tick.coordinate}
          y2={y + height}
          stroke={i === Math.floor(xTicks.length / 2) ? 'hsl(var(--scope-grid-center))' : 'hsl(var(--scope-grid))'}
          strokeOpacity={i === Math.floor(xTicks.length / 2) ? 0.7 : 0.5}
          strokeDasharray="2 2"
        />
      ))}
      {/* Horizontal grid lines */}
      {yTicks.map((tick: any, i: number) => (
         <line
          key={`h-grid-${i}`}
          x1={x}
          y1={tick.coordinate}
          x2={x + width}
          y2={tick.coordinate}
          stroke={i === Math.floor(yTicks.length / 2) ? 'hsl(var(--scope-grid-center))' : 'hsl(var(--scope-grid))'}
          strokeOpacity={i === Math.floor(yTicks.length / 2) ? 0.7 : 0.5}
          strokeDasharray="2 2"
        />
      ))}
    </g>
  );
};

export default function OscilloscopeChart({ data, settings, title, visibleChannels, colorIndex, containerId }: OscilloscopeChartProps) {
  const { scope: scopeSettings } = settings;
  const timeInSeconds = data.time;
  const chartRef = useRef<HTMLDivElement>(null);
  
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{x: number, domain: [number, number]} | null>(null);

  const [yDomain, setYDomain] = useState<[number, number]>(() => {
    if (settings.separatePlots && visibleChannels.length === 1) {
        const channelName = visibleChannels[0];
        const channelScopeSettings = scopeSettings.channels[channelName];
        const center = channelScopeSettings.yPosition;
        const halfRange = 4 * channelScopeSettings.voltsPerDiv;
        return [center - halfRange, center + halfRange];
    }
    let globalMin = Infinity, globalMax = -Infinity;
    visibleChannels.forEach(channelName => {
        const channelSettings = scopeSettings.channels[channelName];
        if (!channelSettings || !channelSettings.enabled) return;
        const center = channelSettings.yPosition;
        const halfRange = 4 * channelSettings.voltsPerDiv;
        globalMin = Math.min(globalMin, center - halfRange);
        globalMax = Math.max(globalMax, center + halfRange);
    });
    if(globalMin === Infinity) return [-1, 1];
    return [globalMin, globalMax];
  });

  const [xDomain, setXDomain] = useState<[number, number]>(() => {
    const totalDivisions = 10;
    const totalTimeSpan = scopeSettings.timePerDiv * totalDivisions;
    const xCenter = scopeSettings.xPosition;
    return [xCenter - totalTimeSpan / 2, xCenter + totalTimeSpan / 2];
  });

  useEffect(() => {
    const newYDomain: [number, number] = (() => {
        if (settings.separatePlots && visibleChannels.length === 1) {
            const channelName = visibleChannels[0];
            const channelScopeSettings = scopeSettings.channels[channelName];
            const center = channelScopeSettings.yPosition;
            const halfRange = 4 * channelScopeSettings.voltsPerDiv;
            return [center - halfRange, center + halfRange];
        }
        let globalMin = Infinity, globalMax = -Infinity;
        visibleChannels.forEach(channelName => {
            const channelSettings = scopeSettings.channels[channelName];
            if (!channelSettings || !channelSettings.enabled) return;
            const center = channelSettings.yPosition;
            const halfRange = 4 * channelSettings.voltsPerDiv;
            globalMin = Math.min(globalMin, center - halfRange);
            globalMax = Math.max(globalMax, center + halfRange);
        });
        if(globalMin === Infinity) return [-1, 1];
        return [globalMin, globalMax];
    })();
    setYDomain(newYDomain);

    const newXDomain: [number, number] = (() => {
        const totalDivisions = 10;
        const totalTimeSpan = scopeSettings.timePerDiv * totalDivisions;
        const xCenter = scopeSettings.xPosition;
        return [xCenter - totalTimeSpan / 2, xCenter + totalTimeSpan / 2];
    })();
    setXDomain(newXDomain);

  }, [scopeSettings, visibleChannels, settings.separatePlots]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.85 : 1.15; // Zoom in or out
    
    const chart = chartRef.current;
    if (!chart) return;

    const chartRect = chart.getBoundingClientRect();
    const mouseX = e.clientX - chartRect.left;
    
    // Find the SVG chart area (where the data is actually plotted)
    const chartArea = chart.querySelector('.recharts-surface');
    if (!chartArea) return;

    const chartAreaRect = chartArea.getBoundingClientRect();
    const relativeMouseX = e.clientX - chartAreaRect.left;

    // This is an approximation of the chart's inner padding/margin
    const chartInternalLeftOffset = 60; // Approximate width of Y-axis label area
    const chartInternalWidth = chartAreaRect.width - chartInternalLeftOffset - 30; // Approx right padding

    if (relativeMouseX < chartInternalLeftOffset || relativeMouseX > chartInternalLeftOffset + chartInternalWidth) {
      return; // Mouse is outside the main plot area
    }
    
    const mouseXRatio = (relativeMouseX - chartInternalLeftOffset) / chartInternalWidth;

    const [min, max] = xDomain;
    const range = max - min;
    const mouseTime = min + range * mouseXRatio;
    
    const newRange = range * zoomFactor;
    const newMin = mouseTime - newRange * mouseXRatio;
    const newMax = mouseTime + newRange * (1 - mouseXRatio);
    
    setXDomain([newMin, newMax]);

  }, [xDomain]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsPanning(true);
    setPanStart({ x: e.clientX, domain: xDomain });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !panStart) return;
    e.preventDefault();
  
    const dx = e.clientX - panStart.x;
    
    const chart = chartRef.current;
    if (!chart) return;

    const chartRect = chart.getBoundingClientRect();
    const chartWidth = chartRect.width;
    
    const domainRange = panStart.domain[1] - panStart.domain[0];
    const panFactor = dx / chartWidth;
    const domainShift = domainRange * panFactor;
    
    const newMin = panStart.domain[0] - domainShift;
    const newMax = panStart.domain[1] - domainShift;
    
    setXDomain([newMin, newMax]);
  };
  
  const handleMouseUp = (e: React.MouseEvent) => {
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
    }
  };

  const downsampledData = useMemo(() => {
    if (!data.time || data.time.length === 0) return [];
    
    const [startX, endX] = xDomain;
    
    let startIndex = data.time.findIndex(t => t >= startX);
    let endIndex = data.time.findIndex(t => t > endX);
    if (startIndex === -1) startIndex = 0;
    if (endIndex === -1) endIndex = data.time.length;
    
    const visibleTime = data.time.slice(startIndex, endIndex);
    if (visibleTime.length === 0) return [];

    const factor = Math.ceil(visibleTime.length / MAX_POINTS_TO_RENDER);
    const chartData: { time: number; [key: string]: number }[] = [];
    
    for (let i = 0; i < visibleTime.length; i += factor) {
        const dataIndex = startIndex + i;
        const dataPoint: { time: number; [key: string]: number } = { time: data.time[dataIndex] };
        for(const channelName of visibleChannels) {
            dataPoint[channelName] = data.channels[channelName][dataIndex];
        }
        chartData.push(dataPoint);
    }
    return chartData;
  }, [data, xDomain, visibleChannels]);

  const formatTick = (tick: number, unit: string) => {
    if (tick === 0) return `0`;
    const absTick = Math.abs(tick);

    const span = Math.abs(xDomain[1] - xDomain[0]);
    if (unit === 's' && span < 1e-4) {
      return tick.toExponential(1);
    }
    
    if (absTick >= 1e9) return `${(tick / 1e9).toPrecision(3)}G`;
    if (absTick >= 1e6) return `${(tick / 1e6).toPrecision(3)}M`;
    if (absTick >= 1e3) return `${(tick / 1e3).toPrecision(3)}k`;
    if (absTick < 1e-9) return `${(tick * 1e12).toPrecision(3)}p`;
    if (absTick < 1e-6) return `${(tick * 1e9).toPrecision(3)}n`;
    if (absTick < 1e-3) return `${(tick * 1e3).toPrecision(3)}m`;
    return `${tick.toPrecision(3)}`;
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-background/80 border border-border rounded-md shadow-lg">
          <p className="label text-sm text-muted-foreground">{`Time: ${formatTick(label, 's')}s`}</p>
          {payload.map((pld: any, index: number) => (
             <p key={index} className="intro" style={{ color: pld.stroke }}>
              {`${pld.name}: ${formatTick(pld.value, 'V')}V`}
             </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card 
        data-container-id={containerId}
        className="shadow-md bg-[--scope-background] border-gray-700 overflow-hidden"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
    >
        <div className='text-center pt-4 text-lg text-foreground font-semibold'>{title}</div>
      <div ref={chartRef} className="h-[500px] select-none">
        <ResponsiveContainer>
          <LineChart data={downsampledData} margin={{ top: 5, right: 30, left: 10, bottom: 20 }}>
             {settings.showGrid && <CustomGrid />}
            <XAxis 
              dataKey="time" 
              type="number" 
              domain={xDomain}
              ticks={[...Array(11)].map((_, i) => xDomain[0] + (i * (xDomain[1] - xDomain[0]) / 10))}
              tickFormatter={(tick) => formatTick(tick, 's')}
              stroke="hsl(var(--scope-grid))"
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--scope-grid))' }}
              tickLine={{ stroke: 'hsl(var(--scope-grid))' }}
              allowDataOverflow
              label={{ value: "Time (s)", position: "insideBottom", offset: -10, fill: 'hsl(var(--foreground))' }}
            />
            <YAxis
                type="number"
                domain={yDomain}
                ticks={[...Array(9)].map((_, i) => yDomain[0] + (i * (yDomain[1] - yDomain[0]) / 8))}
                tickFormatter={(tick) => formatTick(tick, 'V')}
                stroke="hsl(var(--scope-grid))"
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--scope-grid))' }}
                tickLine={{ stroke: 'hsl(var(--scope-grid))' }}
                allowDataOverflow
                width={55}
                label={{ value: "Voltage (V)", angle: -90, position: 'insideLeft', offset: -20, fill: 'hsl(var(--foreground))' }}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }}
              isAnimationActive={false}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value, entry) => <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>}
            />
            {visibleChannels.map((channelName, index) => (
              <Line
                key={channelName}
                dataKey={channelName}
                stroke={CHART_COLORS[colorIndex !== undefined ? colorIndex % 5 : index % 5]}
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
                name={channelName}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
