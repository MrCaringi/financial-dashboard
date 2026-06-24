"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, PieChart, CreditCard, Settings } from "lucide-react";

const navItems = [
  { href: "/", icon: Home, label: "Home", exact: true },
  { href: "/dashboard", icon: PieChart, label: "Analysis", exact: false },
  { href: "/accounts", icon: CreditCard, label: "Accounts", exact: false },
  { href: "/settings", icon: Settings, label: "Settings", exact: false },
];

export function BottomNav() {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  if (pathname === "/login") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass z-50 rounded-t-[2rem] border-t-0 safe-area-pb bottom-nav-fixed bg-background border-b border-background">
      <div className="flex justify-around items-center p-4">
        {navItems.map(({ href, icon: Icon, label, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-1 transition-colors ${
                active ? "text-primary" : "text-muted-foreground hover:text-primary"
              }`}
            >
              <Icon size={24} />
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
