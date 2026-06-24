import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { cn } from "@/lib/utils";
import { EditTransactionProvider } from "@/components/EditTransactionContext";
import { EditTransactionDrawer } from "@/components/EditTransactionDrawer";
import { getCategories } from "@/lib/firefly";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const viewport: Viewport = {
  themeColor: "#09090b",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Firefly Dashboard",
  description: "Personal finance dashboard using Firefly III",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Firefly Dash",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Pre-fetch categories lists statically/cached so we have it for the select options
  const categories = await getCategories().catch(() => []);

  return (
    <html lang="en" className={cn("dark", "font-sans", geist.variable)}>
      <body className="antialiased pb-20">
        <EditTransactionProvider categories={categories}>
          {/* Main Content */}
          <main className="min-h-screen">
            {children}
          </main>

          {/* Edit Transaction Drawer */}
          <EditTransactionDrawer />
        </EditTransactionProvider>

        {/* Bottom Navigation for Mobile */}
        <BottomNav />
      </body>
    </html>
  );
}
