
import type { Metadata } from "next";
import { Outfit, Manrope } from "next/font/google";
import "./globals.css";

const heading = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lastpromiseevents.com"),
  title: "Last Promise Events | Beyond Ordinary Celebrations",
  description:
    "Premium event experiences, celebrations, and digital event solutions.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${heading.variable} ${body.variable}`}>
        {children}
      </body>
    </html>
  );
}
