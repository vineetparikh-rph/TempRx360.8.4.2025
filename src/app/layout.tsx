import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/authprovider";
import { ThemeProvider } from "@/context/ThemeContext";
import EnvironmentBanner from "@/components/common/EnvironmentBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TempRx360 - Pharmacy Temperature Monitoring",
  description: "Stay Cool. Stay Compliant.",
  keywords: "pharmacy, temperature monitoring, compliance, pharmaceutical storage, SensorPush, TempRx360",
  icons: {
    icon: '/images/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <EnvironmentBanner />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}