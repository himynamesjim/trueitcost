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
          <footer className="border-t border-slate-200 dark:border-slate-700 py-4 text-xs text-slate-400 dark:text-slate-500 text-center">
            Powered by{' '}
            <a
              href="https://www.techsolutions.cc"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 underline underline-offset-2 transition-colors"
            >
              InterPeak Technology Solutions
            </a>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
