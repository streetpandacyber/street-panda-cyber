import Link from "next/link";
import { Mail, MapPin, Phone, Zap } from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
  YoutubeIcon,
} from "./SocialIcons";
import { NewsletterForm } from "./NewsletterForm";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Bundles", href: "/bundles" },
  { label: "Learning Hub", href: "/learning-hub" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const PRODUCT_LINKS = [
  { label: "AI Prompt Packs", href: "/marketplace?category=ai-prompt-packs" },
  { label: "Canva Templates", href: "/marketplace?category=canva-templates" },
  { label: "eBooks", href: "/marketplace?category=ebooks" },
  { label: "Study Materials", href: "/marketplace?category=digital-learning" },
  { label: "Business Templates", href: "/marketplace?category=business-templates" },
  { label: "Mega Bundles", href: "/bundles" },
];

const RESOURCE_LINKS = [
  { label: "Blog", href: "/blog" },
  { label: "My Dashboard", href: "/dashboard" },
  { label: "My Downloads", href: "/dashboard/downloads" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms" },
];

const TRUST_BADGES = [
  "🔒 Secure M-Pesa Payments",
  "⚡ Instant Downloads",
  "✅ 30-Day Money Back",
  "👥 10,000+ Happy Customers",
];

export function Footer() {
  return (
    <footer className="bg-navy-900 pb-24 pt-16 text-white md:pb-16">
      <div className="container-custom">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Brand + newsletter */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-gradient">
                <Zap className="h-5 w-5 text-white" fill="currentColor" />
              </span>
              <span className="text-xl font-extrabold">
                JM <span className="text-gradient-orange">Majiwa</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              Kenya&apos;s #1 digital products marketplace. Learn faster,
              create smarter and grow with AI-powered resources delivered
              instantly to your device.
            </p>
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold text-white/80">
                🎁 Get a free AI prompt pack when you subscribe
              </p>
              <NewsletterForm compact />
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
            {[
              { title: "Quick Links", links: QUICK_LINKS },
              { title: "Products", links: PRODUCT_LINKS },
              { title: "Resources", links: RESOURCE_LINKS },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/90">
                  {col.title}
                </h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/60 transition-colors hover:text-orange-400"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/90">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                <a
                  href="mailto:streetpandacyber@gmail.com"
                  className="transition-colors hover:text-orange-400"
                >
                  streetpandacyber@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                <a
                  href="https://wa.me/254745198099"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-orange-400"
                >
                  +254 745 198 099 (WhatsApp)
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                Nairobi, Kenya
              </li>
            </ul>
            <div className="mt-6 flex gap-2">
              {[
                { icon: TwitterIcon, label: "Twitter", href: "https://twitter.com/jmmajiwa" },
                { icon: InstagramIcon, label: "Instagram", href: "https://instagram.com/jmmajiwa" },
                { icon: FacebookIcon, label: "Facebook", href: "https://facebook.com/jmmajiwa" },
                { icon: YoutubeIcon, label: "YouTube", href: "https://youtube.com/@jmmajiwa" },
                { icon: LinkedinIcon, label: "LinkedIn", href: "https://linkedin.com/company/jmmajiwa" },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white/70 transition-all hover:bg-orange-500 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3 border-t border-white/10 pt-8">
          {TRUST_BADGES.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/70"
            >
              {badge}
            </span>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} JM Majiwa. All rights reserved. Made
            with ❤️ in Kenya.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="transition-colors hover:text-orange-400">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-orange-400">
              Terms
            </Link>
            <Link href="/refund-policy" className="transition-colors hover:text-orange-400">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
