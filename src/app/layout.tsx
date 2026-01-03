import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'SignalScope Pro',
  description: 'Professional signal analysis for Multisim oscilloscope data',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body id="export-container" className="font-body antialiased min-h-svh flex flex-col">
        {children}
        <Toaster />
        <footer className="text-center py-4 text-sm text-muted-foreground mt-auto">
          Report generated with SignalScope Pro
        </footer>
      </body>
    </html>
  );
}
