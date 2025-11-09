import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RAG Knowledge Search",
  description: "Intelligent document search powered by RAG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.Node;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
