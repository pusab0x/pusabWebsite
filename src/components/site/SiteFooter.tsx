import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { CalendarDays, Facebook, Mail, MapPin, PhoneCall, Share2, Youtube } from "lucide-react";
import { NAV_LINKS, PROGRAMS, SITE } from "@/lib/site-content";
import { ShareCard } from "@/components/site/ShareCard";
import logoPusab from "@/assets/logo-pusab.png";

// Most programs live at /programs/<key>, but a couple have their own top-level
// routes — sending those to the generic detail template would be wrong.
const PROGRAM_ROUTE_OVERRIDES: Record<string, string> = {
  sayor: "/sayor",
  others: "/programs",
};

function programHref(key: string) {
  return PROGRAM_ROUTE_OVERRIDES[key] ?? `/programs/${key}`;
}

export function SiteFooter() {
  const [shareOpen, setShareOpen] = useState(false);
  return (
    <footer className="relative mt-24 border-t border-border bg-[var(--color-surface)]">
      <div className="hairline-gradient absolute inset-x-0 top-0" />
      <div className="px-4">
        <div className="mx-auto w-full max-w-6xl px-3 py-12 md:py-16">
          {/* Brand + links share one row so tracks stay content-sized */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
            {/* Brand — its own column on desktop, full width on mobile */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <img
                  src={logoPusab}
                  alt="PUSAB logo"
                  className="h-12 w-12 object-contain md:h-14 md:w-14"
                />
                <div className="font-display text-2xl font-bold">PUSAB</div>
              </div>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                Public University Students' Association of Bishwambarpur — a non-profit,
                non-political association of 300+ students.
              </p>
              <p className="mt-4 text-xs font-semibold text-foreground/70">
                Non-political · Non-profit · Educational.
              </p>
            </div>

            <div>
              <h4 className="text-label">Quick Links</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {NAV_LINKS.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="text-foreground/75 transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-label">Programs</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {PROGRAMS.slice(0, 8).map((p) => (
                  <li key={p.key}>
                    <Link
                      to={programHref(p.key)}
                      className="text-foreground/75 transition-colors hover:text-foreground"
                    >
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact — full width on mobile, last track on desktop */}
            <div className="col-span-2 md:col-span-1">
              <h4 className="text-label">Contact</h4>
              <ul className="mt-4 space-y-5 text-sm">
                <li className="flex items-start gap-2.5">
                  <Mail size={15} className="mt-0.5 shrink-0 text-[var(--color-accent-1)]" />
                  <a href={`mailto:${SITE.email}`} className="break-all hover:underline">
                    {SITE.email}
                  </a>
                </li>
                <li className="space-y-1.5">
                  <a
                    href={`tel:${SITE.phonePresident}`}
                    className="group flex items-center gap-2.5 hover:underline"
                  >
                    <PhoneCall
                      size={15}
                      className="shrink-0 text-[var(--color-accent-1)] transition-transform group-hover:scale-110"
                    />
                    {SITE.phonePresident} <span className="text-muted-foreground">(President)</span>
                  </a>
                  <a
                    href={`tel:${SITE.phoneGS}`}
                    className="group flex items-center gap-2.5 hover:underline"
                  >
                    <PhoneCall
                      size={15}
                      className="shrink-0 text-[var(--color-accent-1)] transition-transform group-hover:scale-110"
                    />
                    {SITE.phoneGS} <span className="text-muted-foreground">(GS)</span>
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-[var(--color-accent-1)]" />
                  Bishwambarpur, Sunamganj
                </li>
                <li className="flex items-start gap-2.5 text-muted-foreground">
                  <CalendarDays size={15} className="mt-0.5 shrink-0 text-[var(--color-accent-1)]" />
                  Est. {SITE.founded}
                </li>
                <li className="mt-2 flex items-center gap-2">
                  <a
                    href={SITE.facebook}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="PUSAB on Facebook"
                    className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground/70 transition-colors hover:border-[color-mix(in_oklab,var(--color-accent-1)_45%,transparent)] hover:text-[var(--color-accent-1)]"
                  >
                    <Facebook size={16} />
                  </a>
                  <a
                    href={SITE.youtube}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="PUSAB on YouTube"
                    className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground/70 transition-colors hover:border-red-500/50 hover:text-red-500"
                  >
                    <Youtube size={16} />
                  </a>
                  <button
                    onClick={() => setShareOpen(true)}
                    aria-label="Share PUSAB's website"
                    className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground/70 transition-colors hover:border-[color-mix(in_oklab,var(--color-accent-1)_45%,transparent)] hover:text-[var(--color-accent-1)]"
                  >
                    <Share2 size={16} />
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <ShareCard open={shareOpen} onClose={() => setShareOpen(false)} />

      <div className="border-t border-border">
        <div className="px-4">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-3 py-5 text-center text-xs text-muted-foreground md:flex-row md:text-left">
            <p>
              © {new Date().getFullYear()} {SITE.fullName}. All rights reserved.
            </p>
            <p>
              Developed by{" "}
              <a
                href="https://www.facebook.com/abin0x"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 inline-block rounded-full border border-[var(--color-accent-1)]/40 bg-[var(--color-accent-1)]/10 px-3 py-1 text-[13px] font-bold text-[var(--color-accent-1)] transition-colors hover:bg-[var(--color-accent-1)] hover:text-white"
              >
                Mahmudul Hasan Abin
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
