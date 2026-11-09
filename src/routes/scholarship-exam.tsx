import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import {
  ApiError,
  examApi,
  isUploadConfigured,
  optimizeImage,
  uploadImage,
  type ExamClassLevel,
  type ExamConfig,
  type ExamPaymentMethod,
} from "@/lib/api";
import {
  CLASS_OPTIONS,
  EXAM_ADMIT_START,
  EXAM_APPLY_START,
  EXAM_STATUS_PATH,
  INSTRUCTIONS,
  MARKS,
  PAYMENT_LABELS,
  UNIONS,
  bnDate,
  bnDateShort,
  bnWeekday,
  formatPhone,
  isBengaliText,
  isValidPhone,
  normalizePhone,
  paymentNumber,
  rememberApplication,
  shortTime,
  stripLatin,
  toBn,
  useExamConfig,
} from "@/lib/exam";

export const Route = createFileRoute("/scholarship-exam")({
  head: () => ({
    meta: [
      { title: "পুসাব মেধাবৃত্তি পরীক্ষা — অনলাইন আবেদন" },
      {
        name: "description",
        content:
          "পুসাব মেধাবৃত্তি পরীক্ষায় অষ্টম, নবম ও দশম শ্রেণির শিক্ষার্থীরা ঘরে বসেই অনলাইনে আবেদন করতে পারবে।",
      },
      { property: "og:title", content: "পুসাব মেধাবৃত্তি পরীক্ষা — অনলাইন আবেদন" },
      { property: "og:url", content: "/scholarship-exam" },
    ],
    links: [{ rel: "canonical", href: "/scholarship-exam" }],
  }),
  component: ExamFormPage,
});

type PayMethod = Exclude<ExamPaymentMethod, "offline">;

interface FormState {
  name_bn: string;
  name_en: string;
  mother_name: string;
  father_name: string;
  phone: string;
  photo_url: string;
  class_level: ExamClassLevel;
  institution: string;
  village: string;
  union: string;
  center: number | null;
  payment_method: PayMethod;
  sender_number: string;
  trx_id: string;
  agree: boolean;
  website: string;
}

type Errors = Partial<Record<keyof FormState | "form", string>>;

const EMPTY: FormState = {
  name_bn: "",
  name_en: "",
  mother_name: "",
  father_name: "",
  phone: "",
  photo_url: "",
  class_level: 8,
  institution: "",
  village: "",
  union: "",
  center: null,
  payment_method: "bkash",
  sender_number: "",
  trx_id: "",
  agree: false,
  website: "",
};

const REQUIRED = "এই তথ্যটি দিন";

function validate(f: FormState): Errors {
  const e: Errors = {};
  for (const key of ["name_bn", "name_en", "mother_name", "father_name", "institution", "village", "union"] as const) {
    if (!f[key].trim()) e[key] = REQUIRED;
  }
  for (const key of ["name_bn", "institution", "village"] as const) {
    if (!e[key] && !isBengaliText(f[key])) e[key] = "বাংলায় লিখুন";
  }
  if (!f.photo_url) e.photo_url = "ছবি আপলোড করুন";
  if (!isValidPhone(f.phone)) e.phone = "সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)";
  if (!f.center) e.center = "একটি কেন্দ্র বেছে নিন";
  if (!isValidPhone(f.sender_number)) e.sender_number = "যে নম্বর থেকে টাকা পাঠিয়েছেন সেটি দিন";
  if (f.trx_id.replace(/\s/g, "").length < 6) e.trx_id = "সঠিক Transaction ID দিন";
  if (!f.agree) e.agree = "তথ্য সঠিক বলে নিশ্চিত করুন";
  return e;
}

/** Which of the four steps is the student on — the first one still incomplete. */
function currentStep(f: FormState): number {
  if (!f.name_bn || !f.name_en || !f.mother_name || !f.father_name || !f.photo_url || !isValidPhone(f.phone)) return 1;
  if (!f.institution || !f.village || !f.union) return 2;
  if (!f.center) return 3;
  return 4;
}

