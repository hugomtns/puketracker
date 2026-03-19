import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Puke Tracker",
  description: "Track your cat's eating and puking habits",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={`${geist.className} bg-gray-50 min-h-screen`}>
        <Navigation />
        <main className="max-w-2xl mx-auto px-4 pb-20 pt-4">{children}</main>
      </body>
    </html>
  );
}
