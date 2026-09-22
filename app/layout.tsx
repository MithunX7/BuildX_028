import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nagpur Civic Infrastructure Platform",
  description: "Coordinated civic infrastructure monitoring, grievance resolution, and maintenance for Nagpur Municipal Corporation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
