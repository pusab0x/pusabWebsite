import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { ExamConfig } from "@/lib/api";
import {
  EXAM_ADMIT_START,
  EXAM_APPLY_START,
  EXAM_PATH,
  EXAM_STATUS_PATH,
  bnDate,
  bnDateShort,
  bnWeekday,
  shortTime,
  toBn,
  useExamConfig,
} from "@/lib/exam";

/** What the homepage should promote right now, if anything. */
export type ExamPromo = { config: ExamConfig; mode: "apply" | "admit" };

export function useExamPromo(): ExamPromo | null {
  const { data: config } = useExamConfig();
  if (!config?.show_home_banner) return null;
  if (config.accepting) return { config, mode: "apply" };
  if (config.admit_download_open) return { config, mode: "admit" };
  return null;
}

const examYear = (c: ExamConfig) => toBn(c.year);
const deadlineText = (c: ExamConfig) => (c.deadline ? bnDate(c.deadline) : "ঘোষণা হবে");

export const ANNOUNCEMENT_BAR_H = 44;

/** Thin sky-blue strip above the navbar on the homepage. */
export function ExamAnnouncementBar({ promo }: { promo: ExamPromo }) {
  const { config, mode } = promo;
  const to = mode === "apply" ? EXAM_PATH : EXAM_STATUS_PATH;
  const message = (
    <>
      <strong>{config.title}</strong> —{" "}
      {mode === "apply"
        ? `অনলাইন আবেদন শুরু ${EXAM_APPLY_START}, শেষ তারিখ ${deadlineText(config)} · প্রবেশপত্র ডাউনলোড ${EXAM_ADMIT_START} থেকে`
        : "প্রবেশপত্র ডাউনলোড চলছে"}
    </>
  );
  return (
    <Link
      to={to}
      className="exam-ui flex h-11 items-center justify-center gap-2 overflow-hidden bg-[#0284C7] px-3.5 text-sm leading-tight text-white hover:text-white sm:gap-3.5 sm:px-5 sm:text-[15px]"
    >
      <span className="font-inter flex-none rounded-full bg-white px-2 py-0.5 text-[10px] font-bold tracking-[.08em] text-[#0369A1] sm:px-2.5 sm:text-[11px]">
        NEW
      </span>
      <span className="min-w-0 flex-1 overflow-hidden">
        <span className="exam-marquee">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="pr-12" aria-hidden={i > 0 || undefined}>{message}</span>
          ))}
        </span>
      </span>
      <strong className="flex-none underline underline-offset-[3px]">
        <span className="sm:hidden">{mode === "apply" ? "আবেদন →" : "দেখুন →"}</span>
        <span className="hidden sm:inline">{mode === "apply" ? "এখনই আবেদন করুন →" : "প্রবেশপত্র নিন →"}</span>
      </strong>
    </Link>
  );
}

/** Navbar button (desktop) — replaces "Contribute" on the homepage. */
export function ExamNavButton({ promo }: { promo: ExamPromo }) {
  return (
    <Link
      to={promo.mode === "apply" ? EXAM_PATH : EXAM_STATUS_PATH}
      className="exam-ui inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full border-[1.5px] border-[#03A9EC] px-3.5 text-[15px] font-bold text-[#0369A1] transition-colors hover:bg-[#E6F6FD]"
    >
      <span className="h-[7px] w-[7px] rounded-full bg-[#16A34A]" />
      {promo.mode === "apply" ? "পরীক্ষায় আবেদন" : "প্রবেশপত্র"}
    </Link>
  );
}

/** Pill above the hero heading. */
export function ExamHeroPill({ promo }: { promo: ExamPromo }) {
  return (
    <Link
      to={promo.mode === "apply" ? EXAM_PATH : EXAM_STATUS_PATH}
      className="exam-ui inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 py-[5px] pl-[5px] pr-3 text-[13px] text-white [text-shadow:none] hover:text-white sm:gap-2.5 sm:py-1.5 sm:pl-1.5 sm:pr-2 sm:text-[15px]"
    >
      <span className="font-inter hidden rounded-full bg-[#03A9EC] px-2 py-0.5 text-[11px] font-bold sm:inline sm:px-2.5 sm:text-xs">
        {examYear(promo.config)}
      </span>
      <span>
        {promo.mode === "apply" ? (
          <>
            <span className="pl-2 sm:hidden">{promo.config.title}</span>
            <span className="hidden sm:inline">মেধাবৃত্তি পরীক্ষার অনলাইন আবেদন শুরু {EXAM_APPLY_START}</span>
          </>
        ) : (
          "মেধাবৃত্তি পরীক্ষার প্রবেশপত্র ডাউনলোড চলছে"
        )}
      </span>
      <span aria-hidden="true" className="sm:pr-1.5">→</span>
    </Link>
  );
}

