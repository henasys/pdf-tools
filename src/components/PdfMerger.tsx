"use client";

import { useState, useRef } from "react";
import { mergePDFs, downloadMergedPDF } from "../utils/pdfMerger";

export default function PdfMerger() {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      // Filter only PDF files
      const pdfFiles = fileList.filter(
        (file) => file.type === "application/pdf"
      );
      setFiles((prevFiles) => [...prevFiles, ...pdfFiles]);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const pdfFiles = droppedFiles.filter(
      (file) => file.type === "application/pdf"
    );

    if (pdfFiles.length === 0) {
      setError("PDF 파일만 업로드 가능합니다.");
      return;
    }

    setFiles((prevFiles) => [...prevFiles, ...pdfFiles]);
    setError(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError("Please select at least 2 PDF files to merge");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const mergedPdfBytes = await mergePDFs(files);
      downloadMergedPDF(mergedPdfBytes);
    } catch (err) {
      setError("Failed to merge PDF files. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center mb-8">PDF 파일 병합</h1>

      <div className="space-y-4">
        <div
          className={`flex flex-col items-center p-6 border-2 border-dashed rounded-lg transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept=".pdf"
            className="hidden"
            id="pdf-input"
          />
          <label
            htmlFor="pdf-input"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors"
          >
            PDF 파일 선택
          </label>
          <p className="mt-2 text-sm text-gray-500">
            또는 파일을 여기에 끌어서 놓으세요
          </p>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">선택된 파일 ({files.length})</h3>
            <ul className="space-y-1">
              {files.map((file, index) => (
                <li key={index} className="text-sm text-gray-600">
                  {file.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleMerge}
            disabled={isLoading || files.length < 2}
            className={`px-6 py-2 rounded-lg ${
              isLoading || files.length < 2
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            } text-white transition-colors`}
          >
            {isLoading ? "처리중..." : "파일 병합"}
          </button>

          <button
            onClick={handleReset}
            disabled={isLoading || files.length === 0}
            className={`px-6 py-2 rounded-lg ${
              isLoading || files.length === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600"
            } text-white transition-colors`}
          >
            초기화
          </button>
        </div>
      </div>
    </div>
  );
}
