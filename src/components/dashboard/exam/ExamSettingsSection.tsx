import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { examApi, type ExamCenter, type ExamConfig, type ExamContact } from "@/lib/api";
import { bnDateLong, bnWeekday } from "@/lib/exam";
import { useConfirm } from "@/components/dashboard/primitives";
import { ExamPageTitle, btnOutline, btnPrimary, errMessage } from "./shared";

const input =
  "h-11 w-full rounded-xl border border-[#CBD5E1] bg-white px-3 text-[15px] text-[#0F172A] outline-none focus:border-[#0284C7] focus:shadow-[0_0_0_4px_rgb(2_132_199/0.12)]";

type Draft = Pick<
  ExamConfig,
  | "title" | "short_title" | "year" | "application_prefix" | "exam_date" | "exam_time" | "deadline"
  | "fee" | "bkash_number" | "nagad_number" | "rocket_number" | "contacts"
>;

export function ExamSettingsSection() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    examApi
      .config()
      .then((c) =>
        setDraft({
          title: c.title, short_title: c.short_title, year: c.year, application_prefix: c.application_prefix,
          exam_date: c.exam_date, exam_time: c.exam_time, deadline: c.deadline, fee: c.fee,
          bkash_number: c.bkash_number, nagad_number: c.nagad_number, rocket_number: c.rocket_number,
          contacts: c.contacts,
        }),
      )
      .catch((err) => toast.error(errMessage(err)));
  }, []);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));

  async function save() {
    if (!draft) return;
    setSaving(true);
    try {
      const updated = await examApi.updateConfig({
        ...draft,
        exam_date: draft.exam_date || null,
        deadline: draft.deadline || null,
        contacts: draft.contacts.filter((c) => c.name.trim() || c.phone.trim()),
      });
      queryClient.setQueryData(["exam", "config"], updated);
      toast.success("পরীক্ষার সেটিংস সংরক্ষণ হয়েছে");
    } catch (err) {
      toast.error(errMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (!draft) {
    return <div className="grid h-60 place-items-center"><Loader2 className="animate-spin text-[#0284C7]" /></div>;
  }

  const setContact = (i: number, patch: Partial<ExamContact>) =>
    set("contacts", draft.contacts.map((c, j) => (j === i ? { ...c, ...patch } : c)));

  return (
    <div className="exam-ui flex flex-col gap-5 text-[#0F172A]">
      <ExamPageTitle
        title="পরীক্ষার সেটিংস"
        actions={
          <button type="button" onClick={save} disabled={saving} className={btnPrimary}>
            {saving && <Loader2 size={16} className="animate-spin" />}
            সংরক্ষণ করুন
          </button>
        }
      />

      <div className="flex flex-wrap items-start gap-[18px]">
        <div className="flex min-w-0 flex-[2_1_520px] flex-col gap-[18px]">
          <Card title="পরীক্ষার তথ্য" hint="হোমপেজ, আবেদন ফর্ম ও প্রবেশপত্রে এই তথ্যগুলো দেখাবে।">
            <div className="grid gap-4 sm:grid-cols-2">
              <F label="পরীক্ষার পূর্ণ নাম" full><input className={input} value={draft.title} onChange={(e) => set("title", e.target.value)} /></F>
              <F label="সংক্ষিপ্ত নাম" hint="হোমপেজ কার্ডে"><input className={input} value={draft.short_title} onChange={(e) => set("short_title", e.target.value)} /></F>
              <F label="সাল"><input className={input + " font-inter"} inputMode="numeric" value={draft.year} onChange={(e) => set("year", Number(e.target.value.replace(/\D/g, "")) || 0)} /></F>
              <F label="পরীক্ষার তারিখ" hint={draft.exam_date ? `${bnDateLong(draft.exam_date)}, ${bnWeekday(draft.exam_date)}` : undefined}>
                <input type="date" className={input + " font-inter"} value={draft.exam_date ?? ""} onChange={(e) => set("exam_date", e.target.value)} />
              </F>
              <F label="সময়"><input className={input} value={draft.exam_time} onChange={(e) => set("exam_time", e.target.value)} placeholder="সকাল ১০.০০ টা" /></F>
              <F label="আবেদনের শেষ তারিখ" hint="এই দিন রাত ১১:৫৯ পর্যন্ত আবেদন নেওয়া হবে">
                <input type="date" className={input + " font-inter"} value={draft.deadline ?? ""} onChange={(e) => set("deadline", e.target.value)} />
              </F>
              <F label="আবেদন ফি (টাকা)"><input className={input + " font-inter"} inputMode="numeric" value={draft.fee} onChange={(e) => set("fee", Number(e.target.value.replace(/\D/g, "")) || 0)} /></F>
              <F label="আবেদন নম্বরের শুরু" hint={`যেমন: ${draft.application_prefix}-0001`}>
                <input className={input + " font-inter uppercase"} value={draft.application_prefix} onChange={(e) => set("application_prefix", e.target.value.toUpperCase())} />
              </F>
            </div>
            <p className="rounded-xl bg-[#FFFBEB] px-3.5 py-2.5 text-[13px] leading-relaxed text-[#78350F]">
              নতুন বছরের পরীক্ষা শুরু করতে সাল ও আবেদন নম্বরের শুরু বদলে দিন — আগের বছরের আবেদনগুলো আলাদা থেকে যাবে।
            </p>
          </Card>

          <Card title="পেমেন্ট নম্বর" hint="শিক্ষার্থীরা এই নম্বরে Send Money করবে। খালি রাখলে ফর্মে 'নম্বর শীঘ্রই দেওয়া হবে' দেখাবে।">
            <div className="grid gap-4 sm:grid-cols-3">
              <F label="বিকাশ"><input className={input + " font-inter"} value={draft.bkash_number} onChange={(e) => set("bkash_number", e.target.value)} placeholder="01XXXXXXXXX" /></F>
              <F label="নগদ"><input className={input + " font-inter"} value={draft.nagad_number} onChange={(e) => set("nagad_number", e.target.value)} placeholder="01XXXXXXXXX" /></F>
              <F label="রকেট"><input className={input + " font-inter"} value={draft.rocket_number} onChange={(e) => set("rocket_number", e.target.value)} placeholder="01XXXXXXXXX-X" /></F>
            </div>
          </Card>

          <Card title="যোগাযোগ" hint="আবেদন ফর্মের পাশে ও প্রবেশপত্র পেজে দেখাবে।">
            <div className="flex flex-col gap-3">
              {draft.contacts.map((c, i) => (
                <div key={i} className="grid gap-2.5 rounded-xl border border-[#E2E8F0] p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
                  <input className={input} value={c.name} placeholder="নাম" onChange={(e) => setContact(i, { name: e.target.value })} />
                  <input className={input} value={c.role} placeholder="পদ" onChange={(e) => setContact(i, { role: e.target.value })} />
                  <input className={input + " font-inter"} value={c.phone} placeholder="01XXXXXXXXX" onChange={(e) => setContact(i, { phone: e.target.value })} />
                  <button type="button" aria-label="মুছুন" onClick={() => set("contacts", draft.contacts.filter((_, j) => j !== i))}
                    className="grid h-11 w-11 place-items-center rounded-xl text-[#B91C1C] hover:bg-[#FEF2F2]">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => set("contacts", [...draft.contacts, { name: "", role: "", phone: "" }])}
                className={btnOutline + " self-start"}>
                <Plus size={16} /> যোগাযোগ যোগ করুন
              </button>
            </div>
          </Card>
        </div>

        <div className="min-w-0 flex-[1_1_320px]">
          <CentersCard />
        </div>
      </div>
    </div>
  );
}

function CentersCard() {
  const queryClient = useQueryClient();
  const [centers, setCenters] = useState<ExamCenter[] | null>(null);
  const [adding, setAdding] = useState({ name: "", location: "", short_name: "" });
  const [confirm, confirmEl] = useConfirm();

  const refresh = () =>
    examApi
      .centers()
      .then(setCenters)
      .then(() => queryClient.invalidateQueries({ queryKey: ["exam", "config"] }))
      .catch((err) => toast.error(errMessage(err)));

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function add() {
    if (!adding.name.trim()) return toast.error("কেন্দ্রের নাম লিখুন");
    try {
      await examApi.createCenter({ ...adding, order: (centers?.length ?? 0) + 1 });
      setAdding({ name: "", location: "", short_name: "" });
      toast.success("কেন্দ্র যোগ হয়েছে");
      refresh();
    } catch (err) {
      toast.error(errMessage(err));
    }
  }

  async function update(c: ExamCenter, patch: Partial<ExamCenter>) {
    try {
      await examApi.updateCenter(c.id, patch);
      refresh();
    } catch (err) {
      toast.error(errMessage(err));
    }
  }

  async function remove(c: ExamCenter) {
    if (!(await confirm(`"${c.name}" কেন্দ্রটি মুছে যাবে।`, "কেন্দ্র মুছবেন?"))) return;
    try {
      await examApi.removeCenter(c.id);
      toast.success("কেন্দ্র মুছে ফেলা হয়েছে");
      refresh();
    } catch (err) {
      toast.error(errMessage(err));
    }
  }

  return (
    <Card title="পরীক্ষা কেন্দ্র" hint="নিষ্ক্রিয় কেন্দ্র আবেদন ফর্মে দেখাবে না।">
      {confirmEl}
      {centers === null ? (
        <Loader2 className="mx-auto my-6 animate-spin text-[#0284C7]" />
      ) : (
        <div className="flex flex-col gap-2.5">
          {centers.map((c) => (
            <div key={c.id} className={"flex flex-col gap-2 rounded-xl border p-3 " + (c.is_active ? "border-[#E2E8F0]" : "border-dashed border-[#CBD5E1] opacity-70")}>
              <input className={input + " h-10 font-semibold"} defaultValue={c.name}
                onBlur={(e) => e.target.value !== c.name && update(c, { name: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <input className={input + " h-10 text-sm"} defaultValue={c.location} placeholder="এলাকা"
                  onBlur={(e) => e.target.value !== c.location && update(c, { location: e.target.value })} />
                <input className={input + " h-10 text-sm"} defaultValue={c.short_name} placeholder="সংক্ষিপ্ত নাম"
                  onBlur={(e) => e.target.value !== c.short_name && update(c, { short_name: e.target.value })} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={c.is_active} onChange={(e) => update(c, { is_active: e.target.checked })} className="h-4 w-4 accent-[#0284C7]" />
                  সক্রিয়
                </label>
                <button type="button" onClick={() => remove(c)} className="font-semibold text-[#B91C1C] hover:underline">মুছুন</button>
              </div>
            </div>
          ))}
          <div className="flex flex-col gap-2 rounded-xl bg-[#F8FAFC] p-3">
            <strong className="text-sm">নতুন কেন্দ্র</strong>
            <input className={input + " h-10"} placeholder="কেন্দ্রের পূর্ণ নাম" value={adding.name} onChange={(e) => setAdding((a) => ({ ...a, name: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <input className={input + " h-10 text-sm"} placeholder="এলাকা" value={adding.location} onChange={(e) => setAdding((a) => ({ ...a, location: e.target.value }))} />
              <input className={input + " h-10 text-sm"} placeholder="সংক্ষিপ্ত নাম" value={adding.short_name} onChange={(e) => setAdding((a) => ({ ...a, short_name: e.target.value }))} />
            </div>
            <button type="button" onClick={add} className={btnPrimary + " h-10"}><Plus size={16} /> যোগ করুন</button>
          </div>
        </div>
      )}
    </Card>
  );
}

function Card({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold">{title}</h2>
        {hint && <p className="text-sm text-[#64748B]">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function F({ label, hint, full, children }: { label: string; hint?: string; full?: boolean; children: ReactNode }) {
  return (
    <label className={"flex flex-col gap-1.5 " + (full ? "sm:col-span-2" : "")}>
      <span className="text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="text-xs text-[#64748B]">{hint}</span>}
    </label>
  );
}
