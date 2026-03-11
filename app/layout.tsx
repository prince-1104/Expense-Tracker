import type { Metadata } from "next";
import "./globals.css";
import { ReactQueryProvider } from "@/components/providers/react-query-provider";

export const metadata: Metadata = {
  title: "Expense Tracker SaaS",
  description: "Chat-based personal expense tracking and analytics"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}

