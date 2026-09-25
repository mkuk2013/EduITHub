export interface CourseToolItem {
  name: string;
  icon?: string;
}

export interface CourseOriginalBrandConfig {
  slug: string;
  category: string;
  tag: string;
  pillClass: string;
  gradient: string;
  glowColor: string;
  primaryIconUrl: string;
  primaryIconAlt: string;
  tools: CourseToolItem[];
}

export function getCourseOriginalBrand(slug: string, title: string): CourseOriginalBrandConfig {
  const text = `${slug} ${title}`.toLowerCase();

  // 1. Python Programming
  if (text.includes("python")) {
    return {
      slug,
      category: "Python Programming",
      tag: "🐍 Official Python",
      pillClass: "bg-blue-50 text-[#3776AB] border-blue-200",
      gradient: "from-[#0e1f33] via-[#132c47] to-[#0a1624]",
      glowColor: "rgba(55, 118, 171, 0.45)",
      primaryIconUrl: "/icons/python.svg",
      primaryIconAlt: "Python",
      tools: [
        { name: "Python 3.12", icon: "/icons/python.svg" },
        { name: "Django" },
        { name: "Automation" },
      ],
    };
  }

  // 2. WordPress Development
  if (text.includes("wordpress")) {
    return {
      slug,
      category: "WordPress Development",
      tag: "🌐 WordPress CMS",
      pillClass: "bg-sky-50 text-[#0073AA] border-sky-200",
      gradient: "from-[#082033] via-[#0d3452] to-[#061826]",
      glowColor: "rgba(33, 117, 155, 0.5)",
      primaryIconUrl: "/icons/wordpress.svg",
      primaryIconAlt: "WordPress",
      tools: [
        { name: "WordPress", icon: "/icons/wordpress.svg" },
        { name: "Elementor" },
        { name: "WooCommerce" },
      ],
    };
  }

  // 3. MERN Stack
  if (text.includes("mern")) {
    return {
      slug,
      category: "MERN Stack Development",
      tag: "⚛️ Full MERN Stack",
      pillClass: "bg-cyan-50 text-cyan-800 border-cyan-200",
      gradient: "from-[#061d26] via-[#092e3c] to-[#04151c]",
      glowColor: "rgba(97, 218, 251, 0.45)",
      primaryIconUrl: "/icons/react.svg",
      primaryIconAlt: "React MERN",
      tools: [
        { name: "MongoDB", icon: "/icons/mongodb.svg" },
        { name: "Express" },
        { name: "React", icon: "/icons/react.svg" },
        { name: "Node.js", icon: "/icons/nodejs.svg" },
      ],
    };
  }

  // 4. PERN Stack
  if (text.includes("pern")) {
    return {
      slug,
      category: "PERN Stack Development",
      tag: "🐘 Enterprise PERN",
      pillClass: "bg-indigo-50 text-[#336791] border-indigo-200",
      gradient: "from-[#0a1e33] via-[#0f2e4e] to-[#081829]",
      glowColor: "rgba(51, 103, 145, 0.45)",
      primaryIconUrl: "/icons/postgresql.svg",
      primaryIconAlt: "PostgreSQL PERN",
      tools: [
        { name: "PostgreSQL", icon: "/icons/postgresql.svg" },
        { name: "Express" },
        { name: "React", icon: "/icons/react.svg" },
        { name: "Node.js", icon: "/icons/nodejs.svg" },
      ],
    };
  }

  // 5. Full Stack Development
  if (text.includes("full-stack") || text.includes("full stack")) {
    return {
      slug,
      category: "Full-Stack Development",
      tag: "⚡ Web Core Stack",
      pillClass: "bg-amber-50 text-amber-900 border-amber-200",
      gradient: "from-[#221408] via-[#331c0a] to-[#140b04]",
      glowColor: "rgba(247, 223, 30, 0.4)",
      primaryIconUrl: "/icons/javascript.svg",
      primaryIconAlt: "JavaScript FullStack",
      tools: [
        { name: "HTML5", icon: "/icons/html5.svg" },
        { name: "CSS3", icon: "/icons/css3.svg" },
        { name: "JavaScript", icon: "/icons/javascript.svg" },
        { name: "React", icon: "/icons/react.svg" },
      ],
    };
  }

  // 6. Graphic Designing
  if (text.includes("graphic") || text.includes("design")) {
    return {
      slug,
      category: "Graphic Designing",
      tag: "🎨 Adobe Suite & Figma",
      pillClass: "bg-rose-50 text-rose-800 border-rose-200",
      gradient: "from-[#220a1a] via-[#330f26] to-[#140610]",
      glowColor: "rgba(49, 168, 255, 0.45)",
      primaryIconUrl: "/icons/photoshop.svg",
      primaryIconAlt: "Adobe Photoshop",
      tools: [
        { name: "Photoshop", icon: "/icons/photoshop.svg" },
        { name: "Illustrator", icon: "/icons/illustrator.svg" },
        { name: "Figma", icon: "/icons/figma.svg" },
      ],
    };
  }

  // 7. Video Editing
  if (text.includes("video") || text.includes("editing")) {
    return {
      slug,
      category: "Video Editing & VFX",
      tag: "🎬 Premiere & After Effects",
      pillClass: "bg-purple-50 text-purple-800 border-purple-200",
      gradient: "from-[#20072b] via-[#2f0b40] to-[#13031a]",
      glowColor: "rgba(234, 119, 255, 0.45)",
      primaryIconUrl: "/icons/premierepro.svg",
      primaryIconAlt: "Adobe Premiere Pro",
      tools: [
        { name: "Premiere Pro", icon: "/icons/premierepro.svg" },
        { name: "After Effects", icon: "/icons/aftereffects.svg" },
        { name: "Color Grading" },
      ],
    };
  }

  // 8. Artificial Intelligence
  if (text.includes("artificial") || text.includes("ai")) {
    return {
      slug,
      category: "Artificial Intelligence",
      tag: "🤖 Generative AI & ML",
      pillClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
      gradient: "from-[#05221b] via-[#09362b] to-[#031510]",
      glowColor: "rgba(16, 163, 127, 0.55)",
      primaryIconUrl: "/icons/ai.svg",
      primaryIconAlt: "Artificial Intelligence",
      tools: [
        { name: "OpenAI", icon: "/icons/ai.svg" },
        { name: "Prompt Eng." },
        { name: "Neural Nets" },
      ],
    };
  }

  // 9. Introduction to Operating System
  if (text.includes("operating") || text.includes("system") || text.includes("os")) {
    return {
      slug,
      category: "Operating Systems",
      tag: "💻 Windows & Linux",
      pillClass: "bg-blue-50 text-blue-900 border-blue-200",
      gradient: "from-[#0a1e33] via-[#0f2c4a] to-[#071524]",
      glowColor: "rgba(0, 120, 212, 0.45)",
      primaryIconUrl: "/icons/windows.svg",
      primaryIconAlt: "Windows 11",
      tools: [
        { name: "Windows 11", icon: "/icons/windows.svg" },
        { name: "Linux Tux", icon: "/icons/linux.svg" },
        { name: "Bash CLI" },
      ],
    };
  }

  // 10. Digital Marketing
  if (text.includes("marketing") || text.includes("digital")) {
    return {
      slug,
      category: "Digital Marketing",
      tag: "📈 Meta & Google Ads",
      pillClass: "bg-sky-50 text-sky-900 border-sky-200",
      gradient: "from-[#081e36] via-[#0c2e52] to-[#061628]",
      glowColor: "rgba(0, 128, 251, 0.5)",
      primaryIconUrl: "/icons/meta.svg",
      primaryIconAlt: "Meta Ads",
      tools: [
        { name: "Meta Ads", icon: "/icons/meta.svg" },
        { name: "Google Ads", icon: "/icons/googleads.svg" },
        { name: "Sales Funnels" },
      ],
    };
  }

  // 11. SEO Mastery
  if (text.includes("seo")) {
    return {
      slug,
      category: "SEO Mastery",
      tag: "🔍 Search Engine #1",
      pillClass: "bg-emerald-50 text-emerald-900 border-emerald-200",
      gradient: "from-[#092218] via-[#0d3425] to-[#061710]",
      glowColor: "rgba(52, 168, 83, 0.5)",
      primaryIconUrl: "/icons/seo.svg",
      primaryIconAlt: "Google Search Console SEO",
      tools: [
        { name: "Search Console", icon: "/icons/seo.svg" },
        { name: "Keyword Rank" },
        { name: "On-Page SEO" },
      ],
    };
  }

  // Fallback
  return {
    slug,
    category: "Professional IT Course",
    tag: "⭐ Certified Course",
    pillClass: "bg-slate-50 text-slate-800 border-slate-200",
    gradient: "from-[#0f172a] via-[#1e293b] to-[#0f172a]",
    glowColor: "rgba(99, 102, 241, 0.45)",
    primaryIconUrl: "/icons/react.svg",
    primaryIconAlt: "IT Course",
    tools: [
      { name: "Live Online" },
      { name: "Expert Trainer" },
      { name: "Certificate" },
    ],
  };
}

