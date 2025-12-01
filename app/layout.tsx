import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getCurrentCountry } from "@/lib/location";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Miran Army – The #1 Fan Community",
    template: "%s | Miran Army",
  },
  description:
    "Discover cute and fun products curated just for fans. The best AliExpress finds in one place!",
  keywords: [
    "cute products",
    "fan community",
    "aliexpress finds",
    "kawaii",
    "cute gifts",
  ],
  openGraph: {
    title: "Miran Army – The #1 Fan Community",
    description:
      "Discover cute and fun products curated just for fans. The best AliExpress finds in one place!",
    url: "https://miranarmy.store",
    siteName: "Miran Army",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Miran Army – The #1 Fan Community",
    description:
      "Discover cute and fun products curated just for fans. The best AliExpress finds in one place!",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentCountry = await getCurrentCountry();

  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable}`}>
      <body className="min-h-screen flex flex-col bg-bg-main font-body antialiased">
        <Navbar currentCountry={currentCountry} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
