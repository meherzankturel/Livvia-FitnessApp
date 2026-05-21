import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Revive — Your Workout, Simplified",
  description: "Personalized workout and diet plans. One thing at a time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
