'use client';

import { Button } from "@/components/ui/button";
import { Sheet, FileText } from "lucide-react";
import type { OscilloscopeData } from "@/lib/types";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { LoadingSpinner } from "./ui/loading-spinner";
import { useState } from "react";

interface ExportButtonsProps {
  data: OscilloscopeData;
}

export default function ExportButtons({ data }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportCSV = () => {
    const headers = ['Time(s)', ...Object.keys(data.channels)];
    let csvContent = headers.join(',') + '\n';

    for (let i = 0; i < data.time.length; i++) {
      const timeInSeconds = data.time[i];
      const row = [timeInSeconds.toExponential(9)];
      for (const channelName of Object.keys(data.channels)) {
        row.push(data.channels[channelName][i].toExponential(6));
      }
      csvContent += row.join(',') + '\n';
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${data.fileName.split('.')[0]}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const exportPDF = async () => {
    setIsExporting(true);
    const element = document.getElementById('export-container');
    if (!element) {
        setIsExporting(false);
        return;
    };

    try {
        const canvas = await html2canvas(element, {
            useCORS: true,
            scale: 2, // Higher scale for better quality
            backgroundColor: getComputedStyle(document.body).backgroundColor,
            windowWidth: 1920, // A fixed, wide width to ensure full capture
            windowHeight: element.scrollHeight,
        });

        const imgData = canvas.toDataURL('image/png');

        // A4 page size: 210mm x 297mm
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        const ratio = imgWidth / imgHeight;
        
        const finalImgWidth = pdfWidth;
        const finalImgHeight = pdfWidth / ratio;
        

        pdf.addImage(imgData, 'PNG', 0, 0, finalImgWidth, finalImgHeight);
        pdf.save(`${data.fileName.split('.')[0]}_report.pdf`);

    } catch (error) {
        console.error("Error exporting PDF:", error);
    } finally {
        setIsExporting(false);
    }
  };


  return (
    <div className="flex gap-2">
      <Button onClick={exportPDF} disabled={isExporting}>
        {isExporting ? <LoadingSpinner className="mr-2 h-4 w-4" /> : <FileText className="mr-2 h-4 w-4" />}
        {isExporting ? "Exporting..." : "Export PDF"}
      </Button>
      <Button onClick={exportCSV}>
        <Sheet className="mr-2 h-4 w-4" />
        Export CSV
      </Button>
    </div>
  );
}
