"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import {
  parsePageRange,
  getPdfPageCount,
  extractPdfPages,
  downloadExtractedPDF,
} from "../utils/pdfSplitter";

export default function PdfSplitter() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pageRange, setPageRange] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const ITEMS_PER_PAGE = 25; // 5x5 grid
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.includes("pdf")) {
      alert("PDF 파일만 업로드 가능합니다.");
      return;
    }

    setPdfFile(file);
    try {
      const pages = await getPdfPageCount(file);
      setPageCount(pages);
      setSelectedPages([]);
      setPageRange("");
    } catch (error) {
      console.error(error);
      alert("PDF 파일을 처리하는 중 오류가 발생했습니다.");
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFile(files[0]); // Only process the first file
    }
  };

  const handlePageSelect = (pageNum: number) => {
    setSelectedPages((prev) => {
      if (prev.includes(pageNum)) {
        return prev.filter((p) => p !== pageNum);
      } else {
        return [...prev, pageNum].sort((a, b) => a - b);
      }
    });
  };

  const handlePageRangeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPageRange(value);
    if (value.trim()) {
      const pages = parsePageRange(value, pageCount);
      setSelectedPages(pages);
    } else {
      setSelectedPages([]);
    }
  };

  const handleDownload = async () => {
    if (!pdfFile || selectedPages.length === 0) return;

    try {
      setLoading(true);
      const pdfBytes = await extractPdfPages(pdfFile, selectedPages);
      downloadExtractedPDF(pdfBytes, pdfFile.name);
    } catch (error) {
      console.error("Error processing PDF:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(pageCount / ITEMS_PER_PAGE);
  const startPage = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endPage = Math.min(startPage + ITEMS_PER_PAGE - 1, pageCount);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-8">PDF 페이지 추출</h1>
      <div className="space-y-6">
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
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
          />
          <div className="text-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors"
            >
              PDF 파일 선택
            </button>
            <p className="mt-2 text-sm text-gray-500">
              또는 PDF 파일을 여기에 드래그하세요
            </p>
          </div>
          {pdfFile && (
            <p className="mt-2 text-sm text-gray-600">
              선택된 파일: {pdfFile.name}
            </p>
          )}
        </div>

        {pageCount > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">페이지 선택</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                페이지 범위 입력 (예: 1,3-5)
              </label>
              <input
                type="text"
                value={pageRange}
                onChange={handlePageRangeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1,3-5"
              />
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-2">
                {Array.from(
                  { length: Math.min(ITEMS_PER_PAGE, endPage - startPage + 1) },
                  (_, i) => startPage + i
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageSelect(page)}
                    className={`p-2 border rounded ${
                      selectedPages.includes(page)
                        ? "bg-blue-500 text-white"
                        : "bg-white hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-700">
                  {startPage}-{endPage} / 총 {pageCount}페이지
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                  >
                    이전
                  </button>
                  {totalPages <= 7 ? (
                    // 전체 페이지가 7개 이하면 모두 표시
                    Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 border rounded ${
                            currentPage === page
                              ? "bg-blue-500 text-white"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )
                  ) : (
                    // 페이지가 많으면 일부만 표시하고 ...으로 생략
                    <>
                      {[
                        1,
                        2,
                        "...",
                        currentPage - 1,
                        currentPage,
                        currentPage + 1,
                        "...",
                        totalPages - 1,
                        totalPages,
                      ]
                        .filter((page, index, array) => {
                          if (typeof page === "string") return true;
                          if (page <= 0 || page > totalPages) return false;
                          return array.indexOf(page) === index;
                        })
                        .map((page, i) =>
                          typeof page === "string" ? (
                            <span key={i} className="px-3 py-1">
                              ...
                            </span>
                          ) : (
                            <button
                              key={i}
                              onClick={() => handlePageChange(page as number)}
                              className={`px-3 py-1 border rounded ${
                                currentPage === page
                                  ? "bg-blue-500 text-white"
                                  : "hover:bg-gray-100"
                              }`}
                            >
                              {page}
                            </button>
                          )
                        )}
                    </>
                  )}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                  >
                    다음
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedPages.length > 0 && (
          <div className="flex flex-col items-center">
            <p className="mb-4">선택된 페이지: {selectedPages.join(", ")}</p>
            <button
              onClick={handleDownload}
              disabled={loading}
              className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:bg-gray-400"
            >
              {loading ? "처리중..." : "선택한 페이지 다운로드"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
