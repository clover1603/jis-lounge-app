import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JIS.bar App",
  description: "JIS.bar 公式会員アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full bg-black text-white">{children}</body>
    </html>
  );
}
