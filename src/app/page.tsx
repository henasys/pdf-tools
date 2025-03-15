import PdfSplitter from "@/components/PdfSplitter";
import PdfMerger from "../components/PdfMerger";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto">
        <PdfSplitter />
        <PdfMerger />
      </div>
    </main>
  );
}
