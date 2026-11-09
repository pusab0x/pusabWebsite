import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { Loader2 } from "lucide-react";
import { ApiError, examApi, type ExamApplicationStatus, type ExamConfig } from "@/lib/api";
import {
  EXAM_ADMIT_START,
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
import { ApplicationDocument } from "@/components/exam/ApplicationDocument";
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
  const [printing, setPrinting] = useState<"application" | "admit">("application");
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

  const printDoc = (doc: "application" | "admit") => {
    flushSync(() => setPrinting(doc));
    if (doc === "admit") onDownloaded();
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
      ? "আপনার পেমেন্ট যাচাই সম্পন্ন হয়েছে।"
      : "আপনার আবেদন নম্বর সংরক্ষণ করে রাখুন। পেমেন্ট যাচাই করা হচ্ছে।";

  const contact = config.contacts[0];

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
        <aside className="flex min-w-0 flex-col gap-[18px] rounded-[20px] border border-[#E2E8F0] bg-white p-5 md:order-2 md:w-[340px] md:flex-none md:p-6">
          {rejected ? <RejectBadge /> : <CheckBadge />}
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[24px] font-bold md:text-[26px]">{heading}</h1>
            <p className="text-[15px] leading-relaxed text-[#475569]">{message}</p>
          </div>
          <div className="flex flex-col rounded-[14px] border border-[#E2E8F0] text-[15px]">
            <div className="flex justify-between gap-3 border-b border-[#F1F5F9] px-4 py-3">
              <span className="text-[#64748B]">আবেদন নম্বর</span>
              <strong className="font-inter">{app.application_no}</strong>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-[#F1F5F9] px-4 py-3">
              <span className="text-[#64748B]">পেমেন্ট স্ট্যাটাস</span>
              <StatusPill status={app.status} />
            </div>
            <div className="flex justify-between gap-3 px-4 py-3">
              <span className="text-[#64748B]">Transaction ID</span>
              <strong className="font-inter">{app.trx_id || "—"}</strong>
            </div>
          </div>
          {!rejected && (
            <button type="button" onClick={() => printDoc("application")}
              className="h-[52px] rounded-full bg-[#0284C7] text-base font-bold text-white transition-colors hover:bg-[#0369A1]">
              আবেদনপত্র ডাউনলোড (PDF)
            </button>
          )}
          {!rejected && !canDownload && (
            <p className="rounded-[14px] bg-[#F0FAFE] px-4 py-3 text-center text-[15px] font-semibold leading-relaxed text-[#075985]">
              প্রবেশপত্র {EXAM_ADMIT_START} থেকে ডাউনলোড করা যাবে
            </p>
          )}
          {canDownload && (
            <button type="button" onClick={() => printDoc("admit")}
              className="h-[52px] rounded-full bg-[#16A34A] text-base font-bold text-white transition-colors hover:bg-[#15803D]">
              প্রবেশপত্র ডাউনলোড (PDF)
            </button>
          )}
          <Footer refreshing={refreshing} onRefresh={onRefresh} onSwitch={onSwitch} contact={contact} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4 md:order-1 md:gap-6">
          <section className="rounded-[20px] border border-[#E2E8F0] bg-white p-4 md:p-8">
            <ApplicationDocument app={app} config={config} />
          </section>
          {canDownload && (
            <>
              <div className="hidden md:block"><AdmitCardArticle data={admit} config={config} /></div>
              <div className="md:hidden"><AdmitCardMobile data={admit} config={config} /></div>
            </>
          )}
        </div>
      </div>

      <PrintArea>
        {printing === "admit" ? (
          <AdmitCardPrint data={admit} config={config} />
        ) : (
          <div style={{ width: 794, margin: "0 auto", padding: "0 44px", boxSizing: "border-box" }}>
            <ApplicationDocument app={app} config={config} />
          </div>
        )}
      </PrintArea>
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
