'use client';

import { useState, useRef, useCallback, type DragEvent } from 'react';
import { UploadCloud, File as FileIcon, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileProcess: (file: File) => void;
  error: string | null;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_FILE_TYPES = ['.scp', '.txt', '.csv'];

export default function FileUpload({ onFileProcess, error }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = useCallback((file: File | null) => {
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: "destructive",
        title: "File Error",
        description: `File size exceeds 50MB limit.`,
      });
      return;
    }

    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!ACCEPTED_FILE_TYPES.includes(fileExtension)) {
      toast({
        variant: "destructive",
        title: "File Error",
        description: `Invalid file type. Please upload a ${ACCEPTED_FILE_TYPES.join(', ')} file.`,
      });
      return;
    }

    setFileName(file.name);
    onFileProcess(file);
  }, [onFileProcess, toast]);

  const onDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <section className="w-full text-center">
      <div
        id="dropZone"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center w-full p-12 border-2 border-dashed rounded-lg transition-colors duration-300 ease-in-out ${
          isDragOver ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
        } ${error ? 'border-destructive' : ''}`}
      >
        <UploadCloud className={`w-16 h-16 mb-4 transition-colors ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
        <h2 className="text-2xl font-semibold text-foreground mb-2">Upload Your Data File</h2>
        <p className="text-muted-foreground mb-6">
          Drag & drop your .scp, .txt, or .csv file here
        </p>
        <input
          type="file"
          id="fileInput"
          ref={fileInputRef}
          accept={ACCEPTED_FILE_TYPES.join(',')}
          hidden
          onChange={onFileSelect}
        />
        <Button onClick={() => fileInputRef.current?.click()}>
          Choose File
        </Button>
        {fileName && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground bg-secondary px-3 py-1.5 rounded-md">
            <FileIcon className="w-4 h-4" />
            <span>{fileName}</span>
          </div>
        )}
        {error && !fileName && (
          <div className="mt-4 flex items-center gap-2 text-sm text-destructive-foreground bg-destructive/90 px-3 py-1.5 rounded-md">
            <XCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </section>
  );
}
