import { formatDate } from "@/lib/utils";

export function LegalLayout({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white">
      <section className="hero-gradient py-16 text-center text-white">
        <div className="container-custom">
          <h1 className="text-3xl font-extrabold md:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-white/60">
            Last updated: {formatDate(updated)}
          </p>
        </div>
      </section>
      <div className="container-custom max-w-3xl py-14">
        <p className="text-lg leading-relaxed text-gray-600">{intro}</p>
        <div className="mt-8 space-y-8">{children}</div>
      </div>
    </div>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-bold text-navy-800">{heading}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-gray-600">{children}</div>
    </section>
  );
}
