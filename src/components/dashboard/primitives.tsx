import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Pencil, Trash2, Search, AlertTriangle, ChevronDown } from "lucide-react";

export const inputCls =
  "mt-1.5 w-full rounded-[10px] border border-[#E1E9F2] bg-white px-3.5 py-2.5 text-sm text-[#0B1B2B] outline-none transition-[border-color,box-shadow] placeholder:text-[#8A9BB0] hover:border-[#C9D7E6] focus:border-[#0369A1] focus:ring-4 focus:ring-[#0EA5E9]/15";

export function Field({
  label,
  children,
  full,
  hint,
}: {
  label: string;
  children: ReactNode;
  full?: boolean;
  hint?: string;
}) {
  return (
    <label className={"block " + (full ? "sm:col-span-2" : "")}>
      <span className="text-[13px] font-semibold text-[#4B5E73]">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-[#6B7E93]">{hint}</span>}
    </label>
  );
}

export function SectionHeader({
  title,
  subtitle,
  count,
  onNew,
  newLabel = "Add new",
}: {
  title: string;
  subtitle?: string;
  count?: number;
  onNew: () => void;
  newLabel?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E1E9F2] bg-white px-6 py-5">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <h2 className="text-[22px] font-extrabold tracking-[-0.02em] text-[#0B1B2B]">{title}</h2>
          {count !== undefined && (
            <span className="rounded-full bg-[#EEF4FA] px-2.5 py-0.5 text-xs font-semibold tabular-nums text-[#0369A1]">
              {count}
            </span>
          )}
        </div>
        {subtitle && <p className="mt-1 text-sm text-[#4B5E73]">{subtitle}</p>}
      </div>
      <button
        onClick={onNew}
        className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0369A1] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#075985] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0EA5E9]/30 active:scale-[0.98]"
      >
        <Plus size={16} strokeWidth={2.5} /> {newLabel}
      </button>
    </div>
  );
}

export function Toolbar({
  query,
  onQuery,
  placeholder = "Search…",
  children,
}: {
  query: string;
  onQuery: (v: string) => void;
  placeholder?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-3">
      <div className="relative min-w-[200px] flex-1">
        <Search
          size={14}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7E93]"
        />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded-full border border-[#E1E9F2] bg-white pl-11 pr-4 text-sm outline-none transition-[border-color,box-shadow] placeholder:text-[#8A9BB0] hover:border-[#C9D7E6] focus:border-[#0369A1] focus:ring-4 focus:ring-[#0EA5E9]/15"
        />
      </div>
      {children}
    </div>
  );
}

export function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 appearance-none rounded-full border border-[#E1E9F2] bg-white pl-4 pr-9 text-sm font-medium text-[#0B1B2B] outline-none transition-[border-color,box-shadow] hover:border-[#C9D7E6] focus:border-[#0369A1] focus:ring-4 focus:ring-[#0EA5E9]/15"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={13}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4B5E73]"
      />
    </div>
  );
}

export function EmptyState({ label, icon }: { label: string; icon?: ReactNode }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-[#C9D7E6] bg-white py-20 text-center">
      <div className="flex max-w-sm flex-col items-center gap-4 px-6">
        {icon && (
          <div className="grid h-14 w-14 place-items-center rounded-full bg-[#EEF4FA] text-[#0369A1]">
            {icon}
          </div>
        )}
        <p className="text-sm font-medium text-[#4B5E73]">{label}</p>
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-2xl border border-border bg-[var(--color-surface)] p-4"
        >
          <div className="h-10 w-10 animate-pulse rounded-xl bg-border" />
          <div className="flex-1 space-y-2">
            <div
              className="h-3 w-2/5 animate-pulse rounded-full bg-border"
              style={{ animationDelay: `${i * 60}ms` }}
            />
            <div
              className="h-2.5 w-3/5 animate-pulse rounded-full bg-border/70"
              style={{ animationDelay: `${i * 60 + 80}ms` }}
            />
          </div>
          <div className="h-8 w-16 animate-pulse rounded-xl bg-border" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonGrid({ cols = 4, rows = 8 }: { cols?: number; rows?: number }) {
  const colClass = cols === 3 ? "lg:grid-cols-3" : cols === 2 ? "lg:grid-cols-2" : "lg:grid-cols-4";
  return (
    <div className={"grid gap-4 sm:grid-cols-2 " + colClass}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-border bg-[var(--color-surface)]"
          style={{ height: 180, animationDelay: `${i * 40}ms` }}
        />
      ))}
    </div>
  );
}

const STAT_TONES = {
  sky: "#0EA5E9",
  green: "#16A34A",
  red: "#DC2626",
  navy: "#0369A1",
} as const;

