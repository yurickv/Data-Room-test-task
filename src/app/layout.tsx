import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Serif } from "next/font/google";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexSerif = IBM_Plex_Serif({
  variable: "--font-plex-serif",
  subsets: ["latin"],
  weight: ["600"],
});

export const metadata: Metadata = {
  title: "Acme Corp. Data Room",
  description:
    "Secure virtual data room for due-diligence: organized folders, PDF uploads, and controlled access.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexSerif.variable} h-full antialiased`}>
      <body className="h-full">{children}</body>
    </html>
  );
}
