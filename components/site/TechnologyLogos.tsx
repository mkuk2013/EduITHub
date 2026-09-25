import type { ComponentProps } from "react";

// --- Official Technology Vector Logos (Devicon & Simple Icons Assets) ---

export type LogoProps = ComponentProps<"img">;

export function PythonLogo({ className = "h-8 w-8", ...props }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/icons/python.svg" alt="Python" className={`inline-block object-contain shrink-0 ${className}`} {...props} />
  );
}

export function WordPressLogo({ className = "h-8 w-8", ...props }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/icons/wordpress.svg" alt="WordPress" className={`inline-block object-contain shrink-0 ${className}`} {...props} />
  );
}

export function ReactLogo({ className = "h-8 w-8", ...props }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/icons/react.svg" alt="React" className={`inline-block object-contain shrink-0 ${className}`} {...props} />
  );
}

export function NodeLogo({ className = "h-8 w-8", ...props }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/icons/nodejs.svg" alt="Node.js" className={`inline-block object-contain shrink-0 ${className}`} {...props} />
  );
}

export function MongoLogo({ className = "h-8 w-8", ...props }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/icons/mongodb.svg" alt="MongoDB" className={`inline-block object-contain shrink-0 ${className}`} {...props} />
  );
}

export function PostgresLogo({ className = "h-8 w-8", ...props }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/icons/postgresql.svg" alt="PostgreSQL" className={`inline-block object-contain shrink-0 ${className}`} {...props} />
  );
}

export function JavaScriptLogo({ className = "h-8 w-8", ...props }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/icons/javascript.svg" alt="JavaScript" className={`inline-block object-contain shrink-0 ${className}`} {...props} />
  );
}

export function HTML5Logo({ className = "h-8 w-8", ...props }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/icons/html5.svg" alt="HTML5" className={`inline-block object-contain shrink-0 ${className}`} {...props} />
  );
}

export function CSS3Logo({ className = "h-8 w-8", ...props }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/icons/css3.svg" alt="CSS3" className={`inline-block object-contain shrink-0 ${className}`} {...props} />
  );
}

export function PhotoshopLogo({ className = "h-8 w-8", ...props }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/icons/photoshop.svg" alt="Photoshop" className={`inline-block object-contain shrink-0 ${className}`} {...props} />
  );
}

export function IllustratorLogo({ className = "h-8 w-8", ...props }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/icons/illustrator.svg" alt="Illustrator" className={`inline-block object-contain shrink-0 ${className}`} {...props} />
  );
}

export function PremiereProLogo({ className = "h-8 w-8", ...props }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/icons/premierepro.svg" alt="Premiere Pro" className={`inline-block object-contain shrink-0 ${className}`} {...props} />
  );
}

export function AfterEffectsLogo({ className = "h-8 w-8", ...props }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/icons/aftereffects.svg" alt="After Effects" className={`inline-block object-contain shrink-0 ${className}`} {...props} />
  );
}

export function FigmaLogo({ className = "h-8 w-8", ...props }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/icons/figma.svg" alt="Figma" className={`inline-block object-contain shrink-0 ${className}`} {...props} />
  );
}

export function WindowsLogo({ className = "h-8 w-8", ...props }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/icons/windows.svg" alt="Windows" className={`inline-block object-contain shrink-0 ${className}`} {...props} />
  );
}

export function LinuxLogo({ className = "h-8 w-8", ...props }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/icons/linux.svg" alt="Linux" className={`inline-block object-contain shrink-0 ${className}`} {...props} />
  );
}

export function AIBrainLogo({ className = "h-8 w-8", ...props }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/icons/ai.svg" alt="Artificial Intelligence" className={`inline-block object-contain shrink-0 ${className}`} {...props} />
  );
}

export function MarketingLogo({ className = "h-8 w-8", ...props }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/icons/meta.svg" alt="Meta Ads & Marketing" className={`inline-block object-contain shrink-0 ${className}`} {...props} />
  );
}

export function SEOLogo({ className = "h-8 w-8", ...props }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/icons/seo.svg" alt="SEO" className={`inline-block object-contain shrink-0 ${className}`} {...props} />
  );
}