/** Primary hero CTA. */
export function ExamHeroButton({ promo }: { promo: ExamPromo }) {
  return (
    <Link
      to={promo.mode === "apply" ? EXAM_PATH : EXAM_STATUS_PATH}
      className="exam-ui inline-flex h-[54px] w-full items-center justify-center gap-2 rounded-full bg-[#03A9EC] px-[26px] text-[17px] font-bold text-white shadow-[0_14px_30px_-14px_rgba(3,169,236,0.8)] transition-colors [text-shadow:none] hover:bg-[#0284C7] hover:text-white sm:h-[52px] sm:w-auto"
    >
      {promo.mode === "apply" ? "মেধাবৃত্তি পরীক্ষায় আবেদন করুন →" : "প্রবেশপত্র ডাউনলোড করুন →"}
    </Link>
  );
}

/** White summary card under the hero buttons. */
export function ExamHeroCard({ promo }: { promo: ExamPromo }) {
  const { config, mode } = promo;
  const date = config.exam_date;
  const primary =
    mode === "apply" ? (
      <Link to={EXAM_PATH} className="flex h-12 items-center justify-center rounded-full bg-[#0284C7] text-base font-bold text-white hover:bg-[#0369A1] hover:text-white sm:h-[46px]">
        আবেদন করুন
      </Link>
    ) : null;

  return (
    <div className="exam-ui w-full text-left text-[#0F172A] [text-shadow:none]">
      {/* Laptop */}
      <div className="mx-auto hidden w-full max-w-[980px] flex-wrap items-stretch overflow-hidden rounded-[22px] bg-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)] md:flex">
        <Cell label="পরীক্ষা" value={config.short_title} sub="অষ্টম · নবম · দশম শ্রেণি" className="flex-[1_1_200px]" />
        <Cell label="তারিখ" value={`${bnDate(date)}, ${bnWeekday(date)}`} sub={config.exam_time} className="flex-[1_1_180px]" />
        <Cell label="আবেদন ফি" value={`${toBn(config.fee)} টাকা`} sub="বিকাশ / নগদ / রকেট" className="flex-[1_1_140px]" />
        <div className="flex flex-[1_1_220px] flex-col justify-center gap-2 bg-[#F0FAFE] p-4">
          {primary}
          <Link to={EXAM_STATUS_PATH} className="text-center text-sm font-semibold text-[#0284C7] hover:text-[#0369A1]">
            প্রবেশপত্র ডাউনলোড
          </Link>
        </div>
      </div>

      {/* Mobile */}
      <div className="overflow-hidden rounded-[20px] border border-[#E2E8F0] bg-white shadow-[0_24px_40px_-28px_rgba(15,23,42,0.5)] md:hidden">
        <div className="flex flex-col gap-1 border-b border-[#E2E8F0] p-[18px]">
          <span className="font-inter text-[11px] font-bold tracking-[.14em] text-[#0284C7]">SCHOLARSHIP EXAM {config.year}</span>
          <strong className="text-[19px]">{config.title}</strong>
          <span className="text-sm text-[#475569]">অষ্টম · নবম · দশম শ্রেণি</span>
        </div>
        <div className="grid grid-cols-2">
          <div className="flex flex-col border-r border-[#E2E8F0] px-[18px] py-3.5">
            <span className="text-xs text-[#64748B]">তারিখ</span>
            <strong className="text-[15px]">{bnDateShort(date)}, {bnWeekday(date)}</strong>
            <span className="text-xs text-[#475569]">{shortTime(config.exam_time)}</span>
          </div>
          <div className="flex flex-col px-[18px] py-3.5">
            <span className="text-xs text-[#64748B]">আবেদন ফি</span>
            <strong className="text-[15px]">{toBn(config.fee)} টাকা</strong>
            <span className="text-xs text-[#475569]">শেষ: {deadlineText(config)}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 bg-[#F0FAFE] px-[18px] pb-[18px] pt-3.5">
          {primary}
          <Link to={EXAM_STATUS_PATH} className="p-1.5 text-center text-sm font-semibold text-[#0284C7]">
            প্রবেশপত্র / আবেদনের অবস্থা দেখুন
          </Link>
        </div>
      </div>

      {mode === "apply" && (
        <p className="mx-auto mt-3 w-fit max-w-full rounded-2xl bg-black/45 px-4 py-2 text-center text-sm font-semibold text-white md:text-[15px]">
          প্রবেশপত্র {EXAM_ADMIT_START} থেকে ডাউনলোড করা যাবে
        </p>
      )}
    </div>
  );
}

function Cell({ label, value, sub, className }: { label: string; value: string; sub: string; className: string }) {
  return (
    <div className={"flex flex-col gap-0.5 border-r border-[#E2E8F0] px-6 py-5 " + className}>
      <span className="text-[13px] text-[#64748B]">{label}</span>
      <strong className="text-[17px]">{value}</strong>
      <span className="text-[13px] text-[#475569]">{sub}</span>
    </div>
  );
}

/** "৩ মিনিটে ঘরে বসেই আবেদন" — how online applying works. */
export function ExamStepsSection({ promo }: { promo: ExamPromo }) {
  const { config } = promo;
  const steps = [
    { title: "ফর্ম পূরণ", sub: "তথ্য ও ছবি দিন" },
    { title: `${toBn(config.fee)} টাকা ফি`, sub: "বিকাশ/নগদ/রকেটে" },
    { title: "প্রবেশপত্র", sub: `${EXAM_ADMIT_START} থেকে ডাউনলোড` },
  ];
  return (
    <section className="exam-ui bg-[#F5F7FA] text-[#0F172A]">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-8 px-6 py-14 md:py-[72px]">
        <div className="flex flex-[1_1_420px] flex-col gap-3">
          <span className="font-inter text-xs font-bold tracking-[.16em] text-[#0284C7]">SCHOLARSHIP EXAM {config.year}</span>
          <h2 className="text-[28px] font-bold leading-[1.3] md:text-[34px]">৩ মিনিটে ঘরে বসেই আবেদন</h2>
          <p className="text-[17px] leading-[1.7] text-[#475569]">
            আর স্কুল থেকে ফর্ম সংগ্রহ করতে হবে না। মোবাইল দিয়েই আবেদন, ফি পরিশোধ আর প্রবেশপত্র ডাউনলোড করা যাবে।
          </p>
          <Link to={promo.mode === "apply" ? EXAM_PATH : EXAM_STATUS_PATH} className="mt-1 self-start text-base font-bold text-[#0284C7] hover:text-[#0369A1]">
            {promo.mode === "apply" ? "আবেদন শুরু করুন →" : "প্রবেশপত্র নিন →"}
          </Link>
        </div>
        <ol className="m-0 grid w-full flex-[1_1_480px] list-none grid-cols-1 gap-3.5 p-0 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="flex flex-col gap-2 rounded-2xl border border-[#E2E8F0] bg-white p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E6F6FD] font-bold text-[#0369A1]">
                {toBn(i + 1)}
              </span>
              <strong className="text-[17px]">{s.title}</strong>
              <span className="text-sm text-[#475569]">{s.sub}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Mobile-only sticky bar once the hero card has scrolled away. */
export function ExamMobileBar({ promo }: { promo: ExamPromo }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const { config, mode } = promo;
  return (
    <div
      className={
        "exam-ui fixed inset-x-0 bottom-0 z-[95] flex items-center gap-2.5 border-t border-[#E2E8F0] bg-white/95 px-3 pb-4 pt-2.5 text-[#0F172A] backdrop-blur transition-transform duration-300 md:hidden " +
        (show ? "translate-y-0" : "translate-y-full")
      }
      aria-hidden={!show}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <strong className="text-sm leading-tight">{config.title}</strong>
        <span className="truncate text-xs text-[#475569]">
          {mode === "apply" ? `শেষ তারিখ: ${deadlineText(config)}` : "প্রবেশপত্র ডাউনলোড চলছে"}
        </span>
      </div>
      <Link
        to={mode === "apply" ? EXAM_PATH : EXAM_STATUS_PATH}
        tabIndex={show ? 0 : -1}
        className="inline-flex h-[46px] flex-none items-center rounded-full bg-[#0284C7] px-5 text-[15px] font-bold text-white hover:text-white"
      >
        {mode === "apply" ? "আবেদন করুন" : "প্রবেশপত্র"}
      </Link>
    </div>
  );
}
