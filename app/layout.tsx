import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import DevServiceWorkerReset from "@/components/dev/dev-service-worker-reset";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
});



export const metadata: Metadata = {
  title: "African Bank Branch Locator",
  description: "African Bank Branch Locator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} font-sans antialiased`}>
        <DevServiceWorkerReset />
        {children}
      </body>
    </html>
  );
}