/** Standardized, 100% Uniform Luxury Graphic Showcase Banner for Course Cards */
export function CourseOriginalBanner({
  slug,
  title,
  thumbnail,
  className = "",
}: {
  slug: string;
  title: string;
  thumbnail?: string | null;
  className?: string;
}) {
  const brand = getCourseOriginalBrand(slug, title);

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden bg-gradient-to-br ${brand.gradient} ${className}`}
    >
      {/* Background Subtle Tech Matrix Pattern */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Atmospheric Brand Glow */}
      <div
        aria-hidden="true"
        className="absolute h-40 w-40 rounded-full blur-3xl pointer-events-none"
        style={{
          backgroundColor: brand.glowColor,
          top: "42%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Center Uniform Content Container */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 py-2 text-center">
        {/* EXACT SAME UNIFORM EMBLEM ON EVERY SINGLE CARD (72x72px container, 44x44px icon) */}
        <div className="relative flex h-18 w-18 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-white/95 p-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.3)] border border-white/80 backdrop-blur-md transition-transform duration-300 group-hover:scale-108 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={brand.primaryIconUrl}
            alt={brand.primaryIconAlt}
            className="h-11 w-11 sm:h-12 sm:w-12 object-contain drop-shadow-xs"
          />
        </div>

        {/* Uniform Sub-Tool Badges (Identical height & padding across all cards) */}
        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 max-w-[95%]">
          {brand.tools.map((tool, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 rounded-full bg-slate-950/70 px-2.5 py-0.5 text-[9.5px] font-mono font-semibold text-white/95 backdrop-blur-md border border-white/15 shadow-xs whitespace-nowrap"
            >
              {tool.icon && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tool.icon} alt="" className="h-3 w-3 object-contain shrink-0" />
              )}
              <span>{tool.name}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
