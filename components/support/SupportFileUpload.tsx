"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileText, Image as ImageIcon } from "lucide-react";

interface SupportFileUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
}

export function SupportFileUpload({ files, onChange }: SupportFileUploadProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      onChange([...files, ...accepted].slice(0, 5));
    },
    [files, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
      "application/pdf": [".pdf"],
    },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 5,
  });

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? "bg-primary/10 border-primary" : "hover:bg-secondary/50"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-medium text-foreground">
          {isDragActive ? "Drop files here" : "Drop files here or Browse Files"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, JPEG, WEBP, PDF • Max 10MB • Up to 5 files</p>
      </div>
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, i) => (
            <li key={`${file.name}-${i}`} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50 border border-border">
              {file.type.startsWith("image/") ? (
                <ImageIcon className="w-4 h-4 text-primary shrink-0" />
              ) : (
                <FileText className="w-4 h-4 text-primary shrink-0" />
              )}
              <span className="text-sm truncate flex-1">{file.name}</span>
              <button type="button" onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive">
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
