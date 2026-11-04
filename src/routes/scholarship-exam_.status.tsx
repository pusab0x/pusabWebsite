import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { ApiError, examApi, type ExamApplicationStatus, type ExamConfig } from "@/lib/api";
import {
  EXAM_PATH,
  STATUS_LABELS,
  formatPhone,
  normalizePhone,
  recallApplication,
  rememberApplication,
  useExamConfig,
} from "@/lib/exam";
import {
  AdmitCardArticle,
  AdmitCardMobile,
  AdmitCardPrint,
  centerLabel,
  type AdmitData,
} from "@/components/exam/AdmitCards";
import { PrintArea, printArea } from "@/components/exam/print";

export const Route = createFileRoute("/scholarship-exam_/status")({
  validateSearch: (search: Record<string, unknown>): { new?: 1 } =>
    search.new ? { new: 1 } : {},
  head: () => ({
    meta: [
      { title: "আবেদনের অবস্থা ও প্রবেশপত্র — পুসাব মেধাবৃত্তি পরীক্ষা" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StatusPage,
});

function StatusPage() {
  const { new: justApplied } = Route.useSearch();
  const { data: config } = useExamConfig();
  const [creds, setCreds] = useState<{ application_no: string; phone: string } | null>(null);
  const [app, setApp] = useState<ExamApplicationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function lookup(application_no: string, phone: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await examApi.status(application_no, phone);
      setApp(res);
      setCreds({ application_no: res.application_no, phone });
      rememberApplication(res.application_no, phone);
    } catch (err) {
      setApp(null);
      setError(
        err instanceof ApiError && err.status === 404
          ? err.message
          : err instanceof ApiError && err.status === 429
            ? "অনেকবার চেষ্টা হয়েছে — কিছুক্ষণ পর আবার চেষ্টা করুন।"
            : "তথ্য আনা যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const saved = recallApplication();
    if (saved) lookup(saved.application_no, saved.phone);
    else setLoading(false);
  }, []);

  const showLookup = !app && !loading;

  return (
    <div className="exam-ui min-h-screen bg-[#F5F7FA] text-[#0F172A]">
      <div className="bg-[#0F172A] px-6 pb-[60px] pt-[96px] md:pb-[120px] md:pt-[112px]" />
      <div className="mx-auto -mt-10 max-w-[1180px] px-4 pb-16 md:-mt-[88px] md:px-6">
        {loading && !app ? (
          <div className="grid h-[320px] place-items-center rounded-[20px] border border-[#E2E8F0] bg-white">
            <Loader2 className="animate-spin text-[#0284C7]" size={28} />
          </div>
        ) : showLookup ? (
          <LookupForm onSubmit={lookup} error={error} initial={creds} />
        ) : app && config ? (
          <Result
            app={app}
            config={config}
            justApplied={!!justApplied}
            refreshing={loading}
            onRefresh={() => creds && lookup(creds.application_no, creds.phone)}
            onDownloaded={() => creds && examApi.status(creds.application_no, creds.phone, true).catch(() => {})}
            onSwitch={() => {
              setApp(null);
              setError(null);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

function LookupForm({
  onSubmit,
  error,
  initial,
}: {
  onSubmit: (no: string, phone: string) => void;
  error: string | null;
  initial: { application_no: string; phone: string } | null;
}) {
  const [no, setNo] = useState(initial?.application_no ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (no.trim() && phone.trim()) onSubmit(no.trim(), normalizePhone(phone));
  };
  return (
    <form onSubmit={submit} className="mx-auto flex max-w-[520px] flex-col gap-5 rounded-[20px] border border-[#E2E8F0] bg-white p-6 md:p-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[24px] font-bold md:text-[28px]">আবেদনের অবস্থা দেখুন</h1>
        <p className="text-[15px] leading-relaxed text-[#475569]">
          আবেদন নম্বর ও আবেদনে দেওয়া মোবাইল নম্বর লিখুন — পেমেন্ট যাচাইয়ের অবস্থা ও প্রবেশপত্র দেখতে পাবেন।
        </p>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-[15px] font-semibold">আবেদন নম্বর</span>
        <input value={no} onChange={(e) => setNo(e.target.value.toUpperCase())} placeholder="PUSAB-25-0001"
          className="exam-field font-inter uppercase" required />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-[15px] font-semibold">মোবাইল নম্বর</span>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" type="tel"
          inputMode="numeric" className="exam-field font-inter" required />
      </label>
      {error && (
        <p role="alert" className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[15px] text-[#B91C1C]">{error}</p>
      )}
      <button type="submit" className="h-[52px] rounded-full bg-[#0284C7] text-base font-bold text-white transition-colors hover:bg-[#0369A1]">
        অবস্থা দেখুন
      </button>
      <Link to={EXAM_PATH} className="text-center text-sm font-semibold text-[#0284C7]">
        এখনো আবেদন করেননি? আবেদন করুন →
      </Link>
    </form>
  );
}

function CheckBadge({ size = 60 }: { size?: number }) {
  return (
    <span className="flex flex-none items-center justify-center rounded-full bg-[#DCFCE7]" style={{ width: size, height: size }}>
      <svg width={size / 2} height={size / 2} viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2.5" aria-hidden="true">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}

function StatusPill({ status }: { status: ExamApplicationStatus["status"] }) {
  const cls =
    status === "verified"
      ? "bg-[#DCFCE7] text-[#14532D]"
      : status === "rejected"
        ? "bg-[#FEE2E2] text-[#991B1B]"
        : "bg-[#FEF3C7] text-[#78350F]";
  const label = status === "pending" ? "যাচাই চলছে" : STATUS_LABELS[status];
  return <span className={"rounded-full px-3 py-1 text-[13px] font-bold " + cls}>{label}</span>;
}

function Result({
  app,
  config,
  justApplied,
  refreshing,
  onRefresh,
  onDownloaded,
  onSwitch,
}: {
  app: ExamApplicationStatus;
  config: ExamConfig;
  justApplied: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onDownloaded: () => void;
  onSwitch: () => void;
}) {
  const admit: AdmitData = {
    name_bn: app.name_bn,
    photo_url: app.photo_url,
    class_label: app.class_label,
    serial_no: app.serial_no,
    roll_no: app.roll_no,
    centerLabel: centerLabel(app.center),
  };
  const verified = app.status === "verified";
  const rejected = app.status === "rejected";
  const canDownload = app.admit_available;

  const print = () => {
    onDownloaded();
    printArea();
  };

  const heading = rejected
    ? "আবেদন বাতিল হয়েছে"
    : verified
      ? "আবেদন নিশ্চিত হয়েছে"
      : justApplied
        ? "আবেদন জমা হয়েছে!"
        : "আপনার আবেদন যাচাই চলছে";

  const message = rejected
    ? app.note || "পেমেন্টের তথ্য মেলেনি। বিস্তারিত জানতে যোগাযোগ করুন।"
    : verified
      ? canDownload
        ? "আপনার পেমেন্ট যাচাই সম্পন্ন। প্রবেশপত্র ডাউনলোড করে প্রিন্ট করুন এবং পরীক্ষার দিন সঙ্গে আনুন।"
        : "আপনার পেমেন্ট যাচাই সম্পন্ন। রোল নম্বর দেওয়া হলে এখান থেকেই প্রবেশপত্র ডাউনলোড করা যাবে।"
      : "আপনার আবেদন নম্বর সংরক্ষণ করে রাখুন। পেমেন্ট যাচাইয়ের পর প্রবেশপত্র ডাউনলোড করা যাবে।";

  const contact = config.contacts[0];

  return (
    <>
      {/* ── Laptop ─────────────────────────────────────────── */}
      <div className="hidden flex-wrap items-start gap-6 md:flex">
        <section className="flex min-w-0 flex-[1_1_340px] flex-col gap-[18px] rounded-[20px] border border-[#E2E8F0] bg-white p-7">
          {rejected ? <RejectBadge /> : <CheckBadge />}
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[28px] font-bold">{heading}</h1>
            <p className="text-base leading-relaxed text-[#475569]">{message}</p>
          </div>
          <div className="flex flex-col rounded-[14px] border border-[#E2E8F0] text-[15px]">
            <div className="flex justify-between border-b border-[#F1F5F9] px-4 py-3">
              <span className="text-[#64748B]">আবেদন নম্বর</span>
              <strong className="font-inter">{app.application_no}</strong>
            </div>
            <div className="flex items-center justify-between border-b border-[#F1F5F9] px-4 py-3">
              <span className="text-[#64748B]">পেমেন্ট</span>
              <StatusPill status={app.status} />
            </div>
            <div className="flex justify-between px-4 py-3">
              <span className="text-[#64748B]">Transaction ID</span>
              <strong className="font-inter">{app.trx_id || "—"}</strong>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button type="button" onClick={print} disabled={!canDownload}
              className="h-[52px] flex-[1_1_160px] rounded-full bg-[#0284C7] text-base font-bold text-white transition-colors hover:bg-[#0369A1] disabled:bg-[#C9D8E6] disabled:text-[#475569]">
              PDF ডাউনলোড
            </button>
            <button type="button" onClick={print} disabled={!canDownload}
              className="h-[52px] flex-[1_1_120px] rounded-full border border-[#CBD5E1] bg-white text-base font-semibold transition-colors hover:border-[#94A3B8] disabled:opacity-50">
              প্রিন্ট
            </button>
          </div>
          <Footer refreshing={refreshing} onRefresh={onRefresh} onSwitch={onSwitch} contact={contact} />
        </section>
        <div className="min-w-0 flex-[2_1_560px]">
          <AdmitCardArticle data={admit} config={config} />
        </div>
      </div>

      {/* ── Mobile ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 md:hidden">
        <div className="flex flex-col items-center gap-2.5 rounded-[20px] bg-[#F5F7FA] px-2 pt-6 text-center">
          {rejected ? <RejectBadge size={64} /> : <CheckBadge size={64} />}
          <h1 className="text-[24px] font-bold">{heading}</h1>
          <p className="text-[15px] leading-relaxed text-[#475569]">{message}</p>
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#64748B]">আবেদন নম্বর</span>
            <strong className="font-inter text-lg">{app.application_no}</strong>
          </div>
          <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-3">
            <span className="text-sm text-[#64748B]">পেমেন্ট স্ট্যাটাস</span>
            <StatusPill status={app.status} />
          </div>
        </div>
        {!rejected && <AdmitCardMobile data={admit} config={config} />}
        <button type="button" onClick={print} disabled={!canDownload}
          className="h-[54px] rounded-full bg-[#0284C7] text-[17px] font-bold text-white disabled:bg-[#C9D8E6] disabled:text-[#475569]">
          প্রবেশপত্র ডাউনলোড (PDF)
        </button>
        {!canDownload && !rejected && (
          <span className="-mt-1.5 text-center text-[13px] text-[#64748B]">
            {verified ? "রোল নম্বর দেওয়া হলে বাটনটি চালু হবে।" : "পেমেন্ট যাচাই হলে বাটনটি চালু হবে।"}
          </span>
        )}
        <button type="button" onClick={onRefresh} disabled={refreshing}
          className="inline-flex h-[50px] items-center justify-center gap-2 rounded-full border border-[#CBD5E1] bg-white text-base font-semibold">
          {refreshing && <Loader2 size={16} className="animate-spin" />}
          আবেদনের অবস্থা দেখুন
        </button>
        <button type="button" onClick={onSwitch} className="text-sm font-semibold text-[#0284C7]">
          অন্য আবেদন নম্বর দিয়ে দেখুন
        </button>
      </div>

      {canDownload && (
        <PrintArea>
          <AdmitCardPrint data={admit} config={config} />
        </PrintArea>
      )}
    </>
  );
}

function RejectBadge({ size = 60 }: { size?: number }) {
  return (
    <span className="flex flex-none items-center justify-center rounded-full bg-[#FEE2E2]" style={{ width: size, height: size }}>
      <svg width={size / 2} height={size / 2} viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2.5" aria-hidden="true">
        <path d="M7 7l10 10M17 7L7 17" />
      </svg>
    </span>
  );
}

function Footer({
  refreshing,
  onRefresh,
  onSwitch,
  contact,
}: {
  refreshing: boolean;
  onRefresh: () => void;
  onSwitch: () => void;
  contact?: { name: string; phone: string };
}) {
  return (
    <div className="flex flex-col gap-2 border-t border-[#F1F5F9] pt-4 text-sm">
      <button type="button" onClick={onRefresh} disabled={refreshing}
        className="inline-flex items-center gap-2 self-start font-semibold text-[#0284C7] hover:text-[#075985]">
        {refreshing && <Loader2 size={14} className="animate-spin" />}
        অবস্থা আবার দেখুন
      </button>
      <button type="button" onClick={onSwitch} className="self-start font-semibold text-[#0284C7] hover:text-[#075985]">
        অন্য আবেদন নম্বর দিয়ে দেখুন
      </button>
      {contact && (
        <span className="text-[#64748B]">
          সমস্যা হলে কল করুন: <a href={`tel:${contact.phone}`} className="font-inter font-semibold text-[#0284C7]">{formatPhone(contact.phone)}</a>
        </span>
      )}
    </div>
  );
}
