import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.scss";
import { TRPCReactProvider } from "@/trpc/client";
import Header from "./_components/header";
import Footer from "./_components/footer";
import { prefetch, trpc } from "@/trpc/server";
import TaskDialog from "./_components/task_dialog";
import { DialogManager, DialogProvider } from "@/components/dialog";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
  prefetch(trpc.status.getStatuses.queryOptions());

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TRPCReactProvider>
          <DialogProvider>
            <Header />
            {/* <TaskDialog /> */}
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
