import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { examApi, type ExamApplication, type ExamCenter, type ExamConfig, type ExamStats } from "@/lib/api";
import { CLASS_OPTIONS, bnDateLong, serialLabel, bnWeekday, toBn, titleWithEra, ORG_NAME_BN } from "@/lib/exam";
import { AdmitCardPrint, type AdmitData } from "@/components/exam/AdmitCards";
import { PrintArea, printArea } from "@/components/exam/print";
import { ExamPageTitle, Switch, btnOutline, btnPrimary, errMessage, selectCls } from "./shared";

type PrintMode = "admits" | "attendance" | null;

const toAdmit = (a: ExamApplication, centers: ExamCenter[]): AdmitData => {
  const c = centers.find((x) => x.id === a.center);
  return {
    name_bn: a.name_bn,
    photo_url: a.photo_url,
    class_label: a.class_label,
    serial_no: a.serial_no,
    roll_no: a.roll_no,
    centerLabel: c ? (c.location ? `${c.name}, ${c.location}` : c.name) : a.center_name,
  };
};

export function ExamAdmitCardsSection() {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<ExamConfig | null>(null);
  const [apps, setApps] = useState<ExamApplication[] | null>(null);
  const [stats, setStats] = useState<ExamStats | null>(null);
  const [centers, setCenters] = useState<ExamCenter[]>([]);
  const [starts, setStarts] = useState({ roll_start_8: 8001, roll_start_9: 9001, roll_start_10: 1001 });
  const [center, setCenter] = useState("");
  const [cls, setCls] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [printMode, setPrintMode] = useState<PrintMode>(null);
  const [printSet, setPrintSet] = useState<ExamApplication[]>([]);
  const [preview, setPreview] = useState<AdmitData | null>(null);

  const load = useCallback(async () => {
    try {
      const [cfg, list, s, c] = await Promise.all([
        examApi.config(),
        examApi.list({ status: "verified", order: "roll" }),
        examApi.stats(),
        examApi.centers(),
      ]);
      setConfig(cfg);
      setStarts({ roll_start_8: cfg.roll_start_8, roll_start_9: cfg.roll_start_9, roll_start_10: cfg.roll_start_10 });
      setApps(list);
      setStats(s);
      setCenters(c);
    } catch (err) {
      toast.error(errMessage(err));
      setApps([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(() => {
    const list = (apps ?? []).filter(
      (a) => (!center || String(a.center) === center) && (!cls || String(a.class_level) === cls),
    );
    // Rolled students in roll order first, then the ones still waiting.
    return [...list].sort((a, b) => {
      if (a.roll_no == null && b.roll_no == null) return a.id - b.id;
      if (a.roll_no == null) return 1;
      if (b.roll_no == null) return -1;
      return (a.serial_no ?? 0) - (b.serial_no ?? 0);
    });
  }, [apps, center, cls]);

  const withRoll = rows.filter((a) => a.roll_no != null);
  const missingRoll = (apps ?? []).filter((a) => a.roll_no == null).length;

  async function saveConfig(patch: Partial<ExamConfig>, key: string) {
    setSavingKey(key);
    try {
      const updated = await examApi.updateConfig(patch);
      setConfig(updated);
      queryClient.setQueryData(["exam", "config"], updated);
      return updated;
    } catch (err) {
      toast.error(errMessage(err));
      return null;
    } finally {
      setSavingKey(null);
    }
  }

  async function assignAll() {
    setAssigning(true);
    try {
      const changed =
        config &&
        (starts.roll_start_8 !== config.roll_start_8 ||
          starts.roll_start_9 !== config.roll_start_9 ||
          starts.roll_start_10 !== config.roll_start_10);
      if (changed && !(await saveConfig(starts, "starts"))) return;
      const { assigned } = await examApi.assignRolls();
      toast.success(assigned ? `${toBn(assigned)} জনকে রোল নম্বর দেওয়া হয়েছে` : "সবাই আগেই রোল নম্বর পেয়েছে");
      await load();
    } catch (err) {
      toast.error(errMessage(err));
    } finally {
      setAssigning(false);
    }
  }

  async function assignOne(app: ExamApplication) {
    try {
      const updated = await examApi.assignRoll(app.id);
      setApps((list) => list?.map((a) => (a.id === updated.id ? updated : a)) ?? null);
      toast.success(`${updated.name_bn} — রোল ${updated.roll_no}`);
    } catch (err) {
      toast.error(errMessage(err));
    }
  }

  async function print(mode: Exclude<PrintMode, null>, set: ExamApplication[]) {
    if (!set.length) return toast.error("প্রিন্ট করার মতো রোল পাওয়া শিক্ষার্থী নেই।");
    setPrintSet(set);
    setPrintMode(mode);
    // Let the print area render before opening the dialog.
    requestAnimationFrame(() => requestAnimationFrame(() => printArea()));
  }

  const byClassVerified = stats?.verified_by_class;

  return (
    <div className="exam-ui flex flex-col gap-5 text-[#0F172A]">
      <ExamPageTitle
        title="প্রবেশপত্র ও রোল নম্বর"
        actions={
          <>
            <button type="button" className={btnOutline} onClick={() => print("attendance", withRoll)}>হাজিরা শিট (PDF)</button>
            <button type="button" className={btnPrimary} onClick={() => print("admits", withRoll)}>সব প্রবেশপত্র PDF</button>
          </>
        }
      />

      <div className="flex flex-wrap items-start gap-[18px]">
        <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-[18px]">
          <section className="flex flex-col gap-3.5 rounded-2xl border border-[#E2E8F0] bg-white p-5">
            <h2 className="text-lg font-bold">রোল নম্বর দেওয়া</h2>
            <p className="text-sm leading-relaxed text-[#475569]">
              যাচাই সম্পন্ন আবেদনগুলোতে শ্রেণি ও কেন্দ্র অনুযায়ী ক্রমিক ও রোল নম্বর স্বয়ংক্রিয়ভাবে বসবে।
            </p>
            <div className="flex flex-col rounded-xl border border-[#E2E8F0] text-sm">
              <div className="grid grid-cols-3 rounded-t-xl bg-[#F8FAFC] px-3.5 py-2.5 text-[13px] text-[#64748B]">
                <span>শ্রেণি</span><span>রোল শুরু</span><span>যাচাইকৃত</span>
              </div>
              {CLASS_OPTIONS.map((o) => {
                const key = `roll_start_${o.value}` as keyof typeof starts;
                return (
                  <div key={o.value} className="grid grid-cols-3 items-center border-t border-[#F1F5F9] px-3.5 py-2">
                    <span>{o.label}</span>
                    <input aria-label={`${o.label} রোল শুরু`} inputMode="numeric" value={starts[key]}
                      onChange={(e) => setStarts((s) => ({ ...s, [key]: Number(e.target.value.replace(/\D/g, "")) || 0 }))}
                      className="font-inter h-9 w-20 rounded-lg border border-[#CBD5E1] px-2 text-sm outline-none focus:border-[#0284C7]" />
                    <span>{toBn(byClassVerified?.[String(o.value) as "8"] ?? 0)} জন</span>
                  </div>
                );
              })}
            </div>
            <button type="button" onClick={assignAll} disabled={assigning} className={btnPrimary + " h-12"}>
              {assigning && <Loader2 size={16} className="animate-spin" />}
              বাকিদের রোল নম্বর দিন{missingRoll ? ` (${toBn(missingRoll)})` : ""}
            </button>
          </section>

          <section className="flex flex-col gap-1 rounded-2xl border border-[#E2E8F0] bg-white p-5">
            <h2 className="mb-2 text-lg font-bold">নিয়ন্ত্রণ</h2>
            {config ? (
              <>
                <Switch label="অনলাইন আবেদন গ্রহণ" hint="বন্ধ করলে ফর্ম আর জমা নেবে না" checked={config.applications_open}
                  busy={savingKey === "applications_open"} onChange={(v) => saveConfig({ applications_open: v }, "applications_open")} />
                <Switch label="হোমপেজে আবেদনের ব্যানার" hint="ঘোষণার বার ও হিরো কার্ড" checked={config.show_home_banner}
                  busy={savingKey === "show_home_banner"} onChange={(v) => saveConfig({ show_home_banner: v }, "show_home_banner")} />
                <Switch label="প্রবেশপত্র ডাউনলোড চালু" hint="শুধু রোল নম্বর পাওয়া শিক্ষার্থীরা পারবে" checked={config.admit_download_open}
                  busy={savingKey === "admit_download_open"} onChange={(v) => saveConfig({ admit_download_open: v }, "admit_download_open")} last />
              </>
            ) : (
              <Loader2 className="mx-auto my-6 animate-spin text-[#0284C7]" />
            )}
          </section>
        </div>

        <section className="min-w-0 flex-[2_1_520px] overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
          <div className="flex flex-wrap items-center gap-2.5 border-b border-[#E2E8F0] px-4 py-3.5">
            <h2 className="text-lg font-bold">যাচাইকৃত শিক্ষার্থী</h2>
            <select aria-label="কেন্দ্র" value={center} onChange={(e) => setCenter(e.target.value)} className={selectCls + " ml-auto h-10 rounded-[10px]"}>
              <option value="">সব কেন্দ্র</option>
              {centers.map((c) => <option key={c.id} value={c.id}>{c.short_name || c.name}</option>)}
            </select>
            <select aria-label="শ্রেণি" value={cls} onChange={(e) => setCls(e.target.value)} className={selectCls + " h-10 rounded-[10px]"}>
              <option value="">সব শ্রেণি</option>
              {CLASS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="max-h-[560px] overflow-auto">
            <table className="w-full min-w-[600px] border-collapse text-sm">
              <thead className="sticky top-0">
                <tr className="bg-[#F8FAFC] text-left text-[13px] text-[#64748B]">
                  <th className="px-4 py-2.5 font-semibold">ক্রমিক</th>
                  <th className="px-3 py-2.5 font-semibold">রোল</th>
                  <th className="px-3 py-2.5 font-semibold">নাম</th>
                  <th className="px-3 py-2.5 font-semibold">শ্রেণি</th>
                  <th className="px-3 py-2.5 font-semibold">ডাউনলোড</th>
                  <th className="px-4 py-2.5 text-right font-semibold">প্রবেশপত্র</th>
                </tr>
              </thead>
              <tbody>
                {apps === null ? (
                  <tr><td colSpan={6} className="py-14 text-center"><Loader2 className="mx-auto animate-spin text-[#0284C7]" /></td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={6} className="py-14 text-center text-[#64748B]">এখনো কোনো যাচাইকৃত শিক্ষার্থী নেই।</td></tr>
                ) : (
                  rows.map((a) =>
                    a.roll_no != null ? (
                      <tr key={a.id} className="border-t border-[#F1F5F9]">
                        <td className="font-inter px-4 py-3">{String(a.serial_no).padStart(3, "0")}</td>
                        <td className="font-inter px-3 py-3 font-bold">{a.roll_no}</td>
                        <td className="px-3 py-3">{a.name_bn}</td>
                        <td className="px-3 py-3">{a.class_label}</td>
                        <td className="px-3 py-3">
                          {a.admit_downloaded_at ? (
                            <span className="rounded-full bg-[#DCFCE7] px-2.5 py-[3px] text-xs font-bold text-[#14532D]">ডাউনলোড করেছে</span>
                          ) : (
                            <span className="rounded-full bg-[#F1F5F9] px-2.5 py-[3px] text-xs font-bold text-[#475569]">এখনো করেনি</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button type="button" onClick={() => setPreview(toAdmit(a, centers))} className="font-semibold text-[#0284C7] hover:text-[#0369A1]">দেখুন</button>
                          <span className="text-[#94A3B8]"> · </span>
                          <button type="button" onClick={() => print("admits", [a])} className="font-semibold text-[#0284C7] hover:text-[#0369A1]">প্রিন্ট</button>
                        </td>
                      </tr>
                    ) : (
                      <tr key={a.id} className="border-t border-[#F1F5F9] bg-[#FFFBEB]">
                        <td className="px-4 py-3 text-[#78350F]">—</td>
                        <td className="px-3 py-3 text-[#78350F]">রোল বাকি</td>
                        <td className="px-3 py-3">{a.name_bn}</td>
                        <td className="px-3 py-3">{a.class_label}</td>
                        <td className="px-3 py-3 text-[#64748B]">—</td>
                        <td className="px-4 py-3 text-right">
                          <button type="button" onClick={() => assignOne(a)}
                            className="h-[34px] rounded-[9px] border border-[#CBD5E1] bg-white px-3 text-[13px] font-semibold hover:border-[#94A3B8]">রোল দিন</button>
                        </td>
                      </tr>
                    ),
                  )
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center gap-4 border-t border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <div className="flex h-[100px] w-[180px] flex-none flex-col items-center justify-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white">
              <span className="text-[11px] font-bold">পুসাব · প্রবেশপত্র</span>
              <span className="h-3.5 w-[70px] rounded-[50%] bg-[#2F5597]" />
              <span className="w-[130px] border-t border-dotted border-[#475569]" />
              <span className="w-[130px] border-t border-dotted border-[#475569]" />
            </div>
            <div className="flex flex-[1_1_220px] flex-col gap-1">
              <strong className="text-[15px]">প্রবেশপত্রের নকশা</strong>
              <span className="text-sm leading-normal text-[#475569]">
                মূল ফর্মের হুবহু নকশায় তৈরি হবে — লোগো, ছবি, ক্রমিক, রোল, শ্রেণি, নাম, কেন্দ্র ও পরীক্ষার সময়সহ।
              </span>
            </div>
            <button
              type="button"
              disabled={!config}
              onClick={() =>
                config &&
                setPreview(
                  withRoll[0]
                    ? toAdmit(withRoll[0], centers)
                    : {
                        name_bn: "শিক্ষার্থীর নাম", photo_url: "", class_label: "অষ্টম", serial_no: 1,
                        roll_no: config.roll_start_8,
                        centerLabel: centers[0] ? `${centers[0].name}, ${centers[0].location}` : "",
                      },
                )
              }
              className="text-sm font-bold text-[#0284C7]"
            >
              নমুনা দেখুন →
            </button>
          </div>
        </section>
      </div>

      {preview && config && <PreviewModal config={config} data={preview} onClose={() => setPreview(null)} />}

      {config && printMode === "admits" && (
        <PrintArea>
          {chunk(printSet, 2).map((pair, i) => (
            <div key={i} className="print-page">
              {pair.map((a) => <AdmitCardPrint key={a.id} data={toAdmit(a, centers)} config={config} />)}
            </div>
          ))}
        </PrintArea>
      )}
      {config && printMode === "attendance" && (
        <PrintArea>
          <AttendanceSheets apps={printSet} centers={centers} config={config} />
        </PrintArea>
      )}
    </div>
  );
}

function chunk<T>(list: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

function PreviewModal({ config, data, onClose }: { config: ExamConfig; data: AdmitData; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[200] grid place-items-center overflow-auto bg-[#0B2540]/60 p-6 backdrop-blur-[3px]" onClick={onClose}>
      <div className="relative max-w-full overflow-auto rounded-2xl bg-white p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Close"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-[#F0F7FD] text-[#4B5E73] hover:text-[#0B1B2B]">
          <X size={16} />
        </button>
        <AdmitCardPrint data={data} config={config} />
      </div>
    </div>
  );
}

/** One A4 page per centre × class: serial, roll, name and a signature column. */
function AttendanceSheets({ apps, centers, config }: { apps: ExamApplication[]; centers: ExamCenter[]; config: ExamConfig }) {
  const groups: { center: string; cls: string; list: ExamApplication[] }[] = [];
  for (const c of centers) {
    for (const o of CLASS_OPTIONS) {
      const list = apps
        .filter((a) => a.center === c.id && a.class_level === o.value)
        .sort((a, b) => (a.roll_no ?? 0) - (b.roll_no ?? 0));
      if (list.length) groups.push({ center: c.location ? `${c.name}, ${c.location}` : c.name, cls: o.label, list });
    }
  }
  const cell = { border: "1px solid #000", padding: "6px 8px" } as const;
  return (
    <>
      {groups.map((g) => (
        <div key={g.center + g.cls} className="print-page" style={{ width: 794, padding: "8px 48px", boxSizing: "border-box", fontFamily: "'Hind Siliguri', sans-serif", color: "#000" }}>
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{ORG_NAME_BN}</div>
            <div style={{ fontSize: 14 }}>{titleWithEra(config.title)}</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 6 }}>হাজিরা শিট</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>
              কেন্দ্র: {g.center} · শ্রেণি: {g.cls} · {bnDateLong(config.exam_date)}, {bnWeekday(config.exam_date)}, {config.exam_time}
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ ...cell, width: 60 }}>ক্রমিক</th>
                <th style={{ ...cell, width: 80 }}>রোল</th>
                <th style={cell}>নাম</th>
                <th style={{ ...cell, width: 200 }}>স্বাক্ষর</th>
              </tr>
            </thead>
            <tbody>
              {g.list.map((a) => (
                <tr key={a.id}>
                  <td style={{ ...cell, textAlign: "center" }}>{serialLabel(a.serial_no)}</td>
                  <td style={{ ...cell, textAlign: "center" }}>{a.roll_no}</td>
                  <td style={cell}>{a.name_bn}</td>
                  <td style={cell} />
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 10, fontSize: 12 }}>মোট: {toBn(g.list.length)} জন</div>
        </div>
      ))}
    </>
  );
}
