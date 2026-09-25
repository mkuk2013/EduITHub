import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Shared shell for the auth pages (login / register): brand header,
 * centered card, soft gradient backdrop.
 */
export function AuthShell({
  title,
  description,
  children,
  wide = false,
}: {
  title: string;
  description: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div suppressHydrationWarning className="flex min-h-screen flex-col bg-gradient-to-b from-indigo-50 via-white to-slate-100">
      <header className="mx-auto flex w-full max-w-5xl items-center px-4 py-6">
        <Link href={ROUTES.home} className="flex items-center gap-3 group">
          <div className="relative h-11 w-11 shrink-0 transition-transform group-hover:scale-105">
            <Image
              src="/logo.png"
              alt="Edu IT Hub Academy"
              fill
              sizes="44px"
              className="object-contain"
              priority
            />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 font-heading">
            Edu IT Hub Academy
          </span>
        </Link>
      </header>

      <main suppressHydrationWarning className="flex flex-1 items-start justify-center px-4 pb-16 pt-4 sm:items-center sm:pt-0">
        <Card className={cn("w-full shadow-lg", wide ? "max-w-2xl" : "max-w-md")}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </main>
    </div>
  );
}
