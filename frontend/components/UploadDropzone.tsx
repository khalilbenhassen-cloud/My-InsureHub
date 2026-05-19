import { useState } from 'react';
import { Upload } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface UploadDropzoneProps {
  onFileChange: (file: File) => void;
  onLanguageChange: (language: string) => void;
  language: string;
}

export function UploadDropzone({ onFileChange, onLanguageChange, language }: UploadDropzoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { t } = useLanguage();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      onFileChange(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      onFileChange(selectedFile);
    }
  };

  return (
    <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors flex flex-col items-center justify-center ${
          isDragging ? 'border-brand-orange bg-brand-orange/5' : 'border-gray-300 hover:border-brand-orange/80 bg-white'
        }`}
         onDragOver={handleDragOver}
         onDragLeave={handleDragLeave}
         onDrop={handleDrop}>
      <input type="file"
             accept=".pdf"
             className="hidden"
             onChange={handleFileSelect} />
      <div className="space-y-4 flex flex-col items-center">
        <Upload className="h-12 w-12 text-brand-orange mb-2" />
        <p className="text-sm text-gray-600 font-medium">
          {t('upload_instructions')}
        </p>
        {file && (
          <p className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            {file.name} ({Math.round(file.size / 1024 / 1024)} MB)
          </p>
        )}
        {!file && (
          <button type="button" onClick={() => document.querySelector('input[type="file"]')?.click()}
                  className="px-6 py-2 bg-brand-orange text-white rounded-md font-medium hover:opacity-90 transition-colors shadow-sm">
            {t('select_pdf')}
          </button>
        )}
      </div>
    </div>
  );
}