import { LogoLoader } from "@/components/ui/logo-loader";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center py-16">
      <LogoLoader text="Loading Live Course Catalog..." size="md" />
    </div>
  );
}