export function StatCard({
  label,
  value,
  icon,
  sub,
  onClick,
  accent,
  fill,
  tone,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  sub?: ReactNode;
  onClick?: () => void;
  accent?: boolean;
  /** Stretch to fill the height of its grid cell — for bento-style layouts. */
  fill?: boolean;
  /** Colour of the status dot beside the label. */
  tone?: keyof typeof STAT_TONES;
}) {
  const Tag = onClick ? "button" : "div";
  const dot = STAT_TONES[tone ?? (accent ? "red" : "sky")];
  return (
    <Tag
      onClick={onClick}
      className={
        "group relative flex w-full flex-col gap-3 rounded-2xl border border-[#E1E9F2] bg-white p-5 text-left transition-all " +
        (fill ? "h-full " : "") +
        (onClick
          ? "cursor-pointer hover:-translate-y-0.5 hover:border-[#BAE6FD] hover:shadow-[0_12px_32px_-16px_rgba(11,37,64,0.25)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0EA5E9]/25"
          : "")
      }
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-[13px] font-semibold text-[#4B5E73]">
          {icon && <span className="text-[#8A9BB0] [&>svg]:h-4 [&>svg]:w-4">{icon}</span>}
          {label}
        </span>
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: dot }} />
      </div>
      <p className="text-[36px] font-extrabold leading-none tracking-[-0.02em] tabular-nums text-[#0B1B2B]">{value}</p>
      {sub && <div className={"text-[13px] text-[#4B5E73] " + (fill ? "mt-auto" : "")}>{sub}</div>}
    </Tag>
  );
}

export function CardActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onEdit}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#4B5E73] transition-colors hover:bg-[#EEF4FA] hover:text-[#0369A1]"
        aria-label="Edit"
      >
        <Pencil size={15} />
      </button>
      <button
        onClick={onDelete}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#4B5E73] transition-colors hover:bg-[#FEECEC] hover:text-[#DC2626]"
        aria-label="Delete"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  onSubmit,
  saving,
  submitLabel = "Save changes",
  hideFooter,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit: () => void;
  saving?: boolean;
  submitLabel?: string;
  /** Hide Cancel/Save — for a picker step where choosing an option advances instead. */
  hideFooter?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[200] flex items-end justify-center bg-[#0B2540]/60 p-0 backdrop-blur-[3px] sm:items-center sm:p-6"
        >
          <motion.form
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
            className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-[20px] bg-white shadow-[0_40px_80px_-24px_rgba(11,37,64,0.45)] sm:rounded-[20px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-4 border-b border-[#E1E9F2] px-6 py-5">
              <div className="flex items-center gap-3">
                <span className="h-6 w-1 rounded-full bg-[#0EA5E9]" aria-hidden="true" />
                <h3 className="text-lg font-bold tracking-[-0.015em] text-[#0B1B2B]">{title}</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-full bg-[#F0F7FD] text-[#4B5E73] transition-colors hover:bg-[#E1EEF9] hover:text-[#0B1B2B]"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="grid gap-x-5 gap-y-5 overflow-y-auto px-6 py-6 sm:grid-cols-2">
              {children}
            </div>

            {/* Footer */}
            {!hideFooter && (
              <div className="flex items-center justify-end gap-2.5 border-t border-[#E1E9F2] bg-[#F7FAFD] px-6 py-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-11 rounded-full border border-[#D5E1EE] bg-white px-5 text-sm font-semibold text-[#4B5E73] transition-colors hover:border-[#B8CADD] hover:text-[#0B1B2B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-11 rounded-full bg-[#0369A1] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#075985] disabled:opacity-50 active:scale-[0.98]"
                >
                  {saving ? "Saving…" : submitLabel}
                </button>
              </div>
            )}
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useConfirm() {
  const [state, setState] = useState<{
    message: string;
    title: string;
    resolve: (ok: boolean) => void;
  } | null>(null);

  const confirm = (message: string, title = "Are you sure?") =>
    new Promise<boolean>((resolve) => setState({ message, title, resolve }));

  const close = (ok: boolean) => {
    state?.resolve(ok);
    setState(null);
  };

  const element = (
    <AnimatePresence>
      {state && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => close(false)}
          className="fixed inset-0 z-[210] grid place-items-center bg-[#0B2540]/60 p-6 backdrop-blur-[3px]"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm overflow-hidden rounded-[20px] bg-white shadow-[0_40px_80px_-24px_rgba(11,37,64,0.45)]"
          >
            <div className="px-6 pt-7 pb-6 text-center">
              <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-[#FEECEC] text-[#DC2626]">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#0B1B2B]">{state.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#4B5E73]">{state.message}</p>
            </div>
            <div className="flex gap-2.5 border-t border-[#E1E9F2] bg-[#F7FAFD] px-6 py-4">
              <button
                onClick={() => close(false)}
                className="h-11 flex-1 rounded-full border border-[#D5E1EE] bg-white text-sm font-semibold text-[#4B5E73] transition-colors hover:border-[#B8CADD] hover:text-[#0B1B2B]"
              >
                Cancel
              </button>
              <button
                onClick={() => close(true)}
                className="h-11 flex-1 rounded-full bg-[#DC2626] text-sm font-semibold text-white transition-colors hover:bg-[#B91C1C] active:scale-[0.98]"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return [confirm, element] as const;
}
