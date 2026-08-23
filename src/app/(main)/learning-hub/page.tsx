import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  GraduationCap,
  Gift,
  Palette,
  Play,
  Rocket,
  Sparkles,
} from "lucide-react";
import { getBlogPosts } from "@/lib/data/service";
import { PostCard } from "@/components/blog/BlogBrowser";
import { StoreUnavailable } from "@/components/errors/StoreUnavailable";

export const metadata: Metadata = {
  title: "Learning Hub — Level Up Your Skills",
  description:
    "Structured learning paths, free resources and tutorials on AI, design, business and digital skills — built for Kenya.",
};

export const dynamic = "force-dynamic";

const PATHS = [
  {
    from: "AI Beginner",
    to: "Prompt Engineer",
    icon: Sparkles,
    color: "from-violet-500 to-purple-600",
    steps: ["AI fundamentals", "The 5-part prompt formula", "Build a prompt library", "Sell your packs"],
    link: "/marketplace?category=ai-prompt-packs",
  },
  {
    from: "Content Creator",
    to: "Pro Designer",
    icon: Palette,
    color: "from-blue-500 to-indigo-600",
    steps: ["Canva basics", "Brand systems", "Template mastery", "Client-ready portfolios"],
    link: "/marketplace?category=canva-templates",
  },
  {
    from: "Student",
    to: "Digital Professional",
    icon: GraduationCap,
    color: "from-neon-500 to-neon-600",
    steps: ["Study systems", "AI study tools", "Digital skills", "First online income"],
    link: "/marketplace?category=digital-learning",
  },
  {
    from: "Entrepreneur",
    to: "Digital Business",
    icon: Briefcase,
    color: "from-orange-500 to-orange-600",
    steps: ["Validate your idea", "Package knowledge", "Automate M-Pesa sales", "Scale with bundles"],
    link: "/marketplace?category=business-templates",
  },
];

const FREE_RESOURCES = [
  { emoji: "🎁", title: "Free AI Starter Prompt Pack", desc: "25 hand-picked prompts for business, content and study — free with the newsletter.", cta: "Get it free", href: "/#newsletter" },
  { emoji: "📅", title: "KCSE 30-Day Revision Timetable", desc: "The exact examiner-approved timetable from our study bundle, free to print.", cta: "Read the guide", href: "/blog/kcse-30-day-revision-timetable" },
  { emoji: "🧪", title: "Prompt Formula Cheat Sheet", desc: "Role + Context + Task + Format + Constraint — the whole skill on one page.", cta: "Learn it now", href: "/blog/prompt-engineering-101-beginners" },
];

export default async function LearningHubPage() {
  let posts;
  try {
    posts = await getBlogPosts();
  } catch (error) {
    console.error("[learning-hub] content unavailable", error);
    return <StoreUnavailable />;
  }
  const tutorials = posts.slice(0, 6);

  return (
    <div>
      {/* hero */}
      <section className="hero-gradient relative overflow-hidden py-24 text-center text-white">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-orange-500/25 blur-[100px]" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-neon-400/20 blur-[100px]" />
        <div className="container-custom relative">
          <span className="badge inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold">
            <Rocket className="h-3.5 w-3.5 text-orange-400" /> Learning Hub
          </span>
          <h1 className="mt-5 text-4xl font-extrabold md:text-5xl">
            Level Up Your <span className="text-gradient-orange">Skills</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
            Structured paths from beginner to professional — free tutorials,
            practical resources and the tools to put them to work.
          </p>
        </div>
      </section>

      {/* learning paths */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center">
            <span className="badge-navy">🧭 Learning Paths</span>
            <h2 className="section-title mt-4">Choose Your Journey</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {PATHS.map((path) => {
              const Icon = path.icon;
              return (
                <div key={path.to} className="card-premium flex h-full flex-col p-6">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${path.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </span>
                  <p className="mt-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                    {path.from}
                  </p>
                  <h3 className="mt-1 text-lg font-extrabold text-navy-800">→ {path.to}</h3>
                  <ul className="mt-4 flex-1 space-y-2">
                    {path.steps.map((s, i) => (
                      <li key={s} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-500">
                          {i + 1}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ul>
                  <Link href={path.link} className="btn-secondary mt-5 w-full !py-2.5 text-sm">
                    Start Path <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* featured video placeholder */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="badge-orange">🎬 Video Course</span>
            <h2 className="section-title mt-4">
              Watch: <span className="text-gradient-orange">AI for Beginners</span>
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Our free crash course walks you from your first prompt to your
              first paid project. New episodes every week on the JM Majiwa
              channel.
            </p>
            <Link
              href="https://youtube.com/@jmmajiwa"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-6"
            >
              <Play className="h-4 w-4" /> Watch on YouTube
            </Link>
          </div>
          {/* YouTube-embed-ready placeholder (swap src when live) */}
          <div className="relative aspect-video overflow-hidden rounded-3xl bg-navy-900 shadow-soft-xl">
            <Image
              src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=75"
              alt="AI for Beginners course preview"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover opacity-60"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-500 shadow-glow-orange transition-transform hover:scale-110">
                <Play className="h-8 w-8 fill-white text-white" />
              </span>
            </span>
            <span className="absolute bottom-4 left-4 badge bg-navy-950/70 text-white backdrop-blur">
              Episode 1 • 12 min
            </span>
          </div>
        </div>
      </section>

      {/* free resources */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center">
            <span className="badge-neon">
              <Gift className="h-3 w-3" /> Free Resources
            </span>
            <h2 className="section-title mt-4">Grab These Free</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {FREE_RESOURCES.map((r) => (
              <div key={r.title} className="card-premium flex h-full flex-col p-7">
                <span className="text-4xl">{r.emoji}</span>
                <h3 className="mt-4 text-lg font-bold text-navy-800">{r.title}</h3>
                <p className="mt-2 flex-1 text-sm text-gray-500">{r.desc}</p>
                <Link href={r.href} className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-orange-600 hover:underline">
                  {r.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* latest tutorials */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="flex items-end justify-between">
            <div>
              <span className="badge-orange">
                <BookOpen className="h-3 w-3" /> Tutorials
              </span>
              <h2 className="section-title mt-4">Latest Tutorials</h2>
            </div>
            <Link href="/blog" className="btn-secondary hidden md:inline-flex">
              All articles <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tutorials.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
