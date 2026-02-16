import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/theme-context";

export const metadata: Metadata = {
  title: "TrueITCost - Understand the Real Cost of IT Decisions",
  description: "TrueITCost helps business owners understand the real financial and operational cost of IT decisions before they make them. Turn vague IT decisions into clear financial reality.",
  keywords: ["IT cost calculator", "IT budgeting", "MSP comparison", "cloud migration cost", "IT decision making", "SMB IT planning"],
  openGraph: {
    title: "TrueITCost - Understand the Real Cost of IT Decisions",
    description: "Turn vague IT decisions into clear financial reality. Calculate true IT costs including risk and disruption.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
