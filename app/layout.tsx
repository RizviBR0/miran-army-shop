import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getCurrentCountry } from "@/lib/location";

const GA_MEASUREMENT_ID = "G-8Y2H6Q7LFW";

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
    "miran army",
    "jin miran",
  ],
  authors: [{ name: "Miran Army" }],
  creator: "Miran Army",
  publisher: "Miran Army",
  metadataBase: new URL("https://miranarmy.store"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/logo/favicon.ico", sizes: "any" },
      { url: "/logo/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/logo/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      {
        url: "/logo/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/logo/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/logo/android-chrome-512x512.png",
      },
    ],
  },
  manifest: "/logo/site.webmanifest",
  openGraph: {
    title: "Miran Army – The #1 Fan Community",
    description:
      "Discover cute and fun products curated just for fans. The best AliExpress finds in one place!",
    url: "https://miranarmy.store",
    siteName: "Miran Army",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/logo/logo_square.png",
        width: 512,
        height: 512,
        alt: "Miran Army Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Miran Army – The #1 Fan Community",
    description:
      "Discover cute and fun products curated just for fans. The best AliExpress finds in one place!",
    images: ["/logo/logo_square.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here if needed
    // google: "your-google-verification-code",
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
      <head>
        <meta name="theme-color" content="#FDE047" />
        <meta name="msapplication-TileColor" content="#FDE047" />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </head>
      <body className="min-h-screen flex flex-col bg-bg-main font-body antialiased">
        <Navbar currentCountry={currentCountry} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
