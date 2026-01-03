import { Zap } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-primary/20 via-background to-accent/20 text-center py-10 px-4 shadow-sm">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-4 mb-2">
          <Zap className="w-10 h-10 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            SignalScope Pro
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Professional signal analysis for oscilloscope data
        </p>
      </div>
    </header>
  );
}
