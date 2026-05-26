import type { Metadata } from "next";
import { Geist, Geist_Mono, VT323 } from "next/font/google";
import "./globals.scss";
import { TRPCReactProvider } from "@/trpc/client";
import Header from "./_components/header";
import Footer from "./_components/footer";
import { DialogManager, DialogProvider } from "@/components/dialog";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const vt323Mono = VT323({
  variable: "--font-vt-mono",
  weight: "400",
});

export const metadata: Metadata = {
  title: "sean's projects",
  description: "spy on sean!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${vt323Mono.variable} h-full antialiased`}
    >
      <body>
        <TRPCReactProvider>
          <DialogProvider>
            <Header />
            {children}
            <Footer />
            <div id="dialog_root"></div>
            <DialogManager />
          </DialogProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
