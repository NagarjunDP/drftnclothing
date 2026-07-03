import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileNavbar from '@/components/MobileNavbar';
import MiniCart from '@/components/MiniCart';
import WhatsAppButton from '@/components/WhatsAppButton';
import ToastContainer from '@/components/ToastContainer';
import AddToCartAnimation from '@/components/AddToCartAnimation';
import BrandLoader from '@/components/BrandLoader';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: {
    default: 'DRFTN CLOTHING | Premium Streetwear Brand Bengaluru',
    template: '%s | DRFTN CLOTHING',
  },
  description:
    'Born in Yelahanka, Bengaluru. Premium, imported streetwear and unisex fashion. Drift in style with our heavyweight tees, acid-wash hoodies, joggers, and techwear accessories.',
  keywords: [
    'streetwear',
    'DRFTN',
    'DRFTN clothing',
    'Bengaluru streetwear',
    'Indian streetwear',
    'unisex fashion',
    'oversized tees',
    'hoodies',
  ],
  authors: [{ name: 'DRFTN CLOTHING' }],
  metadataBase: new URL('https://drftn.in'),
  openGraph: {
    title: 'DRFTN CLOTHING | Premium Streetwear Brand',
    description: 'Born in Yelahanka, Bengaluru. Drift in style with premium imported streetwear.',
    url: 'https://drftn.in',
    siteName: 'DRFTN CLOTHING',
    locale: 'en_IN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en">
        <body className="antialiased min-h-screen flex flex-col bg-brand-black text-brand-offwhite pb-16 md:pb-0">
          {/* Global Navbar */}
          <Navbar />

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col relative w-full">
            {children}
          </main>

          {/* Global Footer */}
          <Footer />

          {/* Global Navigation Drawers and Widgets */}
          <MiniCart />
          <MobileNavbar />
          <WhatsAppButton />
          <ToastContainer />
          <AddToCartAnimation />
          <BrandLoader />
        </body>
      </html>
    </ClerkProvider>
  );
}
