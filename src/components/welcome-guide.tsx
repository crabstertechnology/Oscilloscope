import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, FileDown, ListChecks, MousePointerClick, UploadCloud } from 'lucide-react';

const FeatureItem = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-secondary/50 transition-colors">
    <div className="mt-1 text-primary">{icon}</div>
    <div>
      <h4 className="font-semibold text-lg">{title}</h4>
      <p className="text-muted-foreground">{description}</p>
    </div>
  </div>
);

const StepItem = ({ step, title, description }: { step: number, title: string, description: string }) => (
  <div className="flex items-start gap-4">
    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold text-lg shrink-0">
      {step}
    </div>
    <div>
      <h4 className="font-semibold text-lg">{title}</h4>
      <p className="text-muted-foreground">{description}</p>
    </div>
  </div>
);


export default function WelcomeGuide() {
  return (
    <div className="space-y-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Welcome to SignalScope Pro!</CardTitle>
          <CardDescription className="text-lg">Your professional toolkit for analyzing oscilloscope data from Multisim and other sources.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureItem 
              icon={<MousePointerClick className="h-6 w-6" />}
              title="Interactive Waveform Analysis"
              description="Zoom with your mouse wheel and pan by clicking and dragging to inspect every detail of your waveform data on the virtual oscilloscope."
            />
            <FeatureItem 
              icon={<ListChecks className="h-6 w-6" />}
              title="Professional Scope Controls"
              description="Fine-tune your view with familiar hardware-style controls for Time/Div, V/Div, and X/Y positioning for each channel."
            />
            <FeatureItem 
              icon={<BarChart className="h-6 w-6" />}
              title="Comprehensive Statistics"
              description="Instantly get key metrics like RMS, Peak-to-Peak, Frequency, and more for each channel and for the overall signal."
            />
            <FeatureItem 
              icon={<FileDown className="h-6 w-6" />}
              title="Data Export"
              description="Export your cleaned, processed data to a CSV file or save a high-resolution PNG image of the chart for your reports."
            />
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle className="text-3xl">How to Get Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
            <StepItem 
              step={1}
              title="Upload Your File"
              description="Drag and drop your .scp, .txt, or .csv file into the upload zone above, or click 'Choose File' to select it from your computer."
            />
             <StepItem 
              step={2}
              title="Analyze and Interact"
              description="Once loaded, use the scope controls to zoom and pan. Toggle stats, separate plots, and view calculated metrics for your signals."
            />
             <StepItem 
              step={3}
              title="Export Your Results"
              description="When you're ready, use the export buttons to save your raw data as a CSV or capture the current chart view as a PNG image."
            />
        </CardContent>
      </Card>
    </div>
  );
}
