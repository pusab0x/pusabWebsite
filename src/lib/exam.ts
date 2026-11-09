// Shared helpers for the scholarship exam pages: Bengali number/date
// formatting, labels, static exam content and the cached config query.

import { useQuery } from "@tanstack/react-query";
import {
  examApi,
  type ExamClassLevel,
  type ExamConfig,
  type ExamPaymentMethod,
  type ExamStatus,
} from "@/lib/api";

export const EXAM_PATH = "/scholarship-exam";
export const EXAM_STATUS_PATH = "/scholarship-exam/status";

/** Cached exam config — shared by the navbar, homepage and exam pages. */
export function useExamConfig() {
  return useQuery<ExamConfig>({
    queryKey: ["exam", "config"],
    queryFn: () => examApi.config(),
    staleTime: 5 * 60 * 1000,
  });
}

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

export function toBn(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}

/** Bengali → ASCII digits, then strip everything but digits (keeps 01XXXXXXXXX). */
export function normalizePhone(value: string): string {
  let digits = value.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d))).replace(/\D/g, "");
  if (digits.length === 13 && digits.startsWith("88")) digits = digits.slice(2);
  return digits;
}

export const isValidPhone = (value: string) => /^01[3-9]\d{8}$/.test(normalizePhone(value));

/** 01765597615 → 01765-597615 */
export function formatPhone(phone: string): string {
  const d = normalizePhone(phone);
  return d.length === 11 ? `${d.slice(0, 5)}-${d.slice(5)}` : phone;
}

const MONTHS = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];
const MONTHS_SHORT = [
  "জানু.", "ফেব্রু.", "মার্চ", "এপ্রি.", "মে", "জুন",
  "জুলাই", "আগ.", "সেপ্টে.", "অক্টো.", "নভে.", "ডিসে.",
];
const WEEKDAYS = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];

function parseDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return y && m && d ? new Date(y, m - 1, d) : null;
}

/** Bengali day ordinal: ১লা, ২রা, ৪ঠা, ৫ই … ১৯শে … */
function dayOrdinal(day: number): string {
  const suffix =
    day === 1 ? "লা" : day <= 3 ? "রা" : day === 4 ? "ঠা" : day <= 18 ? "ই" : "শে";
  return toBn(day) + suffix;
}

/** "২৬ ডিসেম্বর" */
export function bnDate(iso: string | null | undefined): string {
  const d = parseDate(iso);
  return d ? `${toBn(d.getDate())} ${MONTHS[d.getMonth()]}` : "";
}

/** "২৬ ডিসে." */
export function bnDateShort(iso: string | null | undefined): string {
  const d = parseDate(iso);
  return d ? `${toBn(d.getDate())} ${MONTHS_SHORT[d.getMonth()]}` : "";
}

/** "২৬শে ডিসেম্বর, ২০২৫" (+ " খ্রিষ্টাব্দ" when `era`) */
export function bnDateLong(iso: string | null | undefined, era = false): string {
  const d = parseDate(iso);
  if (!d) return "";
  return `${dayOrdinal(d.getDate())} ${MONTHS[d.getMonth()]}, ${toBn(d.getFullYear())}${era ? " খ্রিষ্টাব্দ" : ""}`;
}

/** "শুক্রবার" */
export function bnWeekday(iso: string | null | undefined): string {
  const d = parseDate(iso);
  return d ? WEEKDAYS[d.getDay()] : "";
}

/** "সকাল ১০.০০ টা" → "সকাল ১০টা" for tight spots. */
export function shortTime(time: string): string {
  return time.replace(/([০-৯]+)\.০০\s*টা/, "$1টা");
}

export const CLASS_OPTIONS: { value: ExamClassLevel; label: string }[] = [
  { value: 8, label: "অষ্টম" },
  { value: 9, label: "নবম" },
  { value: 10, label: "দশম" },
];

