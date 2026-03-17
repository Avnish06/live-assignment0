import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voice Notes Maker",
  description: "Record voice notes and transcribe with Deepgram.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
