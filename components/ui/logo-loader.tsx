"use client";

import Image from "next/image";

interface LogoLoaderProps {
  text?: string;
  size?: "sm" | "md" | "lg";
  fullscreen?: boolean;
}

/**
 * Premium Logo Loader for Edu IT Hub Academy.
 * Features the official logo with rotating cyber-gradient rings and subtle neon glow.
 */
export function LogoLoader({
  text = "Loading Edu IT Hub Academy...",
  size = "md",
  fullscreen = false,
}: LogoLoaderProps) {
  const sizeMap = {
    sm: { ring: "h-16 w-16", logo: 32, box: "h-10 w-10" },
    md: { ring: "h-24 w-24", logo: 46, box: "h-14 w-14" },
    lg: { ring: "h-32 w-32", logo: 60, box: "h-20 w-20" },
  };

  const currentSize = sizeMap[size];

  const content = (
    <div className="flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="relative flex items-center justify-center">
        {/* Soft Background Neon Glow */}
        <div
          className={`absolute rounded-full bg-gradient-to-tr from-indigo-500/25 via-cyan-400/25 to-amber-400/20 blur-xl animate-pulse ${currentSize.ring}`}
        />

        {/* Outer Orbital Rotating Ring */}
        <div
          className={`absolute rounded-full border-2 border-transparent border-t-indigo-600 border-r-cyan-400 animate-spin [animation-duration:1.2s] ${currentSize.ring}`}
        />

        {/* Inner Counter-Rotating Ring */}
        <div
          className={`absolute rounded-full border border-transparent border-b-amber-400 border-l-emerald-400 animate-spin [animation-duration:0.9s] [animation-direction:reverse] ${
            size === "sm" ? "h-12 w-12" : size === "md" ? "h-18 w-18" : "h-24 w-24"
          }`}
        />

        {/* Center Official Academy Logo with Pulse */}
        <div
          className={`relative rounded-2xl bg-white/95 backdrop-blur-md shadow-md flex items-center justify-center p-2.5 transition-transform ${currentSize.box}`}
        >
          <Image
            src="/logo.png"
            alt="Edu IT Hub Academy"
            width={currentSize.logo}
            height={currentSize.logo}
            className="object-contain animate-pulse [animation-duration:2s]"
            priority
          />
        </div>
      </div>

      {/* Brand Identity & Loading Status */}
      <div className="mt-5 space-y-1.5">
        <div className="inline-flex items-center gap-1.5 font-extrabold text-sm sm:text-base font-heading">
          <span className="text-[var(--accent)] font-heading">Edu</span>
          <span className="text-[var(--accent2)] font-heading">IT</span>
          <span className="text-slate-900 font-heading">Hub</span>
          <span className="text-[9px] font-mono font-bold text-[var(--accent2)] px-1.5 py-0.5 rounded-full bg-[var(--accent2-light)] uppercase tracking-wider">
            ONLINE ACADEMY
          </span>
        </div>

        {text && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
            <p className="animate-pulse">{text}</p>
          </div>
        )}
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/90 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
}
