import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  unit?: string;
  className?: string;
}

export function StatCard({ title, value, unit, className }: StatCardProps) {
  return (
    <div className={`p-4 bg-secondary/50 rounded-lg text-center ${className}`}>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="text-2xl font-semibold text-foreground tracking-tight">{value}</p>
      {unit && <p className="text-xs text-muted-foreground">{unit}</p>}
    </div>
  );
}
