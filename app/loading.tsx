import { LogoLoader } from "@/components/ui/logo-loader";

export default function Loading() {
  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center">
      <LogoLoader text="Connecting to Edu IT Hub Live Academy..." size="lg" />
    </div>
  );
}
