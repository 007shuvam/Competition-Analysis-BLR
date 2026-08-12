import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { CompareBar } from "@/components/CompareBar";
import { CompareProvider } from "@/lib/compare-context";

export const metadata: Metadata = {
  title: "BLR Competition Analysis",
  description: "Interactive competition-analysis portal for real estate developments in Bangalore",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <CompareProvider>
          <NavBar />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">{children}</main>
          <CompareBar />
        </CompareProvider>
      </body>
    </html>
  );
}
