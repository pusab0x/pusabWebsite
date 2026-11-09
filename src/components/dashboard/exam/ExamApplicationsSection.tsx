import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Search, X } from "lucide-react";
import {
  examApi,
  optimizeImage,
  type ExamApplication,
  type ExamCenter,
  type ExamStats,
  type ExamStatus,
} from "@/lib/api";
import { CLASS_OPTIONS, PAYMENT_LABELS, UNIONS, toBn, useExamConfig } from "@/lib/exam";
import { Field, Modal, inputCls, useConfirm } from "@/components/dashboard/primitives";
import {
  ExamPageTitle,
  StatusPill,
  btnOutline,
  btnPrimary,
  downloadCsv,
  duplicateTrxIds,
  errMessage,
  selectCls,
  taka,
} from "./shared";

const PAGE = 20;
type Tab = "all" | ExamStatus;
const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "সব" },
  { key: "pending", label: "যাচাই বাকি" },
  { key: "verified", label: "যাচাই সম্পন্ন" },
  { key: "rejected", label: "বাতিল" },
];

export function ExamApplicationsSection() {
  const { data: config } = useExamConfig();
  const [apps, setApps] = useState<ExamApplication[] | null>(null);
  const [stats, setStats] = useState<ExamStats | null>(null);
  const [centers, setCenters] = useState<ExamCenter[]>([]);
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const [cls, setCls] = useState("");
  const [center, setCenter] = useState("");
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [offlineOpen, setOfflineOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [list, s, c] = await Promise.all([examApi.list(), examApi.stats(), examApi.centers()]);
      setApps(list);
      setStats(s);
      setCenters(c);
      setLoadError(null);
    } catch (err) {
      setLoadError(errMessage(err));
      setApps([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const dupes = useMemo(() => duplicateTrxIds(apps ?? []), [apps]);

  const filtered = useMemo(() => {
    if (!apps) return [];
    const needle = q.trim().toLowerCase();
    return apps.filter(
      (a) =>
        (tab === "all" || a.status === tab) &&
        (!cls || String(a.class_level) === cls) &&
        (!center || String(a.center) === center) &&
        (!needle ||
          a.name_bn.toLowerCase().includes(needle) ||
          a.name_en.toLowerCase().includes(needle) ||
          a.phone.includes(needle) ||
          a.trx_id.toLowerCase().includes(needle) ||
          a.application_no.toLowerCase().includes(needle)),
    );
  }, [apps, tab, q, cls, center]);

  useEffect(() => setPage(0), [tab, q, cls, center]);

  const pageRows = filtered.slice(page * PAGE, page * PAGE + PAGE);
  const selected = apps?.find((a) => a.id === selectedId) ?? null;

  const replace = (updated: ExamApplication) => {
    setApps((list) => list?.map((a) => (a.id === updated.id ? updated : a)) ?? null);
    examApi.stats().then(setStats).catch(() => {});
  };

  async function verify(app: ExamApplication, note = "") {
    setBusyId(app.id);
    try {
      replace(await examApi.verify(app.id, note));
      toast.success(`${app.name_bn} — পেমেন্ট নিশ্চিত`);
    } catch (err) {
      toast.error(errMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function reject(app: ExamApplication, note: string) {
    if (!note.trim()) {
      setSelectedId(app.id);
      toast.error("বাতিলের কারণ নোটে লিখুন — শিক্ষার্থী এটি দেখতে পাবে।");
      return;
    }
    setBusyId(app.id);
    try {
      replace(await examApi.reject(app.id, note));
      toast.success(`${app.name_bn} — আবেদন বাতিল`);
    } catch (err) {
      toast.error(errMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function reset(app: ExamApplication) {
    setBusyId(app.id);
    try {
      replace(await examApi.reset(app.id));
      toast.success("আবার যাচাই বাকি অবস্থায় নেওয়া হয়েছে");
    } catch (err) {
      toast.error(errMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  const s = stats;
  const statTile = (label: string, value: string, tone?: "amber" | "green" | "red") => (
    <div
      className={
        "flex flex-col gap-1 rounded-[14px] border px-[18px] py-4 " +
        (tone === "amber" ? "border-[#FDE68A] bg-[#FFFBEB]" : "border-[#E2E8F0] bg-white")
      }
    >
      <span className={"text-sm " + (tone === "amber" ? "text-[#78350F]" : "text-[#64748B]")}>{label}</span>
      <strong
        className={
          "font-inter text-[28px] " +
          (tone === "amber" ? "text-[#78350F]" : tone === "green" ? "text-[#15803D]" : tone === "red" ? "text-[#B91C1C]" : "text-[#0F172A]")
        }
      >
        {value}
      </strong>
    </div>
  );

  return (
    <div className="exam-ui flex flex-col gap-5 text-[#0F172A]">
      <ExamPageTitle
        title="আবেদনসমূহ ও পেমেন্ট যাচাই"
        actions={
          <>
            <button type="button" className={btnOutline} disabled={!apps?.length}
              onClick={() => apps && downloadCsv(filtered.length ? filtered : apps, `pusab-exam-${config?.year ?? ""}-applications.csv`)}>
              Excel ডাউনলোড
            </button>
            <button type="button" className={btnPrimary} onClick={() => setOfflineOpen(true)}>
              + অফলাইন আবেদন যোগ
            </button>
          </>
        }
      />

      {loadError && (
        <p className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">{loadError}</p>
      )}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
        {statTile("মোট আবেদন", toBn(s?.total ?? 0))}
        {statTile("যাচাই বাকি", toBn(s?.pending ?? 0), "amber")}
        {statTile("যাচাই সম্পন্ন", toBn(s?.verified ?? 0), "green")}
        {statTile("বাতিল", toBn(s?.rejected ?? 0), "red")}
        {statTile("মোট ফি সংগ্রহ", taka(s?.collected ?? 0))}
      </div>

      <div>
        <section className="min-w-0 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
          <div className="flex flex-wrap items-center gap-2.5 border-b border-[#E2E8F0] px-4 py-3.5">
            <div role="tablist" aria-label="Status" className="flex gap-1 rounded-xl bg-[#F1F5F9] p-1 text-sm">
              {TABS.map((t) => (
                <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}
                  className={"h-9 rounded-[9px] px-3 " + (tab === t.key ? "bg-white font-bold text-[#0F172A] shadow-[0_1px_2px_rgba(15,23,42,.08)]" : "text-[#475569]")}>
                  {t.label}
                </button>
              ))}
            </div>
            <label className="flex h-11 min-w-[200px] flex-[1_1_200px] items-center gap-2 rounded-xl border border-[#CBD5E1] px-3 text-[#64748B] focus-within:border-[#0284C7]">
              <Search size={16} />
              <input type="search" aria-label="Search" placeholder="নাম, মোবাইল বা TrxID" value={q} onChange={(e) => setQ(e.target.value)}
                className="min-w-0 flex-1 border-0 bg-transparent text-[15px] text-[#0F172A] outline-none" />
            </label>
            <select aria-label="শ্রেণি" value={cls} onChange={(e) => setCls(e.target.value)} className={selectCls}>
              <option value="">সব শ্রেণি</option>
              {CLASS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select aria-label="কেন্দ্র" value={center} onChange={(e) => setCenter(e.target.value)} className={selectCls}>
              <option value="">সব কেন্দ্র</option>
              {centers.map((c) => <option key={c.id} value={c.id}>{c.short_name || c.name}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] text-left text-[13px] text-[#64748B]">
                  <th className="px-4 py-2.5 font-semibold">শিক্ষার্থী</th>
                  <th className="px-3 py-2.5 font-semibold">শ্রেণি</th>
                  <th className="px-3 py-2.5 font-semibold">কেন্দ্র</th>
                  <th className="px-3 py-2.5 font-semibold">পেমেন্ট</th>
                  <th className="px-3 py-2.5 font-semibold">অবস্থা</th>
                  <th className="px-4 py-2.5 text-right font-semibold">কাজ</th>
                </tr>
              </thead>
              <tbody>
                {apps === null ? (
                  <tr><td colSpan={6} className="py-16 text-center"><Loader2 className="mx-auto animate-spin text-[#0284C7]" /></td></tr>
                ) : pageRows.length === 0 ? (
                  <tr><td colSpan={6} className="py-16 text-center text-[#64748B]">কোনো আবেদন নেই।</td></tr>
                ) : (
                  pageRows.map((a) => {
                    const isSel = selected?.id === a.id;
                    return (
                      <tr key={a.id} onClick={() => setSelectedId(a.id)}
                        className={"cursor-pointer border-t border-[#F1F5F9] transition-colors " + (isSel ? "bg-[#F0FAFE]" : "hover:bg-[#F8FAFC]")}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="h-11 w-9 flex-none overflow-hidden rounded-md bg-[#E2E8F0]">
                              {a.photo_url && <img src={optimizeImage(a.photo_url, 80)} alt="" className="h-full w-full object-cover" />}
                            </span>
                            <span className="flex flex-col">
                              <strong>{a.name_bn}</strong>
                              <span className="font-inter text-xs text-[#64748B]">{a.phone}</span>
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3">{a.class_label}</td>
                        <td className="px-3 py-3">{a.center_short}</td>
                        <td className="px-3 py-3">
                          <span className="flex flex-col">
                            <span>{a.payment_label} · {taka(a.amount)}</span>
                            {a.trx_id && <span className="font-inter text-xs text-[#64748B]">TRX {a.trx_id}</span>}
                          </span>
                        </td>
                        <td className="px-3 py-3"><StatusPill status={a.status} flagged={a.status === "pending" && dupes.has(a.trx_id)} /></td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          {a.status === "pending" ? (
                            <div className="inline-flex gap-1.5">
                              <button type="button" disabled={busyId === a.id} onClick={() => verify(a)}
                                className="h-9 rounded-[9px] bg-[#16A34A] px-3 text-[13px] font-bold text-white hover:bg-[#15803D] disabled:opacity-60">নিশ্চিত</button>
                              <button type="button" disabled={busyId === a.id} onClick={() => reject(a, "")}
                                className="h-9 rounded-[9px] border border-[#FECACA] bg-white px-3 text-[13px] font-semibold text-[#B91C1C] hover:bg-[#FEF2F2] disabled:opacity-60">বাতিল</button>
                            </div>
                          ) : a.status === "verified" ? (
                            <span className="font-inter text-[13px] text-[#64748B]">{a.roll_no ? `রোল ${a.roll_no}` : "রোল বাকি"}</span>
                          ) : (
                            <button type="button" disabled={busyId === a.id} onClick={() => reset(a)} className="text-[13px] font-semibold text-[#0284C7]">পুনর্বিবেচনা</button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-[#E2E8F0] px-4 py-3 text-sm text-[#64748B]">
            <span>
              {toBn(filtered.length)} টির মধ্যে{" "}
              {filtered.length ? `${toBn(page * PAGE + 1)}–${toBn(Math.min(filtered.length, page * PAGE + PAGE))}` : "০"} দেখানো হচ্ছে
            </span>
            <div className="flex gap-1.5">
              <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)}
                className="h-9 rounded-[9px] border border-[#CBD5E1] bg-white px-3 text-[#0F172A] disabled:opacity-40">আগের</button>
              <button type="button" disabled={(page + 1) * PAGE >= filtered.length} onClick={() => setPage((p) => p + 1)}
                className="h-9 rounded-[9px] border border-[#CBD5E1] bg-white px-3 text-[#0F172A] disabled:opacity-40">পরের</button>
            </div>
          </div>
        </section>

      </div>

      <AnimatePresence>
        {selected && (
          <DetailDrawer
            key={selected.id}
            app={selected}
            busy={busyId === selected.id}
            onClose={() => setSelectedId(null)}
            onVerify={verify}
            onReject={reject}
            onReset={reset}
            onDeleted={(id) => {
              setApps((list) => list?.filter((a) => a.id !== id) ?? null);
              examApi.stats().then(setStats).catch(() => {});
            }}
          />
        )}
      </AnimatePresence>

      <OfflineModal
        open={offlineOpen}
        centers={centers}
        onClose={() => setOfflineOpen(false)}
        onCreated={(app) => {
          setApps((list) => [app, ...(list ?? [])]);
          examApi.stats().then(setStats).catch(() => {});
          setSelectedId(app.id);
          setTab("all");
        }}
      />
    </div>
  );
}

function DetailDrawer({
  app,
  busy,
  onClose,
  onVerify,
  onReject,
  onReset,
  onDeleted,
}: {
  app: ExamApplication;
  busy: boolean;
  onClose: () => void;
  onVerify: (a: ExamApplication, note: string) => void;
  onReject: (a: ExamApplication, note: string) => void;
  onReset: (a: ExamApplication) => void;
  onDeleted: (id: number) => void;
}) {
  const [note, setNote] = useState(app.note ?? "");
  const [confirm, confirmEl] = useConfirm();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const remove = async () => {
    if (!(await confirm(`${app.name_bn}-এর আবেদন (${app.application_no}) স্থায়ীভাবে মুছে যাবে।`, "আবেদন মুছবেন?"))) return;
    try {
      await examApi.remove(app.id);
      onDeleted(app.id);
      toast.success("আবেদন মুছে ফেলা হয়েছে");
    } catch (err) {
      toast.error(errMessage(err));
    }
  };

  const info = (label: string, value: string, inter?: boolean) => (
    <div className="flex flex-col">
      <span className="text-xs text-[#64748B]">{label}</span>
      <span className={inter ? "font-inter" : ""}>{value || "—"}</span>
    </div>
  );

  return (
    <>
    {/* Outside the sliding panel: its transform would trap the fixed dialog. */}
    {confirmEl}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[200] bg-[#0B2540]/50"
    />
    <motion.aside
      role="dialog"
      aria-modal="true"
      aria-label="আবেদনের বিস্তারিত"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
      className="exam-ui fixed inset-y-0 right-0 z-[205] flex w-full max-w-[480px] flex-col bg-white text-[#0F172A] shadow-2xl"
    >
      <div className="flex flex-none items-center justify-between gap-3 border-b border-[#E2E8F0] px-[18px] py-4">
        <div className="flex min-w-0 flex-col">
          <h2 className="text-[17px] font-bold">আবেদনের বিস্তারিত</h2>
          <span className="font-inter text-[13px] text-[#64748B]">{app.application_no}</span>
        </div>
        <button type="button" onClick={onClose} aria-label="বন্ধ করুন"
          className="grid h-10 w-10 flex-none place-items-center rounded-xl text-[#475569] transition-colors hover:bg-[#F1F5F9]">
          <X size={18} />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-[18px]">
        <div className="flex gap-3.5">
          {app.photo_url ? (
            <a href={app.photo_url} target="_blank" rel="noopener noreferrer" className="h-[88px] w-[72px] flex-none overflow-hidden rounded-[10px] bg-[#E2E8F0]">
              <img src={optimizeImage(app.photo_url, 200)} alt={app.name_bn} className="h-full w-full object-cover" />
            </a>
          ) : (
            <span className="flex h-[88px] w-[72px] flex-none items-center justify-center rounded-[10px] bg-[#E2E8F0] text-xs text-[#64748B]">ছবি</span>
          )}
          <div className="flex min-w-0 flex-col gap-[3px] text-sm">
            <strong className="text-[17px]">{app.name_bn}</strong>
            <span className="font-inter text-[13px] text-[#475569]">{app.name_en}</span>
            <span>{app.class_label} · {app.institution}</span>
            <span className="text-[#475569]">{app.village}, {app.union}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2.5 text-sm">
          {info("মাতার নাম", app.mother_name)}
          {info("পিতার নাম", app.father_name)}
          {info("মোবাইল", app.phone, true)}
          {info("কেন্দ্র", app.center_name)}
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-sm">
          <strong className="text-[15px]">পেমেন্ট মিলিয়ে দেখুন</strong>
          <Line label="মাধ্যম">{app.payment_method === "offline" ? "অফলাইন (হাতে জমা)" : `${PAYMENT_LABELS[app.payment_method]} (Send Money)`}</Line>
          {app.sender_number && <Line label="পাঠানো নম্বর"><span className="font-inter">{app.sender_number}</span></Line>}
          {app.trx_id && <Line label="Transaction ID"><span className="font-inter font-bold">{app.trx_id}</span></Line>}
          <Line label="পরিমাণ">{taka(app.amount)}</Line>
          {app.roll_no != null && <Line label="রোল · ক্রমিক"><span className="font-inter font-bold">{app.roll_no} · {String(app.serial_no).padStart(3, "0")}</span></Line>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="exam-note" className="text-sm font-semibold">নোট (বাতিল করলে কারণ লিখুন)</label>
          <textarea id="exam-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)}
            className="resize-y rounded-xl border border-[#CBD5E1] px-3 py-2.5 text-sm outline-none focus:border-[#0284C7]" />
        </div>
        {app.status === "pending" ? (
          <div className="flex gap-2.5">
            <button type="button" disabled={busy} onClick={() => onVerify(app, note)}
              className="h-12 flex-[2] rounded-xl bg-[#16A34A] text-[15px] font-bold text-white hover:bg-[#15803D] disabled:opacity-60">
              পেমেন্ট নিশ্চিত করুন
            </button>
            <button type="button" disabled={busy} onClick={() => onReject(app, note)}
              className="h-12 flex-1 rounded-xl border border-[#FECACA] bg-white text-[15px] font-semibold text-[#B91C1C] hover:bg-[#FEF2F2] disabled:opacity-60">
              বাতিল
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2.5">
            <StatusPill status={app.status} />
            {app.status === "verified" && (
              <button type="button" disabled={busy} onClick={() => onReject(app, note)}
                className="h-10 rounded-xl border border-[#FECACA] bg-white px-3 text-sm font-semibold text-[#B91C1C] disabled:opacity-60">বাতিল করুন</button>
            )}
            <button type="button" disabled={busy} onClick={() => onReset(app)}
              className="h-10 rounded-xl border border-[#CBD5E1] bg-white px-3 text-sm font-semibold disabled:opacity-60">যাচাই বাকিতে ফেরান</button>
          </div>
        )}
        <span className="text-[13px] leading-normal text-[#64748B]">
          নিশ্চিত করলে রোল নম্বর দেওয়ার পর শিক্ষার্থী আবেদন নম্বর ও মোবাইল নম্বর দিয়ে প্রবেশপত্র ডাউনলোড করতে পারবে।
        </span>
        <button type="button" onClick={remove} className="self-start text-[13px] font-semibold text-[#B91C1C] hover:underline">
          আবেদন মুছুন
        </button>
      </div>
    </motion.aside>
    </>
  );
}

function Line({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[#64748B]">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

const EMPTY_OFFLINE = {
  name_bn: "", name_en: "", mother_name: "", father_name: "", phone: "", photo_url: "",
  class_level: 8, institution: "", village: "", union: "", center: 0,
};

function OfflineModal({
  open,
  centers,
  onClose,
  onCreated,
}: {
  open: boolean;
  centers: ExamCenter[];
  onClose: () => void;
  onCreated: (app: ExamApplication) => void;
}) {
  const [form, setForm] = useState(EMPTY_OFFLINE);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (open) setForm({ ...EMPTY_OFFLINE, center: centers[0]?.id ?? 0 });
  }, [open, centers]);
  const set = (k: keyof typeof EMPTY_OFFLINE, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  async function submit() {
    setSaving(true);
    try {
      const app = await examApi.create({
        ...form,
        class_level: Number(form.class_level) as 8 | 9 | 10,
        payment_method: "offline",
      });
      onCreated(app);
      toast.success(`${app.application_no} যোগ হয়েছে (যাচাই সম্পন্ন)`);
      onClose();
    } catch (err) {
      toast.error(errMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const text = (k: keyof typeof EMPTY_OFFLINE, label: string, full = false, placeholder = "") => (
    <Field label={label} full={full}>
      <input className={inputCls} value={String(form[k])} placeholder={placeholder}
        onChange={(e) => set(k, k === "name_en" ? e.target.value.toUpperCase() : e.target.value)} required />
    </Field>
  );

  return (
    <Modal open={open} onClose={onClose} title="অফলাইন আবেদন যোগ" onSubmit={submit} saving={saving} submitLabel="আবেদন যোগ করুন">
      <p className="text-sm text-[#475569] sm:col-span-2">হাতে ফি জমা দেওয়া শিক্ষার্থী — যোগ করলেই "যাচাই সম্পন্ন" হিসেবে গণ্য হবে।</p>
      {text("name_bn", "নাম (বাংলায়)")}
      {text("name_en", "নাম (ইংরেজি)", false, "MD. RAKIB HASAN")}
      {text("mother_name", "মাতার নাম")}
      {text("father_name", "পিতার নাম")}
      {text("phone", "মোবাইল", false, "01XXXXXXXXX")}
      <Field label="শ্রেণি">
        <select className={inputCls} value={form.class_level} onChange={(e) => set("class_level", Number(e.target.value))}>
          {CLASS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Field>
      {text("institution", "শিক্ষা প্রতিষ্ঠান", true)}
      {text("village", "গ্রাম")}
      <Field label="ইউনিয়ন">
        <select className={inputCls} value={form.union} onChange={(e) => set("union", e.target.value)} required>
          <option value="">বেছে নিন</option>
          {UNIONS.map((u) => <option key={u} value={u}>{u}</option>)}
          <option value="অন্যান্য">অন্যান্য</option>
        </select>
      </Field>
      <Field label="পরীক্ষা কেন্দ্র" full>
        <select className={inputCls} value={form.center} onChange={(e) => set("center", Number(e.target.value))}>
          {centers.filter((c) => c.is_active).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Field>
    </Modal>
  );
}
