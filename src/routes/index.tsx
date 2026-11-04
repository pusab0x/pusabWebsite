import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  HeartHandshake,
  BookOpen,
  Award,
  Stethoscope,
  Megaphone,
  Quote,
  Facebook,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatedHeading } from "@/components/site/AnimatedHeading";
import { GradientButton } from "@/components/site/GradientButton";
import { StatCounter } from "@/components/site/StatCounter";
import { AboutPreview } from "@/components/site/AboutPreview";
import { ActivitiesBento } from "@/components/site/ActivitiesBento";
import { Timeline } from "@/components/site/Timeline";
import { LocationMap } from "@/components/site/LocationMap";
import { LatestNews } from "@/components/site/LatestNews";
import { MomentsPreview } from "@/components/site/MomentsPreview";
import { UpcomingPrograms } from "@/components/site/UpcomingPrograms";
import { LeadershipPreview } from "@/components/site/LeadershipPreview";
import { TestimonialsCarousel } from "@/components/site/TestimonialsCarousel";
import {
  ExamHeroButton,
  ExamHeroCard,
  ExamHeroPill,
  ExamMobileBar,
  ExamStepsSection,
  useExamPromo,
} from "@/components/site/ExamHome";
import { SITE, buildStats } from "@/lib/site-content";
import { settingsApi, type SiteSettings } from "@/lib/api";
import { usePageHero } from "@/lib/usePageHero";
import { SAYOR_ISSUES } from "@/lib/sayorIssues";
import homeHero1 from "@/assets/home-hero-1.webp";
import homeHero2 from "@/assets/home-hero-2.webp";
import sayorHome from "@/assets/sayor-home.webp";

const HERO_SLIDES = [homeHero1, homeHero2];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PUSAB — Empowering Students, Transforming Bishwambarpur" },
      {
        name: "description",
        content:
          "PUSAB is a non-profit, non-political association of 300+ students from public universities, medical & engineering colleges — united for one upazila.",
      },
      { property: "og:title", content: "PUSAB — Empowering Students, Transforming Bishwambarpur" },
      {
        property: "og:description",
        content:
          "Non-profit association of 300+ public university students working for Bishwambarpur Upazila.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [
      { rel: "canonical", href: "/" },
      // Start a hero download with the document rather than after React
      // mounts — it is the largest contentful paint on this page. This is the
      // bundled slide, which only leads when no dashboard hero is set; when
      // one is, it still gets fetched a moment later as a following slide.
      { rel: "preload", as: "image", href: homeHero1, fetchpriority: "high" },
    ],
  }),
  component: Index,
});

// `slug` links each focus area to its program page — the detail panel pulls
// that page's hero photo from the dashboard, so images are managed there.
const ACTIVITIES = [
  {
    Icon: HeartHandshake,
    title: "Student Unity & Cooperation",
    desc: "To foster cooperation among students from public universities, government medical colleges, and engineering colleges in Bangladesh who are permanent residents of Bishwambarpur Upazila.",
    slug: "reunion",
  },
  {
    Icon: Award,
    title: "Achievement Recognition",
    desc: "Honor students who bring pride to the region through merit.",
    slug: "felicitation",
  },
  {
    Icon: Megaphone,
    title: "Educational Campaigns",
    desc: "Awareness drives, study circles and career talks across schools of the upazila.",
    slug: "schooling",
  },
  {
    Icon: GraduationCap,
    title: "Admission Support",
    desc: "Mentoring aspirants through SSC, HSC, admission tests and university application.",
    // The online-events page has no hero photo yet; schooling covers the same
    // mentoring work visually. Swap back to "online" once it has one.
    slug: "schooling",
  },
  {
    Icon: BookOpen,
    title: "PUSAB Scholarship",
    desc: "Provide financial aid to deserving students from underserved families. PUSAB also arrenges Scholarship Exam for the student of class VIII, IX and X.",
    slug: "scholarship",
  },
  {
    Icon: Stethoscope,
    title: "Medical Camps & Humanity",
    desc: "Free health camps, disaster relief and humanitarian aid for the community.",
    slug: "humanity",
  },
];

