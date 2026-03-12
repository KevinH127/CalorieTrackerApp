import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { NavBar } from "./components/NavBar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Calorie Tracker App",
  description: "AI-powered multimodal calorie tracking app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.className} bg-neutral-950 text-neutral-200 antialiased min-h-screen selection:bg-emerald-500/30 selection:text-emerald-100/90 flex flex-col`}>
        {/* Background ambient light effects */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[120px]" />
        </div>
        
        <SessionProvider>
          <NavBar />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
