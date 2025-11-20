// app/layout.tsx (FIXED)
import "./globals.css";
import { Inter, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import FloatingDock from "@/components/floating-dock";
import SessionProvider from "@/components/SessionProvider";
const luxuryFont = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-luxury",
  display: "swap",
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${luxuryFont.variable} ${bodyFont.variable}`}
    >
      <head />
      {/* 💡 FIX: Apply the dynamic background and text classes to the body */}
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            {children}
            <FloatingDock />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
