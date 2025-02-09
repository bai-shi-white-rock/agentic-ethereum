import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import { headers } from "next/headers"; // added
import ContextProvider from '@/context';
import Providers from './Providers';

const notoSans = Noto_Sans({
  weight: ['400', '500', '700'],  // Regular, Medium, and Bold weights
  variable: '--font-noto-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: "Bai Shi - Whiterock",
  description: "Your Personal Financial Advisory Agent. Helping you reach your investing goals through on-chain economy",
  openGraph: {
    title: "Bai Shi - Whiterock",
    description: "Your Personal Financial Advisory Agent. Helping you reach your investing goals through on-chain economy",
    siteName: 'Bai Shi - Whiterock',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Bai Shi - Whiterock',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Bai Shi - Whiterock",
    description: "Your Personal Financial Advisory Agent. Helping you reach your investing goals through on-chain economy",
    images: ['/opengraph-image.png'],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookies = (await headers()).get('cookie')

  return (
    <html lang="en">
      <body className={`${notoSans.variable} antialiased`}>
        <Providers>
          <ContextProvider cookies={cookies}>{children}</ContextProvider>
        </Providers>
      </body>
    </html>
  );
}
