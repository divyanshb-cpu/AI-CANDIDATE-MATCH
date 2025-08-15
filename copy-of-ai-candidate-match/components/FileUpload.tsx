
import React, { useCallback, useState } from 'react';
import { DocumentIcon, PdfIcon, UploadIcon, XIcon } from './icons';

interface FileUploadProps {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

export function FileUpload({ files, setFiles }: FileUploadProps): React.ReactNode {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const acceptedFiles = Array.from(e.dataTransfer.files).filter(
        file => file.type === 'application/pdf' || file.name.endsWith('.docx')
      );
      setFiles(prev => [...prev, ...acceptedFiles]);
    }
  }, [setFiles]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.pdf')) {
      return <PdfIcon className="h-6 w-6 text-red-500" />;
    }
    if (fileName.endsWith('.docx')) {
      return <DocumentIcon className="h-6 w-6 text-blue-500" />;
    }
    return <DocumentIcon className="h-6 w-6 text-slate-500" />;
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          isDragging ? 'border-indigo-600 bg-indigo-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
        }`}
      >
        <UploadIcon className="h-12 w-12 text-slate-400 mb-3" />
        <p className="text-slate-600 font-semibold">Drag & drop files here, or click to select</p>
        <p className="text-sm text-slate-500">Supported formats: PDF, DOCX</p>
        <input
          type="file"
          multiple
          accept=".pdf,.docx"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="font-semibold text-slate-600">Uploaded Files:</h3>
          <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  {getFileIcon(file.name)}
                  <span className="text-sm text-slate-700 font-medium truncate">{file.name}</span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
