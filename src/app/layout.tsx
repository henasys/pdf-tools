import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FaGithub } from "react-icons/fa";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PDF Tools",
  description: "Powerful PDF manipulation tools",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <main className="flex-grow">{children}</main>
        <footer className="py-4 px-6 text-center text-sm text-gray-500">
          <a
            href="https://github.com/henasys/pdf-tools"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 hover:text-gray-700 transition-colors"
          >
            <FaGithub className="text-lg" />
            <span>Open Source on GitHub</span>
          </a>
        </footer>
      </body>
    </html>
  );
}
