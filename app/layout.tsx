import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HP Spark — Marketing Ideation Platform",
  description: "AI-powered digital printing campaign ideation for HP Indigo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-[#F1F1F1] text-[#212121] antialiased">{children}</body>
    </html>
  );
}
