import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Lightbulb, Rocket, ShieldCheck, Target, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "JM Majiwa is Kenya's #1 digital products marketplace — built to help creators, students and businesses learn faster and grow with AI.",
};

const VALUES = [
  {
    icon: Lightbulb,
    title: "Practical Over Perfect",
    description:
      "Everything we sell must save you time or make you money on day one. No fluff, no filler.",
  },
  {
    icon: ShieldCheck,
    title: "Trust First",
    description:
      "Secure M-Pesa payments, a 30-day money-back guarantee and honest product descriptions — always.",
  },
  {
    icon: Users,
    title: "Built for Kenya",
    description:
      "Prices in KES, content localised for our market, and support that understands how we work.",
  },
  {
    icon: Rocket,
    title: "Ship Fast, Improve Faster",
    description:
      "We release early, listen hard, and update products free for life based on customer feedback.",
  },
];

const TEAM = [
  {
    name: "JM Majiwa",
    role: "Founder & Chief Creator",
    emoji: "👨🏾‍💻",
    bio: "Started JM Majiwa after years of watching talented Kenyans pay too much for tools that don't fit their reality.",
  },
  {
    name: "Achieng O.",
    role: "Head of Product",
    emoji: "👩🏾‍🎨",
    bio: "Designs every template and tests every prompt pack before it reaches the store.",
  },
  {
    name: "Kevin M.",
    role: "Engineering",
    emoji: "🧑🏾‍💻",
    bio: "Keeps downloads instant, payments secure and the site fast on any connection.",
  },
  {
    name: "Naomi W.",
    role: "Customer Happiness",
    emoji: "💬",
    bio: "The friendly voice behind our support — replies to every message within hours.",
  },
];

const STATS = [
  { value: "10,000+", label: "Happy customers" },
  { value: "50,000+", label: "Downloads delivered" },
  { value: "500+", label: "Products & templates" },
  { value: "4.9/5", label: "Average rating" },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden py-24 text-center text-white">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-orange-500/25 blur-[100px]" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-neon-400/20 blur-[100px]" />
        <div className="container-custom relative">
          <span className="badge inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold">
            <Target className="h-3.5 w-3.5 text-orange-400" /> Our Mission
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold leading-tight md:text-5xl">
            Putting world-class digital tools in the hands of{" "}
            <span className="text-gradient-orange">every Kenyan</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/70">
            Learn faster, create smarter and grow with AI — without paying
            agency prices or waiting weeks for delivery.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="section-padding bg-white">
        <div className="container-custom grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="badge-orange">Our Story</span>
            <h2 className="section-title mt-4">
              It Started With a <span className="text-gradient-orange">Simple Frustration</span>
            </h2>
            <div className="mt-6 space-y-4 leading-relaxed text-gray-600">
              <p>
                In 2023, our founder needed a simple business plan template and
                a few AI prompts to launch a side hustle. What he found was a
                mess: dollar-priced templates that ignored the Kenyan market,
                freelancers charging thousands of shillings for basic documents,
                and zero instant delivery anywhere.
              </p>
              <p>
                So he built what he wished existed — a marketplace of premium,
                Kenya-ready digital products you can buy with M-Pesa and
                download in seconds. Prompt packs that speak our business
                reality. Templates designed for our brands. Study materials
                aligned to our curriculum.
              </p>
              <p>
                Today, JM Majiwa serves over 10,000 customers across all 47
                counties — creators, students, teachers and entrepreneurs — and
                every product still follows the same rule: it must save you
                hours or earn you money.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {STATS.map((stat) => (
              <div key={stat.label} className="card-premium p-8 text-center">
                <p className="text-3xl font-extrabold text-navy-800">{stat.value}</p>
                <p className="mt-2 text-sm font-medium text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center">
            <span className="badge-neon">Our Values</span>
            <h2 className="section-title mt-4">What We Stand For</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="card-premium p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50">
                    <Icon className="h-6 w-6 text-orange-500" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-navy-800">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center">
            <span className="badge-navy">The Team</span>
            <h2 className="section-title mt-4">
              The Humans Behind <span className="text-gradient-orange">JM Majiwa</span>
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((member) => (
              <div key={member.name} className="card-premium p-7 text-center">
                <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-navy-50 text-4xl">
                  {member.emoji}
                </span>
                <h3 className="mt-4 text-lg font-bold text-navy-800">{member.name}</h3>
                <p className="text-sm font-semibold text-orange-600">{member.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-gray-500">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom text-center">
          <Heart className="mx-auto h-10 w-10 text-orange-500" />
          <h2 className="section-title mt-4">Join 10,000+ Kenyans Growing With Us</h2>
          <p className="section-subtitle mt-4">
            Your next level is one download away.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/marketplace" className="btn-primary">
              Browse the Marketplace
            </Link>
            <Link href="/contact" className="btn-secondary">
              Talk to Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
