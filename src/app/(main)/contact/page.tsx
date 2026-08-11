import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the JM Majiwa team — support, partnerships and product questions welcome.",
};

const FAQS = [
  {
    q: "How do I get my files after paying?",
    a: "Downloads unlock instantly after your M-Pesa payment confirms — on the success page, by email, and in your dashboard.",
  },
  {
    q: "Can I get a refund?",
    a: "Yes — every purchase has a 30-day money-back guarantee. Just email support@jmmajiwa.com.",
  },
  {
    q: "Do you offer bulk or school pricing?",
    a: "Absolutely. Institutions buying for groups get special rates — mention it in your message.",
  },
];

export default function ContactPage() {
  return (
    <div>
      <section className="hero-gradient relative overflow-hidden py-20 text-center text-white">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-orange-500/25 blur-[100px]" />
        <div className="container-custom relative">
          <span className="badge inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold">
            💬 Contact
          </span>
          <h1 className="mt-5 text-4xl font-extrabold md:text-5xl">
            We&apos;d Love to <span className="text-gradient-orange">Hear From You</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
            Questions, feedback or partnership ideas — our team replies within
            hours, not days.
          </p>
        </div>
      </section>

      <section className="section-padding bg-gray-50">
        <div className="container-custom grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          {/* Form */}
          <div className="card-premium p-6 md:p-8">
            <h2 className="text-xl font-bold text-navy-800">Send us a message</h2>
            <ContactForm />
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div className="card-premium p-6">
              <h3 className="text-base font-bold text-navy-800">Reach us directly</h3>
              <ul className="mt-4 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
                    <Mail className="h-5 w-5 text-orange-500" />
                  </span>
                  <div>
                    <p className="font-semibold text-navy-800">Email</p>
                    <a href="mailto:support@jmmajiwa.com" className="text-gray-500 hover:text-orange-600">
                      support@jmmajiwa.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-50">
                    <Phone className="h-5 w-5 text-neon-600" />
                  </span>
                  <div>
                    <p className="font-semibold text-navy-800">Phone / WhatsApp</p>
                    <a href="tel:+254700000000" className="text-gray-500 hover:text-orange-600">
                      +254 700 000 000
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50">
                    <MapPin className="h-5 w-5 text-navy-600" />
                  </span>
                  <div>
                    <p className="font-semibold text-navy-800">Location</p>
                    <p className="text-gray-500">Nairobi, Kenya — serving all 47 counties</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                    <MessageCircle className="h-5 w-5 text-violet-500" />
                  </span>
                  <div>
                    <p className="font-semibold text-navy-800">Socials</p>
                    <p className="text-gray-500">@jmmajiwa everywhere</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="card-premium p-6">
              <h3 className="text-base font-bold text-navy-800">Quick answers</h3>
              <div className="mt-4 space-y-4">
                {FAQS.map((faq) => (
                  <div key={faq.q}>
                    <p className="text-sm font-semibold text-navy-800">{faq.q}</p>
                    <p className="mt-1 text-sm text-gray-500">{faq.a}</p>
                  </div>
                ))}
              </div>
              <Link
                href="/refund-policy"
                className="mt-4 inline-block text-sm font-semibold text-orange-600 hover:underline"
              >
                Read our full refund policy →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
