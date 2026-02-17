import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EDO-Cloud Scheduler | AI-Powered Cloud Task Scheduling",
  description:
    "Multi-objective cloud task scheduling powered by the Enterprise Development Optimizer. Configure workloads, run experiments, and visualize results.",
  keywords: [
    "cloud scheduling",
    "EDO",
    "optimization",
    "CloudSim",
    "multi-objective",
    "Pareto",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} font-body antialiased bg-canvas text-text-primary`}
      >
        {children}
      </body>
    </html>
  );
}