function MagazineTilt({ image, alt }: { image: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [r, setR] = useState({ x: 0, y: 0 });
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        setR({ x: -py * 16, y: px * 16 });
      }}
      onMouseLeave={() => setR({ x: 0, y: 0 })}
      style={{ perspective: "1200px" }}
      className="relative aspect-[3/4] w-full max-w-sm mx-auto"
    >
      <motion.div
        animate={{ rotateX: r.x, rotateY: r.y }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
        style={{ transformStyle: "preserve-3d" }}
        className="absolute inset-0 rounded-3xl overflow-hidden border border-white/10 shadow-[0_30px_80px_-20px_rgba(124,58,237,0.45)]"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={image}
            src={image}
            alt={alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl" />
      </motion.div>
    </div>
  );
}

function MagazinePreview({
  onHoverChange,
}: {
  onHoverChange: (issue: (typeof SAYOR_ISSUES)[number] | null) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {SAYOR_ISSUES.map((issue) => (
        <Link
          key={issue.id}
          to="/sayor"
          search={{ issue: issue.id }}
          onMouseEnter={() => onHoverChange(issue)}
          onMouseLeave={() => onHoverChange(null)}
          aria-label={`Open ${issue.title}`}
          className="group relative h-28 w-[5.5rem] shrink-0 overflow-hidden rounded-lg border border-white/15 shadow-[0_10px_28px_-12px_rgba(2,6,23,0.6)] transition-transform duration-200 hover:-translate-y-1.5 hover:border-white/40"
        >
          <img src={issue.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/10" />
        </Link>
      ))}
    </div>
  );
}

function SayorSection() {
  const [hovered, setHovered] = useState<(typeof SAYOR_ISSUES)[number] | null>(null);
  const preview = hovered ?? { image: sayorHome, title: "SAYOR — the annual magazine of PUSAB" };

  return (
    <section className="py-28 md:py-32 relative overflow-hidden bg-[var(--color-surface-2)]">
      <div className="absolute -left-32 top-1/3 h-[40vh] w-[40vh] rounded-full bg-[var(--color-accent-2)] opacity-10 blur-[120px]" />
      <div className="container-page relative">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-16 items-center">
          <div>
            <p className="text-label mb-3">Annual Magazine</p>
            <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight">
              <span className="gradient-text">SAYOR</span>- thoughts of years.
            </h2>
            <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
              SAYOR is PUSAB's flagship annual magazine, bringing together voices from education,
              culture, science, heritage, literature and student life across Bishwambarpur.
            </p>
            <Link
              to="/sayor"
              className="mt-8 inline-flex items-center gap-2 text-[var(--color-accent-1)] font-semibold hover:gap-3 transition-all"
            >
              Read more <ArrowRight size={16} />
            </Link>
          </div>
          <MagazineTilt image={preview.image} alt={preview.title} />
        </div>

        <div className="mt-14">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground mb-5">
            Hover a cover to preview · click to read
          </p>
          <MagazinePreview onHoverChange={setHovered} />
        </div>
      </div>
    </section>
  );
}

function Index() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const hero = usePageHero("home");
  // While the scholarship exam is open, the hero leads with it.
  const examPromo = useExamPromo();
  const heroImageUrls = hero.images.map((img) => img.image_url).join("|");
  // Dashboard images lead, then the bundled slides — so the carousel keeps
  // rotating even when only one hero has been uploaded.
  // Keep the same array reference across re-renders when the underlying
  // images haven't changed, so HeroSlideshow's index-reset effect doesn't
  // fire on every render and stomp on prev/next clicks.
  const slides = useMemo(
    () => (heroImageUrls ? [...heroImageUrls.split("|"), ...HERO_SLIDES] : HERO_SLIDES),
    [heroImageUrls],
  );

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    settingsApi
      .get()
      .then(setSettings)
      .catch(() => setSettings(null));
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
        <HeroSlideshow slides={slides} />
        <div className="container-page relative z-10 pt-40 pb-28 md:pt-32">
          <div className="mx-auto max-w-4xl text-center [text-shadow:0_2px_8px_rgba(2,6,23,0.55)]">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto w-fit"
            >
              {examPromo ? (
                <ExamHeroPill promo={examPromo} />
              ) : (
              <div className="formal-pill flex items-center gap-2.5 text-xs font-medium text-white/90">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-accent-1)] opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-accent-1)]" />
                </span>
                <span className="tracking-wide">
                  Student-led · Non-political · Community-focused
                </span>
              </div>
              )}
            </motion.div>

            <div className="mt-7">
              {hero.title ? (
                <AnimatedHeading
                  as="h1"
                  className="font-display text-[44px] leading-[1.1] sm:text-6xl md:text-7xl lg:text-[80px] font-extrabold tracking-[-0.045em] text-white"
                >
                  {hero.title}
                </AnimatedHeading>
              ) : (
                <>
                  <AnimatedHeading
                    as="h1"
                    className="font-display text-[44px] leading-[1.1] sm:text-6xl md:text-7xl lg:text-[80px] font-extrabold tracking-[-0.045em] text-white"
                  >
                    Building a stronger
                  </AnimatedHeading>
                  <motion.span
                    initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay: 0.55, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="block font-display text-[44px] leading-[1.02] sm:text-6xl md:text-7xl lg:text-[80px] font-extrabold tracking-[-0.045em] text-white/90"
                  >
                    future for Bishwambarpur<span className="text-[var(--color-accent-2)]">.</span>
                  </motion.span>
                </>
              )}
            </div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.7 }}
              className="mt-7 mx-auto max-w-xl text-base md:text-lg text-white/85 leading-relaxed"
            >
              {hero.lede ??
                `PUSAB brings together ${SITE.members} students from public universities, medical and engineering colleges to support learning, leadership, and community development in Bishwambarpur.`}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.05, duration: 0.7 }}
              className="mt-9 flex flex-wrap items-center justify-center gap-3"
            >
              {examPromo ? (
                <>
                  <ExamHeroButton promo={examPromo} />
                  <GradientButton
                    to="/programs"
                    variant="ghost"
                    className="h-[50px] w-full justify-center text-[15px]! text-white! border-white/45! bg-white/5 backdrop-blur-sm hover:bg-white/15! hover:border-white/70! sm:h-[52px] sm:w-auto"
                  >
                    Explore Our Programs
                  </GradientButton>
                </>
              ) : (
                <>
                  <GradientButton to="/programs">Explore Our Programs</GradientButton>
                  <GradientButton
                    to="/about"
                    variant="ghost"
                    className="text-white! border-white/45! bg-white/5 backdrop-blur-sm hover:bg-white/15! hover:border-white/70!"
                  >
                    About PUSAB{" "}
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </GradientButton>
                </>
              )}
            </motion.div>

            {examPromo ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.7 }}
                className="mt-10 md:mt-[26px]"
              >
                <ExamHeroCard promo={examPromo} />
              </motion.div>
            ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.25, duration: 0.7 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.22em] text-white/65"
            >
              <span>Est. {SITE.founded.slice(-4)}</span>
              <span className="hidden sm:inline text-white/30">/</span>
              <span>{SITE.members} Members</span>
              <span className="hidden sm:inline text-white/30">/</span>
              <span>Bishwambarpur · Sunamganj</span>
            </motion.div>
            )}
          </div>
        </div>

        {/* Scroll cue. Sits higher on small screens so it clears the
            slideshow dots, which are centred there before moving right at md. */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-14 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 md:bottom-8"
        >
          <ChevronDown className="animate-float-bounce text-white/70" size={18} />
          <div className="h-12 w-px bg-gradient-to-b from-white/50 to-transparent" />
        </motion.div>

        <style>{`
          .formal-pill {
            padding: 8px 14px;
            border-radius: 9999px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.12);
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 8px 24px rgba(15, 23, 42, 0.16);
            backdrop-filter: blur(8px);
          }
        `}</style>
      </section>

      {examPromo && <ExamStepsSection promo={examPromo} />}
      {examPromo && <ExamMobileBar promo={examPromo} />}

      {/* STATS */}
      <section className="border-y border-border bg-[var(--color-surface-2)]">
        <div className="container-page grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
          {buildStats(settings).map((s, i) => (
            <div key={i} className="px-6 py-12 text-center">
              <StatCounter value={s.value} suffix={s.suffix} raw={s.raw} text={s.text} />
              <div className="mt-2 text-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <AboutPreview />

      <LeadershipPreview />

      <Timeline />

      {/* ACTIVITIES */}
      <section className="py-28 md:py-32">
        <div className="container-page">
          <div className="flex items-end justify-between gap-6 flex-wrap mb-16">
            <div>
              <p className="text-label mb-3">Our areas of work</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight max-w-xl">
                Programs That Create <span className="gradient-text">Real Impact</span>
              </h2>
            </div>
            <Link
              to="/programs"
              className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              View all programs{" "}
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <ActivitiesBento activities={ACTIVITIES} />
        </div>
      </section>

      <UpcomingPrograms />

      <MomentsPreview />

      {/* SAYOR */}
      <SayorSection />

      <LatestNews />

      <TestimonialsCarousel />

      {/* QUOTE */}
      <section className="py-28 md:py-32 relative bg-[var(--color-surface)]">
        <div className="container-page relative text-center max-w-4xl">
          <Quote
            className="absolute -top-6 left-1/2 -translate-x-1/2 text-[var(--color-surface-2)]"
            size={180}
            strokeWidth={1}
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative font-display text-3xl md:text-5xl font-semibold leading-tight tracking-tight"
          >
            "Our mission is to support every student who dares to dream beyond Bishwambarpur."
          </motion.p>
          <p className="mt-8 text-label">— PUSAB Executive Committee</p>
        </div>
      </section>

      <LocationMap />

      {/* CTA */}
      <section className="py-24 md:py-28 bg-[var(--color-surface-2)]">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-[var(--color-surface)] p-12 md:p-16 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(79,110,247,0.18),transparent_50%),radial-gradient(circle_at_70%_70%,rgba(124,58,237,0.14),transparent_50%)]" />
            <div className="relative">
              <h3 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
                Join the Movement
              </h3>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                Whether you are a current student, alumnus, or supporter, your involvement helps
                build a stronger future for Bishwambarpur.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <GradientButton to="/contact">Contact Us</GradientButton>
                <GradientButton to="/leadership" variant="ghost">
                  Meet the Executive Committee
                </GradientButton>
                <GradientButton href={SITE.facebook} target="_blank" variant="ghost">
                  <Facebook size={16} /> Join our Facebook Community
                </GradientButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function HeroSlideshow({ slides }: { slides: string[] }) {
  const [i, setI] = useState(0);
  // Reset to the first slide if the slide list itself changes (e.g. once the
  // dashboard-managed images finish loading in).
  useEffect(() => setI(0), [slides]);
  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => setI((v) => (v + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [slides.length]);
  const prev = () => setI((v) => (v - 1 + slides.length) % slides.length);
  const next = () => setI((v) => (v + 1) % slides.length);
  return (
    <>
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence>
          <motion.img
            key={i}
            src={slides[i]}
            alt=""
            // The hero is the largest paint above the fold, so it must not wait
            // on lazy-loading or on the decode queue behind other images.
            fetchPriority={i === 0 ? "high" : "auto"}
            loading="eager"
            decoding="async"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 1.1, ease: "easeOut" },
              scale: { duration: 7, ease: "linear" },
            }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Warm the next slide while the current one is showing, so the
            crossfade never lands on a half-loaded image. */}
        {slides.length > 1 && (
          <img
            src={slides[(i + 1) % slides.length]}
            alt=""
            aria-hidden
            loading="eager"
            decoding="async"
            className="pointer-events-none absolute h-px w-px opacity-0"
          />
        )}
        {/* Cinematic scrim — darkens just enough for crisp white text, lets the photo read elsewhere. */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/25 via-slate-950/35 to-slate-950/70" />
        {/* Center focus + faint brand tint. */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(2,6,23,0.22),transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(124,58,237,0.14),transparent_55%)]" />
      </div>

      {/* Rendered outside the z-0 image layer so its own stacking context
          can't cap these above the z-10 hero content wrapper. */}
      {slides.length > 1 && (
        <>
          {/* Prev / next arrows */}
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 z-30 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:border-white/35 md:left-6 md:h-12 md:w-12"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 z-30 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:border-white/35 md:right-6 md:h-12 md:w-12"
          >
            <ChevronRight size={20} />
          </button>

          {/* Sits clear of the centred scroll cue, which shares this corner. */}
          <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5 md:bottom-8 md:left-auto md:right-8 md:translate-x-0">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-1 rounded-full transition-all ${idx === i ? "w-10 bg-[var(--color-accent-1)]" : "w-5 bg-foreground/30 hover:bg-foreground/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