function ExamFormPage() {
  const { data: config, isLoading, isError } = useExamConfig();

  return (
    <div className="exam-ui min-h-screen bg-[#F5F7FA] text-[#0F172A]">
      <HeaderBand config={config} />
      {isLoading ? (
        <div className="mx-auto -mt-8 max-w-[1180px] px-3 pb-16 sm:px-6">
          <div className="h-[420px] animate-pulse rounded-[18px] border border-[#E2E8F0] bg-white" />
        </div>
      ) : isError || !config ? (
        <Notice title="তথ্য লোড করা যায়নি">
          ইন্টারনেট সংযোগ দেখে পেজটি আবার লোড করুন।
        </Notice>
      ) : !config.accepting ? (
        <Notice title="অনলাইন আবেদন এখন বন্ধ আছে">
          {config.deadline_passed ? "আবেদনের সময়সীমা শেষ হয়েছে। " : ""}
          আগে আবেদন করে থাকলে{" "}
          <Link to={EXAM_STATUS_PATH} className="font-semibold text-[#0284C7]">
            আবেদনের অবস্থা ও প্রবেশপত্র দেখুন →
          </Link>
        </Notice>
      ) : (
        <ExamForm config={config} />
      )}
    </div>
  );
}

function HeaderBand({ config }: { config?: ExamConfig }) {
  const date = config?.exam_date;
  return (
    <div className="bg-[#0F172A] px-4 pb-[52px] pt-[112px] text-white sm:px-6 md:pb-16 md:pt-[136px]">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-end gap-8 sm:px-2">
        <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-3 md:gap-3.5">
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-[#1E293B] px-3 py-[5px] text-[13px] text-[#E2E8F0] md:px-3.5 md:py-1.5 md:text-sm">
            <span className={"h-2 w-2 rounded-full " + (config && !config.accepting ? "bg-[#F87171]" : "bg-[#4ADE80]")} />
            {config && !config.accepting ? "আবেদন বন্ধ" : "অনলাইন আবেদন চলছে"}
          </span>
          <h1 className="text-[28px] font-bold leading-[1.3] md:text-[44px] md:leading-[1.25]">
            {config?.title ?? "পুসাব মেধাবৃত্তি পরীক্ষা"}
          </h1>
          <p className="max-w-[620px] text-[15px] leading-relaxed text-[#CBD5E1] md:text-[17px]">
            <span className="md:hidden">অষ্টম, নবম ও দশম শ্রেণির শিক্ষার্থীদের জন্য।</span>
            <span className="hidden md:inline">
              বিশ্বম্ভরপুর উপজেলার স্কুল ও মাদরাসার অষ্টম, নবম ও দশম শ্রেণির শিক্ষার্থীরা এবং উপজেলার বাইরে অধ্যয়নরত বিশ্বম্ভরপুরের স্থায়ী বাসিন্দা শিক্ষার্থীরা আবেদন করতে পারবে।
            </span>
          </p>
          <p className="mt-2 text-sm font-semibold md:text-[15px]">আবেদন শুরু: {EXAM_APPLY_START} · প্রবেশপত্র ডাউনলোড: {EXAM_ADMIT_START} থেকে</p>
        </div>
        {config && (
          <div className="grid w-full flex-[0_1_460px] grid-cols-2 gap-2 md:w-auto md:grid-cols-3 md:gap-2.5">
            <Chip label={<><span className="md:hidden">পরীক্ষা</span><span className="hidden md:inline">পরীক্ষার তারিখ</span></>}
              value={<><span className="md:hidden">{bnDateShort(date)}, {bnWeekday(date)}</span><span className="hidden md:inline">{bnDate(date)}</span></>}
              sub={<><span className="hidden md:inline">{bnWeekday(date)}, </span>{shortTime(config.exam_time)}</>} />
            <Chip label="আবেদন ফি" value={`${toBn(config.fee)} টাকা`}
              sub={<><span className="hidden md:inline">বিকাশ / নগদ / রকেট</span><span className="md:hidden">শেষ: {config.deadline ? bnDate(config.deadline) : "—"}</span></>} />
            <div className="hidden md:block">
              <Chip label="শেষ তারিখ" value={config.deadline ? bnDate(config.deadline) : "ঘোষণা হবে"} sub="রাত ১১:৫৯ পর্যন্ত" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({ label, value, sub }: { label: ReactNode; value: ReactNode; sub: ReactNode }) {
  return (
    <div className="flex h-full flex-col gap-0.5 rounded-xl bg-[#1E293B] p-3 md:gap-1 md:rounded-[14px] md:p-3.5">
      <span className="text-xs text-[#94A3B8] md:text-[13px]">{label}</span>
      <span className="text-[15px] font-bold md:text-base">{value}</span>
      <span className="text-xs text-[#CBD5E1] md:text-[13px]">{sub}</span>
    </div>
  );
}

function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto -mt-8 max-w-[1180px] px-3 pb-16 sm:px-6">
      <div className="rounded-[18px] border border-[#E2E8F0] bg-white p-7 sm:p-10">
        <h2 className="text-[22px] font-bold">{title}</h2>
        <p className="mt-2 text-base leading-relaxed text-[#475569]">{children}</p>
      </div>
    </div>
  );
}

const card = "rounded-2xl border border-[#E2E8F0] bg-white px-4 py-5 md:rounded-[18px] md:p-7";

function ExamForm({ config }: { config: ExamConfig }) {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(() => ({ ...EMPTY, center: config.centers[0]?.id ?? null }));
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const step = currentStep(form);

  function focusFirstError(errs: Errors) {
    const first = Object.keys(errs).find((k) => k !== "form");
    if (!first) return;
    const el = formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.querySelector<HTMLElement>("input,select,button")?.focus({ preventScroll: true });
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return focusFirstError(errs);

    setSubmitting(true);
    try {
      const phone = normalizePhone(form.phone);
      const res = await examApi.apply({
        name_bn: form.name_bn,
        name_en: form.name_en,
        mother_name: form.mother_name,
        father_name: form.father_name,
        phone,
        photo_url: form.photo_url,
        class_level: form.class_level,
        institution: form.institution,
        village: form.village,
        union: form.union,
        center: form.center!,
        payment_method: form.payment_method,
        sender_number: normalizePhone(form.sender_number),
        trx_id: form.trx_id,
        website: form.website,
      });
      rememberApplication(res.application_no, phone);
      navigate({ to: EXAM_STATUS_PATH, search: { new: 1 } });
    } catch (err) {
      const fieldErrs: Errors = {};
      if (err instanceof ApiError && err.data && typeof err.data === "object") {
        for (const [key, value] of Object.entries(err.data as Record<string, unknown>)) {
          const msg = Array.isArray(value) ? String(value[0]) : String(value);
          if (key in EMPTY) fieldErrs[key as keyof FormState] = msg;
          else fieldErrs.form = msg;
        }
      }
      if (!Object.keys(fieldErrs).length) {
        fieldErrs.form =
          err instanceof ApiError && err.status === 429
            ? "অনেকবার চেষ্টা হয়েছে — কিছুক্ষণ পর আবার চেষ্টা করুন।"
            : "আবেদন জমা দেওয়া যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।";
      }
      setErrors(fieldErrs);
      focusFirstError(fieldErrs);
    } finally {
      setSubmitting(false);
    }
  }

  const payNumber = paymentNumber(config, form.payment_method);
  const firstContact = config.contacts[0];

  return (
    <div className="mx-auto -mt-8 flex max-w-[1180px] flex-wrap items-start gap-6 px-3 pb-6 sm:px-6 md:pb-16">
      <form ref={formRef} onSubmit={submit} noValidate className="flex min-w-0 flex-[999_1_560px] flex-col gap-3.5 md:gap-[18px]">
        {/* honeypot */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => set("website", e.target.value)}
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
          aria-hidden="true"
        />

        <StepTracker step={step} />

        {/* STEP 1 */}
        <section className={card + " flex flex-col gap-4 md:gap-5"}>
          <StepHeading n={1} title="শিক্ষার্থীর তথ্য" />
          <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:gap-6">
            <div className="flex flex-col gap-4 md:flex-[1_1_380px]">
              <TextField field="name_bn" label="নাম (বাংলায়)" value={form.name_bn} onChange={(v) => set("name_bn", v)} error={errors.name_bn} placeholder="যেমন: মোঃ রাকিব হাসান" bengali />
              <TextField field="name_en" label="নাম (ইংরেজি বড় হাতের অক্ষরে)" value={form.name_en} onChange={(v) => set("name_en", v.toUpperCase())} error={errors.name_en} placeholder="MD. RAKIB HASAN" inter className="uppercase tracking-[.03em]" />
            </div>
            <PhotoField value={form.photo_url} onChange={(v) => set("photo_url", v)} error={errors.photo_url} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField field="mother_name" label="মাতার নাম" value={form.mother_name} onChange={(v) => set("mother_name", v)} error={errors.mother_name} />
            <TextField field="father_name" label="পিতার নাম" value={form.father_name} onChange={(v) => set("father_name", v)} error={errors.father_name} />
          </div>
          <div data-field="phone" className="flex max-w-[420px] flex-col gap-1.5">
            <label htmlFor="phone" className="text-[15px] font-semibold">মুঠোফোন নম্বর <Req /></label>
            <div className={"flex h-[50px] overflow-hidden rounded-xl border bg-white focus-within:border-[#0284C7] focus-within:shadow-[0_0_0_4px_rgb(2_132_199/0.15)] md:h-12 " + (errors.phone ? "border-[#DC2626]" : "border-[#CBD5E1]")}>
              <span className="font-inter flex items-center border-r border-[#CBD5E1] bg-[#F5F7FA] px-3.5 text-[15px] text-[#475569]">+88</span>
              <input id="phone" type="tel" inputMode="numeric" autoComplete="tel" placeholder="01XXXXXXXXX" value={form.phone}
                onChange={(e) => set("phone", e.target.value)} aria-invalid={!!errors.phone}
                className="font-inter min-w-0 flex-1 border-0 px-3.5 text-base outline-none md:text-[15px]" />
            </div>
            <ErrorText msg={errors.phone} />
            <span className="text-[13px] text-[#64748B]">এই নম্বর দিয়ে পরে আবেদনের অবস্থা দেখা ও প্রবেশপত্র ডাউনলোড করা যাবে।</span>
          </div>
        </section>

        {/* STEP 2 */}
        <section className={card + " flex flex-col gap-4 md:gap-5"}>
          <StepHeading n={2} title="শিক্ষা ও ঠিকানা" />
          <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
            <legend className="pb-2 text-[15px] font-semibold">শ্রেণি <Req /></legend>
            <div className="grid grid-cols-3 gap-2 md:flex md:gap-2.5">
              {CLASS_OPTIONS.map((o) => (
                <ChoicePill key={o.value} name="class_level" checked={form.class_level === o.value}
                  onChange={() => set("class_level", o.value)} className="md:flex-[1_1_120px] md:text-[17px]">
                  {o.label}
                </ChoicePill>
              ))}
            </div>
          </fieldset>
          <TextField field="institution" label="শিক্ষা প্রতিষ্ঠানের নাম" value={form.institution} onChange={(v) => set("institution", v)} error={errors.institution} placeholder="স্কুল / মাদরাসার পূর্ণ নাম" bengali />
          <div className="grid gap-4 md:grid-cols-2">
            <TextField field="village" label="গ্রাম" value={form.village} onChange={(v) => set("village", v)} error={errors.village} bengali />
            <div data-field="union" className="flex flex-col gap-1.5">
              <label htmlFor="union" className="text-[15px] font-semibold">ইউনিয়ন <Req /></label>
              <select id="union" value={form.union} onChange={(e) => set("union", e.target.value)} aria-invalid={!!errors.union}
                className={"exam-field px-3 " + (form.union ? "" : "text-[#64748B]")}>
                <option value="">ইউনিয়ন বেছে নিন</option>
                {UNIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                <option value="অন্যান্য">অন্যান্য</option>
              </select>
              <ErrorText msg={errors.union} />
            </div>
            <div className="hidden flex-col gap-1.5 md:flex">
              <label htmlFor="upz" className="text-[15px] font-semibold">উপজেলা</label>
              <input id="upz" value="বিশ্বম্ভরপুর" readOnly className="exam-field border-[#E2E8F0] bg-[#F5F7FA] text-[#475569]" />
            </div>
            <div className="hidden flex-col gap-1.5 md:flex">
              <label htmlFor="dist" className="text-[15px] font-semibold">জেলা</label>
              <input id="dist" value="সুনামগঞ্জ" readOnly className="exam-field border-[#E2E8F0] bg-[#F5F7FA] text-[#475569]" />
            </div>
          </div>
          <div className="rounded-xl bg-[#F5F7FA] px-3.5 py-3 text-sm text-[#475569] md:hidden">
            উপজেলা: <strong>বিশ্বম্ভরপুর</strong> · জেলা: <strong>সুনামগঞ্জ</strong>
          </div>
        </section>

        {/* STEP 3 */}
        <section data-field="center" className={card + " flex flex-col gap-3 md:gap-4"}>
          <StepHeading n={3} title="পরীক্ষা কেন্দ্র" desktopTitle="পরীক্ষা কেন্দ্র নির্বাচন" />
          <div className="grid gap-3 md:grid-cols-2">
            {config.centers.map((c) => {
              const checked = form.center === c.id;
              return (
                <label key={c.id} className={"flex cursor-pointer gap-3 rounded-[14px] border p-4 transition-colors md:p-[18px] " + (checked ? "border-[#0284C7] bg-[#E6F6FD] shadow-[inset_0_0_0_1px_#0284C7]" : "border-[#CBD5E1] hover:border-[#94A3B8]")}>
                  <input type="radio" name="center" checked={checked} onChange={() => set("center", c.id)} className="mt-[3px] h-[18px] w-[18px] flex-none accent-[#0284C7]" />
                  <span className="flex flex-col gap-0.5">
                    <strong className="text-[15px] md:text-base">{c.name}</strong>
                    {c.location && <span className="text-[13px] text-[#475569] md:text-sm">{c.location}</span>}
                  </span>
                </label>
              );
            })}
          </div>
          <ErrorText msg={errors.center} />
        </section>

        {/* STEP 4 */}
        <section className={card + " flex flex-col gap-3.5 md:gap-[18px]"}>
          <StepHeading n={4} title={`ফি পরিশোধ — ${toBn(config.fee)} টাকা`} desktopTitle={`আবেদন ফি পরিশোধ — ${toBn(config.fee)} টাকা`} />
          <div className="grid grid-cols-3 gap-2 md:flex md:flex-wrap md:gap-2.5">
            {(["bkash", "nagad", "rocket"] as const).map((m) => (
              <ChoicePill key={m} name="payment_method" checked={form.payment_method === m}
                onChange={() => set("payment_method", m)} className="text-[15px] md:flex-[1_1_140px] md:text-base">
                {PAYMENT_LABELS[m]}
              </ChoicePill>
            ))}
          </div>
          <PayBox fee={config.fee} number={payNumber} method={PAYMENT_LABELS[form.payment_method]} />
          <div className="grid gap-4 md:grid-cols-2">
            <TextField field="sender_number" label="যে নম্বর থেকে টাকা পাঠিয়েছেন" mobileLabel="যে নম্বর থেকে পাঠিয়েছেন" value={form.sender_number} onChange={(v) => set("sender_number", v)} error={errors.sender_number} placeholder="01XXXXXXXXX" type="tel" inter />
            <TextField field="trx_id" label="Transaction ID" value={form.trx_id} onChange={(v) => set("trx_id", v.toUpperCase())} error={errors.trx_id} placeholder="যেমন: 9KD7XXXXXX" inter className="uppercase" />
          </div>
        </section>

        {/* Mobile: marks & instructions folded away */}
        <details className="rounded-2xl border border-[#E2E8F0] bg-white p-4 md:hidden">
          <summary className="min-h-7 cursor-pointer text-base font-bold">মানবণ্টন ও নির্দেশনা দেখুন</summary>
          <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-[18px] text-sm leading-[1.55] text-[#334155]">
            <li>বাংলা ২৫ · গণিত ২৫ · ইংরেজি ২৫ · বিজ্ঞান/আইসিটি/সাধারণ জ্ঞান ২৫</li>
            {INSTRUCTIONS.filter((_, i) => i !== 1).map((t) => <li key={t}>{t}</li>)}
          </ul>
        </details>

        {/* Confirm + submit */}
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center md:rounded-[18px] md:border md:border-[#E2E8F0] md:bg-white md:px-7 md:py-[22px]">
          <label data-field="agree" className="flex gap-2.5 md:flex-[1_1_420px] px-1 text-sm leading-relaxed md:px-0 md:text-[15px]">
            <input type="checkbox" checked={form.agree} onChange={(e) => set("agree", e.target.checked)}
              className="mt-[3px] h-5 w-5 flex-none accent-[#0284C7] md:mt-1 md:h-[18px] md:w-[18px]" />
            <span>
              আমি নিশ্চিত করছি যে প্রদত্ত সকল তথ্য সঠিক।
              <span className="hidden md:inline"> ভুল তথ্যের কারণে আবেদন বাতিল হলে কর্তৃপক্ষ দায়ী থাকবে না।</span>
              {errors.agree && <span className="block text-[13px] text-[#DC2626]">{errors.agree}</span>}
            </span>
          </label>
          {errors.form && (
            <p role="alert" className="w-full rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[15px] text-[#B91C1C] md:order-last">
              {errors.form}
            </p>
          )}
          <div className="-mx-3 flex flex-col gap-2 border-t border-[#E2E8F0] bg-white px-4 pb-5 pt-3 md:mx-0 md:border-0 md:p-0">
            <button type="submit" disabled={submitting}
              className="inline-flex h-[54px] items-center justify-center gap-2 rounded-full bg-[#0284C7] px-8 text-lg font-bold text-white transition-colors hover:bg-[#0369A1] disabled:opacity-60">
              {submitting && <Loader2 size={18} className="animate-spin" />}
              {submitting ? "জমা হচ্ছে…" : "আবেদন জমা দিন →"}
            </button>
            {firstContact && (
              <span className="text-center text-[13px] text-[#64748B] md:hidden">
                সমস্যা হলে কল করুন:{" "}
                <a href={`tel:${firstContact.phone}`} className="font-inter font-semibold text-[#0284C7]">{formatPhone(firstContact.phone)}</a>
              </span>
            )}
          </div>
        </div>
      </form>

      <Sidebar config={config} />
    </div>
  );
}

function StepTracker({ step }: { step: number }) {
  const steps = ["শিক্ষার্থীর তথ্য", "শিক্ষা ও ঠিকানা", "পরীক্ষা কেন্দ্র", "ফি পরিশোধ"];
  return (
    <>
      <div className="flex flex-col gap-2.5 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3.5 md:hidden">
        <div className="flex justify-between text-sm">
          <span className="font-bold">ধাপ {toBn(step)} / ৪ · {steps[step - 1]}</span>
          <span className="text-[#64748B]">{toBn(step * 25)}%</span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {steps.map((s, i) => (
            <span key={s} className={"h-1.5 rounded-full " + (i < step ? "bg-[#0284C7]" : "bg-[#E2E8F0]")} />
          ))}
        </div>
      </div>
      <div className="hidden grid-cols-4 gap-2.5 rounded-[18px] border border-[#E2E8F0] bg-white px-[22px] py-[18px] text-sm md:grid">
        {steps.map((s, i) => {
          const active = i + 1 <= step;
          return (
            <div key={s} className="flex items-center gap-2">
              <span className={"flex h-7 w-7 flex-none items-center justify-center rounded-full font-bold " + (active ? "bg-[#0284C7] text-white" : "bg-[#E2E8F0] text-[#0F172A]")}>
                {toBn(i + 1)}
              </span>
              <span className={active ? "font-semibold" : "text-[#475569]"}>{s}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

function StepHeading({ n, title, desktopTitle }: { n: number; title: string; desktopTitle?: string }) {
  return (
    <>
      <h2 className="text-[19px] font-bold md:hidden">
        <span className="text-[#0284C7]">{toBn(n)}.</span> {title}
      </h2>
      <div className="hidden flex-col gap-1 md:flex">
        <span className="font-inter text-xs font-bold tracking-[.12em] text-[#0284C7]">STEP {n}</span>
        <h2 className="text-[22px] font-bold">{desktopTitle ?? title}</h2>
      </div>
    </>
  );
}

const Req = () => <span className="text-[#C2410C]">*</span>;

function ErrorText({ msg }: { msg?: string }) {
  return msg ? <span className="text-[13px] text-[#DC2626]">{msg}</span> : null;
}

function TextField({
  field, label, mobileLabel, value, onChange, error, placeholder, type = "text", inter, bengali, className = "",
}: {
  field: string;
  label: string;
  mobileLabel?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  inter?: boolean;
  bengali?: boolean;
  className?: string;
}) {
  return (
    <div data-field={field} className="flex flex-col gap-1.5">
      <label htmlFor={field} className="text-[15px] font-semibold">
        {mobileLabel ? (<><span className="md:hidden">{mobileLabel}</span><span className="hidden md:inline">{label}</span></>) : label} <Req />
      </label>
      <input
        id={field}
        type={type}
        inputMode={type === "tel" ? "numeric" : undefined}
        value={value}
        placeholder={placeholder}
        // Phonetic keyboards compose in Latin first, so only filter once composing ends.
        onChange={(e) =>
          onChange(bengali && !(e.nativeEvent as InputEvent).isComposing ? stripLatin(e.target.value) : e.target.value)
        }
        onCompositionEnd={bengali ? (e) => onChange(stripLatin(e.currentTarget.value)) : undefined}
        aria-invalid={!!error}
        className={"exam-field " + (inter ? "font-inter md:text-[15px] " : "") + className}
      />
      {bengali && !error && <span className="text-xs text-[#64748B]">বাংলায় লিখুন — ইংরেজি লেখা যাবে না</span>}
      <ErrorText msg={error} />
    </div>
  );
}

function ChoicePill({ name, checked, onChange, children, className = "" }: {
  name: string;
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label
      className={
        "flex h-[50px] cursor-pointer items-center justify-center gap-1.5 rounded-xl border text-base transition-colors md:h-[52px] md:gap-2 " +
        (checked
          ? "border-[#0284C7] bg-[#E6F6FD] font-bold shadow-[inset_0_0_0_1px_#0284C7]"
          : "border-[#CBD5E1] font-semibold hover:border-[#94A3B8]") +
        " " + className
      }
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="h-[18px] w-[18px] accent-[#0284C7]" />
      {children}
    </label>
  );
}

function PhotoField({ value, onChange, error }: { value: string; onChange: (url: string) => void; error?: string }) {
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function pick(file: File | undefined) {
    if (!file) return;
    setUploadError(null);
    if (!file.type.startsWith("image/")) return setUploadError("শুধু ছবি (JPG/PNG) দিন");
    if (file.size > 2 * 1024 * 1024) return setUploadError("ছবির সাইজ ২MB এর কম হতে হবে");
    if (!isUploadConfigured()) return setUploadError("ছবি আপলোড এখন চালু নেই — পরে চেষ্টা করুন");
    setBusy(true);
    try {
      onChange(await uploadImage(file, "pusab/exam"));
    } catch {
      setUploadError("ছবি আপলোড হয়নি — আবার চেষ্টা করুন");
    } finally {
      setBusy(false);
    }
  }

  const msg = uploadError ?? error;
  const preview = value ? (
    <img src={optimizeImage(value, 300)} alt="আপলোড করা ছবি" className="h-full w-full object-cover" />
  ) : null;
  const personIcon = (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="9" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </svg>
  );

  return (
    <div data-field="photo_url" className="flex flex-col gap-1.5 md:w-[168px] md:flex-none">
      <span className="hidden text-[15px] font-semibold md:block">ছবি <Req /></span>
      <label
        className={
          "relative flex cursor-pointer items-center gap-3.5 rounded-[14px] border-[1.5px] border-dashed bg-[#F0FAFE] p-3 md:h-[200px] md:flex-col md:justify-center md:gap-2 md:text-center " +
          (msg ? "border-[#DC2626]" : "border-[#03A9EC]")
        }
      >
        {/* mobile thumb */}
        <span className="flex h-[88px] w-[72px] flex-none items-center justify-center overflow-hidden rounded-[10px] bg-[#E2E8F0] md:hidden">
          {preview ?? personIcon}
        </span>
        {/* desktop */}
        {value ? (
          <span className="absolute inset-1.5 hidden overflow-hidden rounded-[10px] md:block">{preview}</span>
        ) : (
          <span className="hidden md:block">{personIcon}</span>
        )}
        <span className={"flex flex-col gap-1 " + (value ? "md:relative md:z-10 md:mt-auto md:rounded-full md:bg-white/90 md:px-3 md:py-1" : "")}>
          <strong className="text-[15px] text-[#0284C7] md:text-sm">
            {busy ? "আপলোড হচ্ছে…" : value ? "ছবি বদলান" : (<><span className="md:hidden">ছবি তুলুন / আপলোড করুন <Req /></span><span className="hidden md:inline">ছবি আপলোড</span></>)}
          </strong>
          {!value && <span className="text-[13px] text-[#64748B] md:text-xs">পাসপোর্ট সাইজ · <span className="hidden md:inline">JPG/PNG · </span>২MB পর্যন্ত</span>}
        </span>
        {busy && (
          <span className="absolute inset-0 grid place-items-center rounded-[14px] bg-white/60">
            <Loader2 className="animate-spin text-[#0284C7]" size={22} />
          </span>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      </label>
      <ErrorText msg={msg ?? undefined} />
    </div>
  );
}

function PayBox({ fee, number, method }: { fee: number; number: string; method: string }) {
  const [copied, setCopied] = useState(false);
  const shown = number || `[${method} নম্বর শীঘ্রই দেওয়া হবে]`;
  const copy = async () => {
    if (!number) return;
    try {
      await navigator.clipboard.writeText(number);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  };
  const copyBtn = (
    <button type="button" onClick={copy} disabled={!number}
      className="h-11 flex-none rounded-[10px] border border-[#FDBA74] bg-white px-3.5 text-sm font-semibold transition-colors hover:bg-[#FFF7ED] disabled:opacity-50 md:px-4">
      {copied ? "কপি হয়েছে ✓" : (<><span className="md:hidden">কপি</span><span className="hidden md:inline">কপি করুন</span></>)}
    </button>
  );
  return (
    <div className="flex flex-col gap-2.5 rounded-[14px] border border-[#FED7AA] bg-[#FFF7ED] p-3.5 md:flex-row md:flex-wrap md:items-center md:gap-3.5 md:px-[18px] md:py-4">
      <span className="text-sm leading-relaxed text-[#431407] md:flex-[1_1_320px] md:text-[15px]">
        <span className="md:hidden">এই নম্বরে <strong>{toBn(fee)} টাকা Send Money</strong> করুন:</span>
        <span className="hidden md:inline">নিচের নম্বরে <strong>{toBn(fee)} টাকা Send Money</strong> করুন, তারপর আপনার নম্বর ও Transaction ID লিখুন।</span>
      </span>
      <div className="flex items-center justify-between gap-2 md:contents">
        <span className={"font-inter font-extrabold tracking-[.04em] text-[#0F172A] " + (number ? "text-lg md:text-xl" : "text-[15px]")}>{shown}</span>
        {copyBtn}
      </div>
    </div>
  );
}

function Sidebar({ config }: { config: ExamConfig }) {
  return (
    <aside className="hidden min-w-0 flex-[1_1_320px] flex-col gap-4 md:flex">
      <section className="overflow-hidden rounded-[18px] border border-[#E2E8F0] bg-white">
        <h2 className="border-b border-[#E2E8F0] px-[22px] py-[18px] text-lg font-bold">মানবণ্টন (মোট ১০০)</h2>
        <div className="flex flex-col px-[22px] pb-4 pt-2 text-[15px]">
          {MARKS.map((m, i) => (
            <div key={m.subject} className={"flex justify-between gap-3 py-2.5 " + (i < MARKS.length - 1 ? "border-b border-[#F1F5F9]" : "")}>
              <span>{m.subject}</span>
              <strong>{toBn(m.marks)}</strong>
            </div>
          ))}
        </div>
      </section>
      <section className="flex flex-col gap-3 rounded-[18px] border border-[#E2E8F0] bg-white px-[22px] py-5">
        <h2 className="text-lg font-bold">জরুরি নির্দেশনা</h2>
        <ul className="flex list-disc flex-col gap-2 pl-[18px] text-[15px] leading-[1.55] text-[#334155]">
          {INSTRUCTIONS.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </section>
      {config.contacts.length > 0 && (
        <section className="flex flex-col gap-3 rounded-[18px] bg-[#0F172A] px-[22px] py-5 text-white">
          <h2 className="text-lg font-bold">যোগাযোগ</h2>
          {config.contacts.map((c) => (
            <div key={c.phone + c.name} className="flex flex-col gap-0.5">
              <span className="font-semibold">{c.name}</span>
              <span className="text-sm text-[#94A3B8]">{c.role}</span>
              <a href={`tel:${normalizePhone(c.phone)}`} className="font-inter text-[15px] font-semibold text-[#7DD3FC]">{formatPhone(c.phone)}</a>
            </div>
          ))}
          <Link to={EXAM_STATUS_PATH} className="mt-1 text-sm font-semibold text-[#7DD3FC]">
            আগে আবেদন করেছেন? অবস্থা দেখুন →
          </Link>
        </section>
      )}
    </aside>
  );
}
