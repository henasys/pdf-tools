import { PDFDocument } from "pdf-lib";

/**
 * Merges multiple PDF files into a single PDF
 * @param pdfFiles - Array of PDF files as File objects
 * @returns Promise<Uint8Array> - The merged PDF as a byte array
 */
export async function mergePDFs(pdfFiles: File[]): Promise<Uint8Array> {
  try {
    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();

    // Process each PDF file
    for (const pdfFile of pdfFiles) {
      // Convert File to ArrayBuffer
      const pdfBytes = await pdfFile.arrayBuffer();

      // Load the PDF document
      const pdf = await PDFDocument.load(pdfBytes);

      // Copy all pages from the current PDF to the merged PDF
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => {
        mergedPdf.addPage(page);
      });
    }

    // Save the merged PDF
    const mergedPdfBytes = await mergedPdf.save();
    return mergedPdfBytes;
  } catch (error) {
    console.error("Error merging PDFs:", error);
    throw new Error("Failed to merge PDF files");
  }
}

/**
 * Downloads the merged PDF file
 * @param pdfBytes - The merged PDF as a byte array
 * @param fileName - The name for the downloaded file
 */
export function downloadMergedPDF(
  pdfBytes: Uint8Array,
  fileName: string = "merged.pdf"
): void {
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