export const classLabel = (c: number) => CLASS_OPTIONS.find((o) => o.value === c)?.label ?? "";

export const PAYMENT_LABELS: Record<ExamPaymentMethod, string> = {
  bkash: "বিকাশ",
  nagad: "নগদ",
  rocket: "রকেট",
  offline: "অফলাইন",
};

export const STATUS_LABELS: Record<ExamStatus, string> = {
  pending: "যাচাই বাকি",
  verified: "যাচাই সম্পন্ন",
  rejected: "বাতিল",
};

export function paymentNumber(config: ExamConfig, method: ExamPaymentMethod): string {
  if (method === "bkash") return config.bkash_number;
  if (method === "nagad") return config.nagad_number;
  if (method === "rocket") return config.rocket_number;
  return "";
}

/** Unions of Bishwambarpur Upazila, Sunamganj. */
export const UNIONS = ["পলাশ", "সলুকাবাদ", "ধনপুর", "বাদাঘাট (দক্ষিণ)", "ফতেপুর"];

export const MARKS = [
  { subject: "বাংলা (১ম ও ২য় পত্র)", marks: 25 },
  { subject: "গণিত", marks: 25 },
  { subject: "ইংরেজি (১ম ও ২য় পত্র)", marks: 25 },
  { subject: "সাধারণ বিজ্ঞান, আইসিটি ও সাধারণ জ্ঞান", marks: 25 },
];

export const EXAM_APPLY_START = "১৫ই নভেম্বর ২০২৬";

export const INSTRUCTIONS = [
  "পরীক্ষা হবে এমসিকিউ পদ্ধতিতে; ভুল উত্তরের জন্য নম্বর কাটা হবে না।",
  "প্রশ্ন সংশ্লিষ্ট শ্রেণির পাঠ্যপুস্তক থেকে।",
  "পরীক্ষার সময় ১ ঘণ্টা ৩০ মিনিট; ৩০ মিনিট আগে উপস্থিত থাকতে হবে।",
  "প্রবেশপত্র ও সাধারণ ক্যালকুলেটর সঙ্গে আনতে হবে।",
  `অনলাইন আবেদন শুরু ${EXAM_APPLY_START} থেকে।`,
  "ফলাফল পুসাবের অফিসিয়াল ওয়েবসাইট ও ফেসবুক পেজে প্রকাশ করা হবে।",
];

/** Drop English letters from a field that must be written in Bengali. */
export const stripLatin = (v: string) => v.replace(/[A-Za-z]/g, "");
export const isBengaliText = (v: string) => /[\u0980-\u09FF]/.test(v) && !/[A-Za-z]/.test(v);

export const ORG_NAME_BN = "পাবলিক ইউনিভার্সিটি স্টুডেন্টস অ্যাসোসিয়েশন অব বিশ্বম্ভরপুর (পুসাব)";

/** "৮ম পুসাব মেধাবৃত্তি পরীক্ষা- ২০২৫" → "৮ম পুসাব মেধাবৃত্তি পরীক্ষা- ২০২৫ খ্রিষ্টাব্দ" */
export const titleWithEra = (title: string) =>
  title.includes("খ্রিষ্টাব্দ") ? title : `${title} খ্রিষ্টাব্দ`;

/** Zero-padded serial. English digits: Bengali ones are hard to read at admit-card size. */
export const serialLabel = (n: number | null | undefined) =>
  n == null ? "" : String(n).padStart(3, "0");

// The last application submitted on this device, so a returning student
// lands straight on their status/admit card without retyping.
const LAST_KEY = "pusab:exam:last";

export function rememberApplication(application_no: string, phone: string) {
  try {
    localStorage.setItem(LAST_KEY, JSON.stringify({ application_no, phone }));
  } catch {
    /* storage unavailable */
  }
}

export function recallApplication(): { application_no: string; phone: string } | null {
  try {
    const raw = localStorage.getItem(LAST_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
