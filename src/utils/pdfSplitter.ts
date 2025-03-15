import { PDFDocument } from "pdf-lib";

/**
 * Parses a page range string into an array of page numbers
 * @param input - String representing page ranges (e.g., "1,3-5")
 * @param maxPage - Maximum page number allowed
 * @returns Array of page numbers
 */
export function parsePageRange(input: string, maxPage: number): number[] {
  const pages = new Set<number>();

  // Split by comma and process each range
  input
    .split(",")
    .map((range) => range.trim())
    .filter((range) => range.length > 0)
    .forEach((range) => {
      if (range.includes("-")) {
        // Handle range format (e.g., "1-5")
        const [start, end] = range.split("-").map(Number);
        if (!isNaN(start) && !isNaN(end) && start <= end && start > 0) {
          for (let i = start; i <= Math.min(end, maxPage); i++) {
            pages.add(i);
          }
        }
      } else {
        // Handle single page format (e.g., "1")
        const page = Number(range);
        if (!isNaN(page) && page > 0 && page <= maxPage) {
          pages.add(page);
        }
      }
    });

  // Convert Set to array and sort numerically
  return Array.from(pages).sort((a, b) => a - b);
}

/**
 * Gets the total number of pages in a PDF file
 * @param pdfFile - PDF file as File object
 * @returns Promise<number> - Total number of pages
 */
export async function getPdfPageCount(pdfFile: File): Promise<number> {
  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    return pdfDoc.getPageCount();
  } catch (error) {
    console.error("Error getting PDF page count:", error);
    throw new Error("Failed to get PDF page count");
  }
}

/**
 * Extracts selected pages from a PDF file
 * @param pdfFile - PDF file as File object
 * @param selectedPages - Array of page numbers to extract (1-based index)
 * @returns Promise<Uint8Array> - The extracted PDF as a byte array
 */
export async function extractPdfPages(
  pdfFile: File,
  selectedPages: number[]
): Promise<Uint8Array> {
  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const newPdfDoc = await PDFDocument.create();

    // Copy selected pages to new document
    for (const pageNum of selectedPages) {
      const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageNum - 1]);
      newPdfDoc.addPage(copiedPage);
    }

    // Save the new PDF
    return await newPdfDoc.save();
  } catch (error) {
    console.error("Error extracting PDF pages:", error);
    throw new Error("Failed to extract PDF pages");
  }
}

/**
 * Downloads the extracted PDF file
 * @param pdfBytes - The PDF as a byte array
 * @param originalFileName - The original PDF file name
 */
export function downloadExtractedPDF(
  pdfBytes: Uint8Array,
  originalFileName: string
): void {
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `selected_pages_${originalFileName}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
