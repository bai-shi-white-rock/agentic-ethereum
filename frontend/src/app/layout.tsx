import type { Metadata } from "next";
import { Noto_Sans, Kiwi_Maru } from "next/font/google";
import "./globals.css";
import { headers } from "next/headers"; // added
import ContextProvider from '@/context'

const notoSans = Noto_Sans({
  weight: ['400', '500', '700'],  // Regular, Medium, and Bold weights
  variable: '--font-noto-sans',
  subsets: ['latin'],
});

const kiwiMaru = Kiwi_Maru({
  weight: ['300', '400', '500'],  // Light, Regular, and Medium weights
  variable: '--font-kiwi-maru',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: "Bai Shi - Whiterock",
  description: "Your personal investment agent",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookies = (await headers()).get('cookie')

  return (
    <html lang="en">
      <body className={`${notoSans.variable} ${kiwiMaru.variable} antialiased`}>
        <ContextProvider cookies={cookies}>{children}</ContextProvider>
      </body>
    </html>
  );
}
