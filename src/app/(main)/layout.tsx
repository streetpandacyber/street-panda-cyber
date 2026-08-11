import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StickyBottomNav } from "@/components/layout/StickyBottomNav";
import { CartSidebar } from "@/components/cart/CartSidebar";

export default function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <StickyBottomNav />
      <CartSidebar />
    </div>
  );
}
