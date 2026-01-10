import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'SignalScope Pro',
  description: 'Professional signal analysis for Multisim oscilloscope data',
};

const CrabIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M13 2v6" />
      <path d="M11 2v6" />
      <path d="M12 8a2.5 2.5 0 0 0-2.5 2.5c0 1.57 2.5 2.5 2.5 2.5s2.5-.93 2.5-2.5a2.5 2.5 0 0 0-2.5-2.5Z" />
      <path d="M22 13h-4.2" />
      <path d="M2 13h4.2" />
      <path d="M17.8 13a4.5 4.5 0 0 1-3.6 3.6" />
      <path d="M6.2 13a4.5 4.5 0 0 0 3.6 3.6" />
      <path d="M17 19l-1-3" />
      <path d="M7 19l1-3" />
    </svg>
  );

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
        <div className="flex-grow">
            {children}
        </div>
        <Toaster />
        <footer className="px-4 py-8 mt-auto text-sm text-muted-foreground">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
            <div className="flex items-center gap-x-4">
              <a href="https://www.crabstertech.in/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <CrabIcon className="h-6 w-6" />
                <span className="sr-only">Homepage</span>
              </a>
              <span className="text-muted-foreground">
                © {new Date().getFullYear()} SignalScope Pro
              </span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
