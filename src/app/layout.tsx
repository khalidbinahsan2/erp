import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "RestaurantHub ERP",
  description: "Comprehensive restaurant management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body>
        <div className="app-container">
          <div id="network-status" className="fixed top-0 left-0 right-0 z-50 px-4 py-2 text-center text-xs font-medium transition-all duration-300" aria-live="polite"></div>
          <Sidebar />
          <main className="main-content">
            <Header />
            <div className="page-content">
              {children}
            </div>
          </main>
        </div>
        <script src="/network-status.js"></script>
      </body>
    </html>
  );
}