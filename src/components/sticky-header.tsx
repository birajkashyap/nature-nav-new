"use client";

import Link from "next/link";

export default function StickyHeader() {
  return (
    <header className="absolute top-0 left-0 z-40 px-6 py-6">
      <Link
        href="/"
        className="flex items-center gap-3 group"
      >
        {/* Logo */}
        <img
          src="/logo.png"
          alt="Nature Navigator Logo"
          className="h-12 w-12 object-contain transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Wordmark */}
        <span className="font-luxury text-2xl font-semibold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] transition-transform duration-300 group-hover:translate-x-1">
          Nature Navigator
        </span>
      </Link>
    </header>
  );
}
