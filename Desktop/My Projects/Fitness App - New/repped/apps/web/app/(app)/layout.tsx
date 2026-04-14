"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/today", label: "Today", icon: "\u26A1" },
  { href: "/meals", label: "Meals", icon: "\uD83C\uDF7D" },
  { href: "/progress", label: "Progress", icon: "\uD83D\uDCCA" },
  { href: "/settings", label: "Settings", icon: "\u2699\uFE0F" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-black">
      {children}
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 flex justify-around py-4 pb-8 max-w-lg mx-auto">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-1 text-sm ${
              pathname === tab.href ? "text-[#0090ff]" : "text-gray-500"
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
