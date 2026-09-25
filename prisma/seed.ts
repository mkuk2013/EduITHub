/**
 * Seed script for Edu IT Hub Academy.
 *
 * Run:  npm run db:seed   (tsx prisma/seed.ts)
 *
 * The script is IDEMPOTENT — every write is an upsert (or a
 * delete-then-recreate scoped to seeded rows), so it is safe to run
 * multiple times.
 *
 * Admin bootstrap: creates/updates the admin user ONLY from the
 * ADMIN_EMAIL / ADMIN_PASSWORD environment variables. If they are not
 * set, the admin step is skipped with a console warning.
 */

import { PrismaClient, CourseStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

const SETTINGS: Array<{ key: string; value: string }> = [
  { key: "academy.name", value: "Edu IT Hub Academy" },
  {
    key: "academy.tagline",
    value: "Practical IT skills, taught live — from Umerkot to the world.",
  },
  {
    key: "academy.collaboration",
    value:
      "In collaboration with the most talented and intelligent IT specialist students and highly qualified, professional and highly experienced tutors/instructors of one of the most popular and famous institutes, Super Sys-Tech Computers Centre Umerkot.",
  },
  // TODO: confirm the official contact email with the academy owner.
  { key: "contact.email", value: "info@eduithub.academy" },
  { key: "contact.phone", value: "03363268833" },
  { key: "contact.whatsapp", value: "03363268833" },
  { key: "payment.accountName", value: "Mukesh Kumar" },
  { key: "payment.accountNumber", value: "03363268833" },
  { key: "payment.methods", value: "Easypaisa / JazzCash" },
  { key: "currency", value: "PKR" },
  { key: "timezone", value: "Asia/Karachi" },
  { key: "email.notificationsEnabled", value: "true" },
];

// ---------------------------------------------------------------------------
// Instructors
// ---------------------------------------------------------------------------

interface InstructorSeed {
  name: string;
  bio: string;
  experience: string;
  skills: string[];
}

const INSTRUCTORS: InstructorSeed[] = [
  {
    name: "Mukesh Kumar",
    bio: "Founder of Edu IT Hub Academy and IT trainer associated with Super Sys-Tech Computers Centre, Umerkot. Teaches modern web development with a practical, project-based approach — students learn by building real applications, not just watching slides.",
    experience: "Full-stack web developer and IT trainer",
    skills: ["JavaScript", "TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Prisma"],
  },
  {
    name: "Design & Creative Faculty",
    bio: "The creative instruction team of Edu IT Hub Academy, associated with Super Sys-Tech Computers Centre, Umerkot. Guides students through graphic design and video editing with real client-style briefs, critiques, and portfolio reviews.",
    experience: "Professional design and media production team",
    skills: [
      "Adobe Photoshop",
      "Adobe Illustrator",
      "Premiere Pro",
      "After Effects",
      "Brand Identity",
      "Social Media Design",
    ],
  },
  {
    name: "Marketing & AI Faculty",
    bio: "The marketing and emerging-technology instruction team of Edu IT Hub Academy, associated with Super Sys-Tech Computers Centre, Umerkot. Covers digital marketing, SEO, and applied artificial intelligence through hands-on campaigns and guided projects.",
    experience: "Digital marketing and AI practitioners",
    skills: ["SEO", "Meta Ads", "Google Ads", "Content Marketing", "Python", "Machine Learning"],
  },
];

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

interface ModuleSeed {
  title: string;
  description: string;
}

interface CourseSeed {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  duration: string;
  modules: ModuleSeed[];
}

const COURSES: CourseSeed[] = [
  {
    slug: "introduction-to-operating-system",
    title: "Introduction to Operating System",
    shortDescription:
      "Start your IT journey by understanding how computers actually work. Learn operating system concepts, file management, system settings, and essential computer maintenance — the perfect foundation before programming or office-productivity courses.",
    description:
      "Every IT career starts with truly understanding the machine in front of you. This course demystifies the operating system: what happens when a computer boots, how files and programs are managed, and how to keep a system secure and running smoothly. You will master Windows hands-on — from the desktop and settings to user accounts, storage, backups, and troubleshooting common problems. By the end, you will use any computer with confidence and have the solid base needed for programming, design, or freelancing courses.",
    duration: "2 Months",
    modules: [
      {
        title: "Computer & OS Fundamentals",
        description:
          "What an operating system is, hardware vs software, the boot process, and types of operating systems.",
      },
      {
        title: "Mastering Windows",
        description:
          "Desktop, taskbar and Start menu, system settings and personalization, installing and removing software.",
      },
      {
        title: "Files, Folders & Storage",
        description:
          "File systems explained, organizing files and folders, USB drives, cloud storage, and backups.",
      },
      {
        title: "Security, Users & Maintenance",
        description:
          "User accounts and permissions, antivirus and safe browsing habits, updates, cleanup, and troubleshooting.",
      },
    ],
  },
  {
    slug: "full-stack-development",
    title: "Full-Stack Development",
    shortDescription:
      "Become a complete web developer — from pixel-perfect frontends to powerful backends. Master HTML, CSS, JavaScript, React, Next.js, Node.js, and PostgreSQL while building real, deployable projects for your portfolio.",
    description:
      "This flagship program takes you from zero to job-ready full-stack developer. You will start with the fundamentals of the web — semantic HTML, modern CSS, and responsive layouts — then move into JavaScript and TypeScript, the language of the modern web. On the frontend you will build interactive apps with React and Next.js; on the backend you will design REST APIs with Node.js and model data in PostgreSQL with Prisma. Along the way you will learn authentication, file uploads, deployment, and Git workflows used by professional teams. The course ends with a capstone project and freelancing guidance so you can start earning.",
    duration: "6 Months",
    modules: [
      {
        title: "HTML, CSS & Responsive Design",
        description:
          "Semantic HTML, modern CSS including Flexbox and Grid, and mobile-first responsive layouts.",
      },
      {
        title: "JavaScript & TypeScript Essentials",
        description:
          "Core JavaScript, DOM manipulation, async programming, and type-safe code with TypeScript.",
      },
      {
        title: "React & Next.js Frontend",
        description:
          "Components, hooks, routing, data fetching, and server-side rendering with Next.js App Router.",
      },
      {
        title: "Node.js, REST APIs & Databases",
        description:
          "Building REST APIs with Node.js and Express, PostgreSQL modelling, and Prisma ORM.",
      },
      {
        title: "Authentication, Uploads & Deployment",
        description:
          "Secure auth with sessions and JWT, file uploads, environment config, and deploying to production.",
      },
      {
        title: "Capstone Project & Freelancing",
        description:
          "A complete full-stack application for your portfolio, plus profiles, proposals, and client skills.",
      },
    ],
  },
  {
    slug: "mern-stack-development",
    title: "MERN Stack Development",
    shortDescription:
      "Master the most in-demand JavaScript stack: MongoDB, Express.js, React, and Node.js. Build dynamic full-stack applications with a single language across frontend and backend, and graduate with portfolio-ready projects.",
    description:
      "The MERN stack powers thousands of startups and products worldwide — and it is all JavaScript. In this course you will go deep on each layer: crafting reactive user interfaces with React, building robust APIs with Node.js and Express, and modelling flexible data with MongoDB and Mongoose. You will learn authentication, state management, and deployment patterns, then combine everything in full-stack projects that mirror real client work. Ideal for students who want one language, end to end, and maximum freelance demand.",
    duration: "6 Months",
    modules: [
      {
        title: "Modern JavaScript (ES6+) & Tooling",
        description:
          "ES6+ syntax, modules, promises and async/await, npm, Vite, and Git workflows.",
      },
      {
        title: "React.js Frontend Development",
        description:
          "Components, hooks, context, routing with React Router, and consuming REST APIs.",
      },
      {
        title: "Node.js & Express.js Backend",
        description:
          "Servers, middleware, RESTful routing, validation, error handling, and JWT authentication.",
      },
      {
        title: "MongoDB & Mongoose",
        description:
          "Document modelling, CRUD with Mongoose, aggregation basics, and Atlas cloud setup.",
      },
      {
        title: "Full-Stack Projects & Deployment",
        description:
          "Connecting frontend to backend, production builds, deployment, and portfolio projects.",
      },
    ],
  },
  {
    slug: "pern-stack-development",
    title: "PERN Stack Development",
    shortDescription:
      "Build robust, enterprise-grade web applications with PostgreSQL, Express.js, React, and Node.js. Learn relational database design, Prisma ORM, and TypeScript for the type-safe full-stack development professional teams use.",
    description:
      "When applications need reliable, structured data, teams reach for PostgreSQL — and the PERN stack pairs it with the flexibility of Node.js and React. This course teaches you to design normalized relational schemas, write safe database code with the Prisma ORM, and build type-safe APIs with TypeScript and Express. On the frontend you will create polished React and Next.js interfaces. You will finish with a production-grade capstone that demonstrates the engineering discipline employers look for.",
    duration: "6 Months",
    modules: [
      {
        title: "JavaScript & TypeScript Foundations",
        description:
          "Modern JavaScript plus TypeScript types, interfaces, and generics for safer code.",
      },
      {
        title: "React & Next.js Frontend",
        description:
          "Component architecture, hooks, forms, data fetching, and App Router patterns.",
      },
      {
        title: "Node.js & Express REST APIs",
        description:
          "REST design, middleware pipelines, authentication, and API testing.",
      },
      {
        title: "PostgreSQL & Prisma ORM",
        description:
          "Relational modelling, migrations, relations, transactions, and query optimization basics.",
      },
      {
        title: "Capstone: Production-Grade PERN App",
        description:
          "A complete deployed application with auth, roles, and documentation for your portfolio.",
      },
    ],
  },
  {
    slug: "python-programming",
    title: "Python Programming",
    shortDescription:
      "Learn the world's most beginner-friendly and versatile programming language. From core syntax to object-oriented programming and popular libraries, build the problem-solving skills that open doors to AI, data, and backend careers.",
    description:
      "Python is the ideal first programming language: readable, powerful, and used everywhere from automation to artificial intelligence. This course takes you from installing Python and writing your first script to thinking like a programmer — breaking problems down, working with data structures, and organizing code into functions, modules, and classes. You will practice with dozens of exercises, work with files and APIs, explore popular libraries, and finish with mini projects that prove your skills. A perfect stepping stone into the AI course or backend development.",
    duration: "4 Months",
    modules: [
      {
        title: "Python Basics & Setup",
        description:
          "Installing Python, VS Code setup, variables, data types, input/output, and first programs.",
      },
      {
        title: "Control Flow & Data Structures",
        description:
          "Conditionals, loops, lists, tuples, dictionaries, sets, and comprehensions.",
      },
      {
        title: "Functions, Modules & OOP",
        description:
          "Writing reusable functions, organizing modules, and object-oriented programming with classes.",
      },
      {
        title: "Files, APIs & Popular Libraries",
        description:
          "Reading and writing files, working with JSON and HTTP APIs, and a tour of essential libraries.",
      },
      {
        title: "Mini Projects & Next Steps",
        description:
          "Guided projects that combine everything, plus a roadmap into AI, data, or web backends.",
      },
    ],
  },
  {
    slug: "wordpress-development",
    title: "WordPress Development",
    shortDescription:
      "Build professional websites without writing code from scratch. Master WordPress themes, page builders, plugins, and WooCommerce to launch business sites and online stores — a fast track to freelancing income.",
    description:
      "WordPress powers over 40% of the web, and businesses everywhere need people who can build and maintain their sites. In this practical course you will learn to set up WordPress, choose and customize themes, design pages with modern page builders, and extend sites with plugins. You will build a complete online store with WooCommerce — products, payments, and orders — then learn the professional finishing touches: security hardening, speed optimization, backups, and basic SEO. Graduate ready to take on local and freelance clients.",
    duration: "3 Months",
    modules: [
      {
        title: "WordPress Setup & Dashboard Tour",
        description:
          "Domain, hosting, one-click installs, and mastering the WordPress dashboard.",
      },
      {
        title: "Themes & Page Builders",
        description:
          "Choosing themes, customizer settings, and designing pages with Elementor-style builders.",
      },
      {
        title: "Plugins & Site Customization",
        description:
          "Essential plugins for forms, galleries, and functionality, plus menus and widgets.",
      },
      {
        title: "WooCommerce: Online Stores",
        description:
          "Products, categories, carts, checkout, payment gateways, and order management.",
      },
      {
        title: "Security, Speed, SEO & Launch",
        description:
          "Hardening, caching, backups, basic on-page SEO, and launching client sites professionally.",
      },
    ],
  },
  {
    slug: "graphic-designing",
    title: "Graphic Designing",
    shortDescription:
      "Turn creativity into a career. Learn design theory, Adobe Photoshop and Illustrator, and brand identity design while building a portfolio of real client-style projects for print and social media.",
    description:
      "Good design is a learnable skill — and a highly paid one. Starting with the fundamentals of color, typography, and layout, this course takes you hands-on through Adobe Photoshop for photo editing and social media graphics, and Adobe Illustrator for logos and vector artwork. You will work through realistic client briefs: brand identities, posters, and complete social media kits. The final module focuses on what matters most — a polished portfolio and the freelancing skills to win your first design clients.",
    duration: "4 Months",
    modules: [
      {
        title: "Design Theory, Color & Typography",
        description:
          "Design principles, color theory, typography pairing, and layout fundamentals.",
      },
      {
        title: "Adobe Photoshop Essentials",
        description:
          "Layers, selections, retouching, and creating social media graphics and posters.",
      },
      {
        title: "Adobe Illustrator & Vector Art",
        description:
          "Pen tool mastery, logo design, icons, and scalable vector illustrations.",
      },
      {
        title: "Brand Identity & Social Media Design",
        description:
          "Complete brand kits: logos, color palettes, business cards, and content templates.",
      },
      {
        title: "Portfolio Building & Freelancing",
        description:
          "Curating your best work on Behance, writing proposals, and landing design clients.",
      },
    ],
  },
  {
    slug: "artificial-intelligence",
    title: "Artificial Intelligence",
    shortDescription:
      "Step into the future with practical AI skills. Learn Python for AI, machine learning fundamentals, neural networks, and generative AI tools — and build intelligent applications you can show employers.",
    description:
      "Artificial intelligence is reshaping every industry, and practical AI skills are among the most valuable you can learn. This course starts with Python for AI — NumPy, pandas, and data handling — then introduces machine learning: regression, classification, and model evaluation with scikit-learn. You will then explore neural networks and deep learning concepts, followed by natural language processing and modern generative AI, including working with large language model APIs. Every stage includes hands-on projects, ending with deployed AI applications for your portfolio.",
    duration: "6 Months",
    modules: [
      {
        title: "AI Foundations & Python for AI",
        description:
          "What AI can and cannot do, plus NumPy, pandas, and data preparation with Python.",
      },
      {
        title: "Machine Learning Essentials",
        description:
          "Regression, classification, clustering, and evaluating models with scikit-learn.",
      },
      {
        title: "Deep Learning & Neural Networks",
        description:
          "How neural networks learn, plus an introduction to TensorFlow/Keras or PyTorch.",
      },
      {
        title: "NLP, LLMs & Generative AI",
        description:
          "Text processing, embeddings, prompting, and building with large language model APIs.",
      },
      {
        title: "AI Projects & Deployment",
        description:
          "End-to-end AI applications, model serving basics, and portfolio-ready demos.",
      },
    ],
  },
  {
    slug: "video-editing",
    title: "Video Editing",
    shortDescription:
      "Create scroll-stopping videos for YouTube, social media, and clients. Master storytelling, Premiere Pro, color grading, sound design, and motion graphics with hands-on editing projects.",
    description:
      "Video is the dominant content format online — and skilled editors are in constant demand. This course teaches editing as storytelling first and software second. You will master Adobe Premiere Pro: cutting, pacing, transitions, and timelines. Then you will level up with color grading, sound design and mixing, and motion graphics with After Effects basics. Through real projects — vlogs, ads, and client-style edits — you will build a showreel that wins work on YouTube, social media, and freelance platforms.",
    duration: "3 Months",
    modules: [
      {
        title: "Editing Foundations & Storytelling",
        description:
          "Narrative structure, pacing, shot selection, and planning an edit before you cut.",
      },
      {
        title: "Premiere Pro Essentials",
        description:
          "Timeline workflow, cutting techniques, transitions, titles, and keyboard-driven speed.",
      },
      {
        title: "Color Grading & Audio Design",
        description:
          "Correction vs grading, LUTs, looks, plus dialogue cleanup, music, and sound effects.",
      },
      {
        title: "Motion Graphics & Effects",
        description:
          "Animated titles, lower thirds, keyframing, and After Effects fundamentals.",
      },
      {
        title: "Client Projects & Portfolio",
        description:
          "Real briefs, revision workflows, pricing basics, and a showreel that gets clients.",
      },
    ],
  },
  {
    slug: "digital-marketing",
    title: "Digital Marketing",
    shortDescription:
      "Learn to grow any business online. Master social media marketing, paid advertising, content strategy, and analytics — practical skills that local businesses and freelancing clients pay for.",
    description:
      "Every business needs customers, and digital marketers deliver them. This hands-on course covers the full modern marketing toolkit: building a strategy, growing audiences on social media, running profitable Meta and Google ad campaigns, and creating content and email sequences that convert. You will learn to read analytics, write clear reports, and present results like a professional. With real campaign practice and freelancing guidance, you will be ready to manage marketing for local businesses or remote clients.",
    duration: "3 Months",
    modules: [
      {
        title: "Marketing Foundations & Strategy",
        description:
          "Funnels, audiences, positioning, and building a practical marketing plan.",
      },
      {
        title: "Social Media Marketing",
        description:
          "Content pillars, platform strategies for Facebook, Instagram, and TikTok, and growth tactics.",
      },
      {
        title: "Paid Ads: Meta & Google",
        description:
          "Campaign setup, targeting, budgets, creatives, and optimizing for return on ad spend.",
      },
      {
        title: "Content & Email Marketing",
        description:
          "Copywriting basics, content calendars, and email sequences that nurture and sell.",
      },
      {
        title: "Analytics, Reporting & Freelancing",
        description:
          "Reading Meta and Google Analytics, client reporting, and winning marketing retainers.",
      },
    ],
  },
  {
    slug: "seo-mastery",
    title: "SEO Mastery",
    shortDescription:
      "Rank websites on Google and turn search traffic into business. Learn keyword research, on-page and technical SEO, link building, and professional SEO audits with industry tools.",
    description:
      "Search engine optimization is one of the highest-ROI skills in digital marketing — and it compounds. This course teaches SEO the professional way: how search engines crawl, index, and rank pages; how to find keywords worth targeting; and how to optimize content, site structure, and technical performance. You will learn ethical link-building strategies, run complete SEO audits with industry tools, and package findings into client-ready reports. Finish with real audit projects and the freelancing playbook for SEO services.",
    duration: "3 Months",
    modules: [
      {
        title: "How Search Engines Work",
        description:
          "Crawling, indexing, ranking factors, and how Google evaluates content quality.",
      },
      {
        title: "Keyword Research & On-Page SEO",
        description:
          "Finding winnable keywords, search intent, and optimizing titles, content, and structure.",
      },
      {
        title: "Technical SEO",
        description:
          "Site speed, mobile-friendliness, sitemaps, schema markup, and fixing crawl issues.",
      },
      {
        title: "Link Building & Off-Page SEO",
        description:
          "Ethical outreach, digital PR basics, and building domain authority safely.",
      },
      {
        title: "SEO Audits, Tools & Client Projects",
        description:
          "Running full audits with professional tools and delivering client-ready reports.",
      },
    ],
  },
];

/** Course slug -> instructor name(s) */
const COURSE_INSTRUCTORS: Record<string, string[]> = {
  "introduction-to-operating-system": ["Mukesh Kumar"],
  "full-stack-development": ["Mukesh Kumar"],
  "mern-stack-development": ["Mukesh Kumar"],
  "pern-stack-development": ["Mukesh Kumar"],
  "python-programming": ["Mukesh Kumar"],
  "wordpress-development": ["Mukesh Kumar"],
  "graphic-designing": ["Design & Creative Faculty"],
  "artificial-intelligence": ["Marketing & AI Faculty"],
  "video-editing": ["Design & Creative Faculty"],
  "digital-marketing": ["Marketing & AI Faculty"],
  "seo-mastery": ["Marketing & AI Faculty"],
};

// ---------------------------------------------------------------------------
// Seed steps
// ---------------------------------------------------------------------------

async function seedSettings(): Promise<void> {
  for (const { key, value } of SETTINGS) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  console.log(`[seed] upserted ${SETTINGS.length} settings`);
}

async function seedInstructors(): Promise<Map<string, string>> {
  const ids = new Map<string, string>();
  for (const instructor of INSTRUCTORS) {
    const existing = await prisma.instructor.findFirst({
      where: { name: instructor.name },
      select: { id: true },
    });
    const row = existing
      ? await prisma.instructor.update({ where: { id: existing.id }, data: instructor })
      : await prisma.instructor.create({ data: instructor });
    ids.set(instructor.name, row.id);
  }
  console.log(`[seed] upserted ${ids.size} instructors`);
  return ids;
}

async function seedCourses(): Promise<Map<string, string>> {
  const ids = new Map<string, string>();
  for (const course of COURSES) {
    const row = await prisma.course.upsert({
      where: { slug: course.slug },
      update: {
        title: course.title,
        shortDescription: course.shortDescription,
        description: course.description,
        monthlyFee: 1000,
        duration: course.duration,
        mode: "Online",
        status: CourseStatus.PUBLISHED,
      },
      create: {
        slug: course.slug,
        title: course.title,
        shortDescription: course.shortDescription,
        description: course.description,
        monthlyFee: 1000,
        duration: course.duration,
        mode: "Online",
        status: CourseStatus.PUBLISHED,
      },
      select: { id: true },
    });
    ids.set(course.slug, row.id);

    // Modules: upsert on the (courseId, order) unique key.
    for (let i = 0; i < course.modules.length; i++) {
      const module = course.modules[i] as ModuleSeed;
      await prisma.courseModule.upsert({
        where: { courseId_order: { courseId: row.id, order: i + 1 } },
        update: { title: module.title, description: module.description },
        create: {
          courseId: row.id,
          title: module.title,
          description: module.description,
          order: i + 1,
        },
      });
    }
  }
  const moduleCount = COURSES.reduce((sum, c) => sum + c.modules.length, 0);
  console.log(`[seed] upserted ${ids.size} courses and ${moduleCount} modules`);
  return ids;
}

async function seedCourseInstructors(
  courseIds: Map<string, string>,
  instructorIds: Map<string, string>,
): Promise<void> {
  const ids = [...courseIds.values()];
  // Reset links for seeded courses, then recreate (idempotent).
  await prisma.courseInstructor.deleteMany({ where: { courseId: { in: ids } } });

  const links: Array<{ courseId: string; instructorId: string }> = [];
  for (const [slug, names] of Object.entries(COURSE_INSTRUCTORS)) {
    const courseId = courseIds.get(slug);
    if (!courseId) continue;
    for (const name of names) {
      const instructorId = instructorIds.get(name);
      if (instructorId) links.push({ courseId, instructorId });
    }
  }
  await prisma.courseInstructor.createMany({ data: links, skipDuplicates: true });
  console.log(`[seed] linked ${links.length} course-instructor rows`);
}

async function seedAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn(
      "[seed] ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin bootstrap. " +
        "Set them in .env and re-run the seed to create the admin user.",
    );
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.user.upsert({
    where: { email },
    update: { name: "Administrator", role: "ADMIN", status: "APPROVED", passwordHash },
    create: {
      name: "Administrator",
      email,
      passwordHash,
      role: "ADMIN",
      status: "APPROVED",
    },
    select: { id: true, email: true },
  });
  console.log(`[seed] admin user ready: ${admin.email} (${admin.id})`);
}

async function main(): Promise<void> {
  await seedSettings();
  const instructorIds = await seedInstructors();
  const courseIds = await seedCourses();
  await seedCourseInstructors(courseIds, instructorIds);
  await seedAdmin();
  console.log("[seed] done");
}

main()
  .catch((error: unknown) => {
    console.error("[seed] failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
