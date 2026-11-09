import type { ReactNode } from "react";
import { ApiError, type ExamApplication, type ExamStatus } from "@/lib/api";
import { STATUS_LABELS, serialLabel, toBn } from "@/lib/exam";

export const errMessage = (err: unknown) =>
  err instanceof ApiError ? err.message : "কিছু একটা ভুল হয়েছে — আবার চেষ্টা করুন।";

export function ExamPageTitle({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end gap-3.5">
      <div className="flex flex-col gap-1">
        <span className="text-sm text-[#64748B]">মেধাবৃত্তি পরীক্ষা</span>
        <h1 className="text-[28px] font-bold leading-tight text-[#0F172A]">{title}</h1>
      </div>
      {actions && <div className="ml-auto flex flex-wrap gap-2.5">{actions}</div>}
    </div>
  );
}

export const btnPrimary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0284C7] px-4 text-[15px] font-bold text-white transition-colors hover:bg-[#0369A1] disabled:opacity-60";
export const btnOutline =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-4 text-[15px] font-semibold text-[#0F172A] transition-colors hover:border-[#94A3B8] disabled:opacity-60";
export const selectCls =
  "h-11 rounded-xl border border-[#CBD5E1] bg-white px-2.5 text-sm text-[#0F172A] outline-none focus:border-[#0284C7]";

export function StatusPill({ status, flagged }: { status: ExamStatus; flagged?: boolean }) {
  if (flagged) {
    return <span className="whitespace-nowrap rounded-full bg-[#FEE2E2] px-2.5 py-[3px] text-xs font-bold text-[#991B1B]">TrxID মিলেনি?</span>;
  }
  const cls =
    status === "verified"
      ? "bg-[#DCFCE7] text-[#14532D]"
      : status === "rejected"
        ? "bg-[#FEE2E2] text-[#991B1B]"
        : "bg-[#FEF3C7] text-[#78350F]";
  return <span className={"whitespace-nowrap rounded-full px-2.5 py-[3px] text-xs font-bold " + cls}>{STATUS_LABELS[status]}</span>;
}

export function Switch({
  checked,
  onChange,
  label,
  hint,
  busy,
  last,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint: string;
  busy?: boolean;
  last?: boolean;
}) {
  return (
    <label className={"flex cursor-pointer items-center justify-between gap-3 py-3 " + (last ? "" : "border-b border-[#F1F5F9]")}>
      <span className="flex flex-col">
        <strong className="text-[15px] text-[#0F172A]">{label}</strong>
        <span className="text-[13px] text-[#64748B]">{hint}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={busy}
        onClick={() => onChange(!checked)}
        className={
          "relative h-6 w-11 flex-none rounded-full transition-colors disabled:opacity-60 " +
          (checked ? "bg-[#0284C7]" : "bg-[#CBD5E1]")
        }
      >
        <span
          className={
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform " +
            (checked ? "translate-x-[22px]" : "translate-x-0.5")
          }
        />
      </button>
    </label>
  );
}

/** TrxIDs that appear on more than one application. The API already
 *  refuses a repeat within one wallet, so this catches the same TrxID
 *  entered again under a different wallet — worth a second look. */
export function duplicateTrxIds(apps: ExamApplication[]): Set<string> {
  const seen = new Map<string, number>();
  for (const a of apps) {
    if (a.trx_id) seen.set(a.trx_id, (seen.get(a.trx_id) ?? 0) + 1);
  }
  return new Set([...seen].filter(([, n]) => n > 1).map(([k]) => k));
}

/** Download applications as a CSV that Excel opens with Bengali intact. */
export function downloadCsv(apps: ExamApplication[], filename: string) {
  const header = [
    "আবেদন নম্বর", "নাম (বাংলা)", "Name (English)", "মাতার নাম", "পিতার নাম", "মোবাইল",
    "শ্রেণি", "শিক্ষা প্রতিষ্ঠান", "গ্রাম", "ইউনিয়ন", "কেন্দ্র", "পেমেন্ট", "পাঠানো নম্বর",
    "Transaction ID", "টাকা", "অবস্থা", "ক্রমিক", "রোল", "নোট", "আবেদনের সময়", "ছবি",
  ];
  const rows = apps.map((a) => [
    a.application_no, a.name_bn, a.name_en, a.mother_name, a.father_name, a.phone,
    a.class_label, a.institution, a.village, a.union, a.center_name, a.payment_label,
    a.sender_number, a.trx_id, a.amount, STATUS_LABELS[a.status], serialLabel(a.serial_no, a.exam_year),
    a.roll_no ?? "", a.note, new Date(a.created_at).toLocaleString("en-GB"), a.photo_url,
  ]);
  const esc = (v: unknown) => {
    const s = String(v ?? "");
    // Keep phone numbers / IDs as text so Excel doesn't drop the leading 0.
    const text = /^0\d+$/.test(s) ? `="${s}"` : s;
    return /[",\n]/.test(text) && !text.startsWith('="') ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const csv = "﻿" + [header, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const taka = (n: number) => `৳${toBn(n)}`;
