import { Zap, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-primary/20 via-background to-accent/20 py-6 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Zap className="w-10 h-10 text-primary" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              SignalScope Pro
            </h1>
            <p className="text-md text-muted-foreground">
              Professional signal analysis for oscilloscope data
            </p>
          </div>
        </div>
        <a href="https://www.crabstertech.in/" target="_blank" rel="noopener noreferrer">
          <Button variant="outline">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
        </a>
      </div>
    </header>
  );
}
