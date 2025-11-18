import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import AuthGuard from "@/components/auth/AuthGuard";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "YOLO Dataset Annotation Platform",
  description: "Professional YOLO dataset annotation and management platform",
  keywords: ["YOLO", "Dataset", "Annotation", "Machine Learning", "Computer Vision"],
  authors: [{ name: "MiniMax Agent" }],
  creator: "MiniMax Agent",
  publisher: "MiniMax Agent",
  openGraph: {
    title: "YOLO Dataset Annotation Platform",
    description: "Professional YOLO dataset annotation and management platform",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YOLO Dataset Annotation Platform",
    description: "Professional YOLO dataset annotation and management platform",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <Providers>
          <AuthGuard>
            {children}
          </AuthGuard>
        </Providers>
      </body>
    </html>
  );
}