"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";

interface PageHeaderProps {
  backHref?: string;
  subtitle: string;
  title: string;
  rightSection?: React.ReactNode;
}

export function PageHeader({ backHref, subtitle, title, rightSection }: PageHeaderProps) {
  const router = useRouter();

  const handleBack = (e: React.MouseEvent) => {
    // If the browser has window.history we can go back
    if (typeof window !== "undefined" && window.history.length > 1) {
      e.preventDefault();
      router.back();
    }
  };

  return (
    <header className="flex items-center justify-between px-2">
      <div className="flex items-center gap-4">
        {backHref && (
          <Link
            href={backHref}
            onClick={handleBack}
            className="w-10 h-10 rounded-full glass flex items-center justify-center text-white transition-transform active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </Link>
        )}
        <div>
          <h2 className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">{subtitle}</h2>
          <h1 className="text-2xl font-bold text-zinc-100">{title}</h1>
        </div>
      </div>
      {rightSection}
    </header>
  );
}
