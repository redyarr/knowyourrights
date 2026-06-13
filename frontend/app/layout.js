import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";
import NavbarWrapper from "@/components/NavbarWrapper";
import { Toaster } from "@/components/ui/sonner";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata = {
  title: "Know Your Rights",
  description: "Connecting people with verified legal professionals. Justice made accessible.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <ThemeProvider>
            <NavbarWrapper>
              <Navbar />
            </NavbarWrapper>
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

