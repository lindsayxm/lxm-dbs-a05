import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Orbitron, Rajdhani } from "next/font/google";
import { HudChrome } from "@/components/shell/HudChrome";
import { Kiosk } from "@/components/shell/Kiosk";
import "./globals.css";

// Display face for titles, ranks and totals.
const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

// Labels and usernames: condensed, legible from across a room.
const rajdhani = Rajdhani({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-rajdhani",
  display: "swap",
});

// Scores and the clock: tabular numerals so columns never jitter.
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Quantum Casino — Leaderboard",
    template: "%s · Quantum Casino",
  },
  description:
    "Live top-10 leaderboard for the Quantum Casino: Uncertainty, Plinko, 17, Quant'em and Quabble.",
  applicationName: "Quantum Casino Leaderboard",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050811",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${orbitron.variable} ${rajdhani.variable} ${jetbrains.variable} antialiased`}>
      <body className="bg-void font-label text-text">
        <HudChrome>{children}</HudChrome>
        <Kiosk />
      </body>
    </html>
  );
}
