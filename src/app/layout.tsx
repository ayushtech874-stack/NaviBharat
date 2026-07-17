import type { Metadata } from "next";
import { Geist, Geist_Mono, Yatra_One } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const yatra = Yatra_One({
  weight: "400",
  variable: "--font-yatra",
  subsets: ["latin", "devanagari"],
});

export const metadata: Metadata = {
  title: "NaviBharat | AI Travel Itineraries",
  description: "Discover your next great adventure mapped by AI.",
  applicationName: "NaviBharat",
  openGraph: {
    siteName: "NaviBharat",
    title: "NaviBharat | AI Travel Itineraries",
    description: "Discover your next great adventure mapped by AI.",
    type: "website",
  },
  verification: {
    google: "uWaKXvizX7DpjnXm4070Pe9NJ2DSn1xtF2Ofx36Xtp4",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${yatra.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
