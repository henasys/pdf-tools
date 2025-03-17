"use client";

import PdfSplitter from "@/components/PdfSplitter";
import PdfMerger from "../components/PdfMerger";
import CaretIcon from "@/components/CaretIcon";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [isFeaturesExpanded, setIsFeaturesExpanded] = useState(true);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = featuresRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          setIsFeaturesExpanded(false);
        }
      },
      {
        threshold: 1.0,
      }
    );

    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 pt-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            PDF 파일을 외부 유출없이 쉽게 분할하고 병합하세요.
          </h1>
          <div className="space-y-2">
            <button
              onClick={() => setIsFeaturesExpanded(!isFeaturesExpanded)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <CaretIcon
                className={`w-5 h-5 transform transition-transform ${
                  isFeaturesExpanded ? "rotate-180" : ""
                }`}
              />
              <span className="font-medium">주요 특징</span>
            </button>
            <div
              ref={featuresRef}
              className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-all duration-300 ${
                isFeaturesExpanded
                  ? "opacity-100 max-h-[500px]"
                  : "opacity-0 max-h-0 overflow-hidden"
              }`}
            >
              <div className="p-3 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-base mb-1">
                  안전한 사용, NO 업로드
                </h3>
                <p className="text-sm text-gray-600">
                  외부 유출없이 안전하게 작업하세요. 사용자가 올린 PDF 파일은
                  외부 인터넷 서버로 전혀 전송되지 않습니다. 어떤 종류의 사용자
                  정보도 외부로 전달되지 않습니다. 완벽하게 사용자 컴퓨터
                  내부에서만 작동합니다.
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-base mb-1">
                  깔끔한 화면, NO 광고
                </h3>
                <p className="text-sm text-gray-600">
                  한 페이지 짜리 HTML + Javascript로 만들어진 웹 사이트라서 무료
                  인터넷 서버를 사용합니다. 서버 비용이 전혀 들지 않습니다. 딱히
                  광고를 넣을 이유가 없어서, 깔끔한 화면을 유지하려 합니다.
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-base mb-1">
                  오픈 소스 코드, NO 시크릿
                </h3>
                <p className="text-sm text-gray-600">
                  오픈 소스로 만들어졌습니다. 페이지 하단 링크를 따라가시면 소스
                  코드를 볼 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <PdfSplitter />
        <PdfMerger />
      </div>
    </main>
  );
}
