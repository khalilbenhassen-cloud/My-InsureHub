import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/TopNav";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "My InsureHub",
  description: "Your digital policy cabinet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fcfcfc] text-gray-900">
        <TopNav />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 w-full max-w-6xl mx-auto p-6 md:p-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
