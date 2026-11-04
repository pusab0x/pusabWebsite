import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  AuthProvider,
  useAuth,
  galleryApi,
  publicityApi,
  committeeApi,
  contactApi,
  examApi,
  ApiError,
  type GalleryItem,
  type PublicityPost,
  type EcMember,
} from "@/lib/api";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  LayoutDashboard,
  Image as ImageIcon,
  Newspaper,
  Users,
  LogOut,
  Loader2,
  Lock,
  Menu,
  X,
  ExternalLink,
  ArrowRight,
  ArrowUpRight,
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquare,
  UserCog,
  Settings as SettingsIcon,
  Award,
  Crown,
  ShieldCheck,
  Plus,
  Star,
  Quote,
  FileText,
  MessageSquareQuote,
  GalleryHorizontal,
  ChevronRight,
  ClipboardList,
  IdCard,
  SlidersHorizontal,
} from "lucide-react";
import logoPusab from "@/assets/logo-pusab.png";
import { StatCard, inputCls } from "@/components/dashboard/primitives";
import { MomentsSection } from "@/components/dashboard/MomentsSection";
import { PublicitySection } from "@/components/dashboard/PublicitySection";
import { CommitteeSection } from "@/components/dashboard/CommitteeSection";
import { MessagesSection } from "@/components/dashboard/MessagesSection";
import { JoinApplicationsSection } from "@/components/dashboard/JoinApplicationsSection";
import { LeadershipMessagesSection } from "@/components/dashboard/LeadershipMessagesSection";
import { UsersSection } from "@/components/dashboard/UsersSection";
import { SettingsSection } from "@/components/dashboard/SettingsSection";
import { FelicitationSection } from "@/components/dashboard/FelicitationSection";
import { ProgramPagesSection } from "@/components/dashboard/ProgramPagesSection";
import { TestimonialsSection } from "@/components/dashboard/TestimonialsSection";
import { PageHeroesSection } from "@/components/dashboard/PageHeroesSection";
import { ExamApplicationsSection } from "@/components/dashboard/exam/ExamApplicationsSection";
import { ExamAdmitCardsSection } from "@/components/dashboard/exam/ExamAdmitCardsSection";
import { ExamSettingsSection } from "@/components/dashboard/exam/ExamSettingsSection";

function Centered({ children }: { children: ReactNode }) {
  return (
    <div className="dash-theme grid min-h-screen place-items-center px-6 text-center">
      <div className="text-[#4B5E73]">{children}</div>
    </div>
  );
}

export function DashboardGate({ section, onPick }: { section: Section; onPick: (s: Section) => void }) {
  return (
    <AuthProvider>
      <DashboardGateInner section={section} onPick={onPick} />
    </AuthProvider>
  );
}

function DashboardGateInner({ section, onPick }: { section: Section; onPick: (s: Section) => void }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading)
    return (
      <Centered>
        <Loader2 className="mx-auto mb-3 animate-spin text-[#0369A1]" size={28} />
        <p className="text-sm">Loading…</p>
      </Centered>
    );
  if (!user) return <LoginScreen />;
  if (!isAdmin)
    return (
      <Centered>
        <div className="mx-auto max-w-sm rounded-[20px] border border-[#E1E9F2] bg-white px-8 py-10">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#FEECEC] text-[#DC2626]">
            <Lock size={24} />
          </div>
          <p className="text-lg font-bold text-[#0B1B2B]">Access denied</p>
          <p className="mt-2 text-sm leading-relaxed">
            Signed in as {user.email}. Ask a site admin to grant your account the admin role.
          </p>
        </div>
      </Centered>
    );
  return <DashboardShell section={section} onPick={onPick} />;
}

function BrandMark({ size = 42 }: { size?: number }) {
  return (
    <div
      className="grid shrink-0 place-items-center overflow-hidden rounded-full border-[3px] border-[#16A34A] bg-white"
      style={{ width: size, height: size }}
    >
      <img src={logoPusab} alt="PUSAB" className="h-[78%] w-[78%] object-contain" />
    </div>
  );
}

function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed — is the backend running?");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="dash-theme grid min-h-screen place-items-center px-6 py-10">
      <form onSubmit={submit} className="w-full max-w-[400px]">
        <div className="overflow-hidden rounded-[20px] border border-[#E1E9F2] bg-white shadow-[0_40px_80px_-40px_rgba(11,37,64,0.35)]">
          <div className="relative overflow-hidden bg-[#0B2540] px-8 py-7 text-white">
            <div
              className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border-[36px] border-[#0E3A63]"
              aria-hidden="true"
            />
            <div className="relative flex items-center gap-3">
              <BrandMark />
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-[0.02em]">PUSAB</span>
                <span className="text-[11px] tracking-[0.14em] text-[#8FAACB]">EST. 2014 · ADMIN</span>
              </div>
            </div>
            <h1 className="relative mt-6 text-2xl font-extrabold tracking-[-0.02em]">Sign in to the dashboard</h1>
            <p className="relative mt-1 text-sm text-[#C3D3E4]">Manage everything on pusab.net from one place.</p>
          </div>

          <div className="space-y-4 px-8 py-7">
            <label className="block">
              <span className="text-[13px] font-semibold text-[#4B5E73]">Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls + " h-11"}
                placeholder="you@example.com"
              />
            </label>
            <label className="block">
              <span className="text-[13px] font-semibold text-[#4B5E73]">Password</span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls + " h-11"}
                placeholder="••••••••"
              />
            </label>

            {error && (
              <div role="alert" className="rounded-xl border border-[#FBD5D5] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]">
                {error}
              </div>
            )}

            <button
              disabled={busy}
              className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0369A1] text-sm font-semibold text-white transition-colors hover:bg-[#075985] disabled:opacity-60"
            >
              {busy && <Loader2 size={16} className="animate-spin" />}
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </div>
        </div>

        <Link to="/" className="mt-5 block text-center text-sm font-medium text-[#0369A1] hover:text-[#075985]">
          ← Back to site
        </Link>
      </form>
    </div>
  );
}

export const NAV = [
  { key: "overview", label: "Overview", Icon: LayoutDashboard, group: "main" },
  { key: "exam-applications", label: "আবেদনসমূহ", Icon: ClipboardList, group: "exam" },
  { key: "exam-admit-cards", label: "প্রবেশপত্র ও রোল", Icon: IdCard, group: "exam" },
  { key: "exam-settings", label: "পরীক্ষার সেটিংস", Icon: SlidersHorizontal, group: "exam" },
  { key: "page-heroes", label: "Page Heroes", Icon: GalleryHorizontal, group: "content" },
  { key: "moments", label: "Moments", Icon: ImageIcon, group: "content" },
  { key: "publicity", label: "Publicity", Icon: Newspaper, group: "content" },
  { key: "leadership-messages", label: "Leadership Messages", Icon: Quote, group: "content" },
  { key: "program-pages", label: "Program Pages", Icon: FileText, group: "content" },
  { key: "felicitation", label: "Felicitation", Icon: Award, group: "content" },
  { key: "testimonials", label: "Testimonials", Icon: MessageSquareQuote, group: "content" },
  { key: "executive-committee", label: "Executive Committee", Icon: ShieldCheck, group: "people" },
  { key: "convening-committee", label: "Convening Committee", Icon: Star, group: "people" },
  { key: "honor-board", label: "Honor Board", Icon: Crown, group: "people" },
  { key: "messages", label: "Messages", Icon: MessageSquare, group: "system" },
  { key: "join-applications", label: "Join Applications", Icon: Users, group: "system" },
  { key: "users", label: "Users", Icon: UserCog, group: "system" },
  { key: "settings", label: "Settings", Icon: SettingsIcon, group: "system" },
] as const;

export type Section = (typeof NAV)[number]["key"];

export const SECTION_KEYS = NAV.map((n) => n.key) as Section[];

export function isSection(value: string): value is Section {
  return (SECTION_KEYS as string[]).includes(value);
}

const GROUP_LABELS: Record<string, string> = {
  main: "",
  exam: "মেধাবৃত্তি পরীক্ষা",
  content: "Website content",
  people: "People",
  system: "Inbox & system",
};

type Badges = Partial<Record<Section, number>>;

function NavList({
  section,
  onPick,
  badges,
}: {
  section: Section;
  onPick: (s: Section) => void;
  badges?: Badges;
}) {
  const groups = Object.keys(GROUP_LABELS);
  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => {
        const items = NAV.filter((n) => n.group === group);
        return (
          <div key={group} className="flex flex-col gap-0.5">
            {GROUP_LABELS[group] && (
              <span className="px-3 pb-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-[#8FAACB]">
                {GROUP_LABELS[group]}
              </span>
            )}
            {items.map(({ key, label, Icon }) => {
              const active = section === key;
              const badge = badges?.[key];
              const highlight = key === "messages" || key === "exam-applications";
              return (
                <button
                  key={key}
                  onClick={() => onPick(key)}
                  aria-current={active ? "page" : undefined}
                  className={
                    "group flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8] " +
                    (active
                      ? "bg-[#0369A1] font-semibold text-white"
                      : "text-[#C3D3E4] hover:bg-[#102F50] hover:text-white")
                  }
                >
                  <Icon
                    size={17}
                    strokeWidth={active ? 2.2 : 1.8}
                    className={"shrink-0 " + (active ? "text-white" : "text-[#8FAACB] group-hover:text-[#C3D3E4]")}
                  />
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                  {badge ? (
                    <span
                      className={
                        "rounded-full px-2 py-px text-xs tabular-nums " +
                        (active
                          ? "bg-white/20 text-white"
                          : highlight
                            ? "bg-[#0EA5E9] font-semibold text-[#04203A]"
                            : "bg-[#16385C] text-[#C3D3E4]")
                      }
                    >
                      {badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function UserFooter({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const initials = email.slice(0, 2).toUpperCase();
  return (
    <div className="flex items-center gap-3 rounded-xl bg-[#102F50] p-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#38BDF8] text-[13px] font-extrabold text-[#0B2540]">
        {initials}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[13px] font-semibold text-white">{email}</span>
        <span className="text-xs text-[#8FAACB]">Administrator</span>
      </div>
      <button
        type="button"
        onClick={onSignOut}
        aria-label="Sign out"
        title="Sign out"
        className="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] text-[#C3D3E4] transition-colors hover:bg-[#16385C] hover:text-white"
      >
        <LogOut size={18} strokeWidth={1.8} />
      </button>
    </div>
  );
}

function Sidebar({
  section,
  onPick,
  badges,
  email,
  onSignOut,
  onClose,
}: {
  section: Section;
  onPick: (s: Section) => void;
  badges: Badges;
  email: string;
  onSignOut: () => void;
  onClose?: () => void;
}) {
  return (
    <nav aria-label="Dashboard" className="flex h-full flex-col gap-6 bg-[#0B2540] px-4 py-6 text-sm text-[#C3D3E4]">
      <div className="flex items-center gap-3 border-b border-[#16385C] px-2 pb-[18px]">
        <BrandMark />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-base font-extrabold tracking-[0.02em] text-white">PUSAB</span>
          <span className="text-[11px] tracking-[0.14em] text-[#8FAACB]">EST. 2014 · ADMIN</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="grid h-10 w-10 place-items-center rounded-[10px] text-[#C3D3E4] hover:bg-[#102F50] hover:text-white"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="dash-scroll -mx-1 flex-1 overflow-y-auto px-1">
        <NavList section={section} onPick={onPick} badges={badges} />
      </div>

      <UserFooter email={email} onSignOut={onSignOut} />
    </nav>
  );
}

function DashboardShell({ section, onPick }: { section: Section; onPick: (s: Section) => void }) {
  const { user, signOut } = useAuth();
  const [drawer, setDrawer] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unread, setUnread] = useState(0);
  const [counts, setCounts] = useState<{ moments?: number; publicity?: number }>({});
  const [examPending, setExamPending] = useState(0);
  const active = NAV.find((n) => n.key === section)!;
  const email = user?.email ?? "";

  useEffect(() => {
    let alive = true;
    contactApi
      .listAll({})
      .then((msgs) => alive && setUnread(msgs.filter((m) => !m.is_read).length))
      .catch(() => {});
    examApi
      .stats()
      .then((s) => alive && setExamPending(s.pending))
      .catch(() => {});
    Promise.all([galleryApi.listAll(), publicityApi.listAll()])
      .then(([m, p]) => alive && setCounts({ moments: m.length, publicity: p.length }))
      .catch(() => {});
    return () => { alive = false; };
  }, [section]);

  const badges: Badges = {
    messages: unread,
    moments: counts.moments,
    publicity: counts.publicity,
    "exam-applications": examPending,
  };

  const pick = (s: Section) => {
    setDrawer(false);
    onPick(s);
  };

  return (
    <div className="dash-theme flex min-h-screen">
      {/* ── Desktop sidebar ───────────────────────────────────── */}
      <aside
        className={
          "sticky top-0 hidden h-screen w-64 shrink-0 " + (sidebarOpen ? "lg:block" : "lg:hidden")
        }
      >
        <Sidebar section={section} onPick={pick} badges={badges} email={email} onSignOut={signOut} />
      </aside>

      {/* ── Mobile drawer ─────────────────────────────────────── */}
      <AnimatePresence>
        {drawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawer(false)}
            className="fixed inset-0 z-[120] bg-[#0B2540]/50 backdrop-blur-[2px] lg:hidden"
          >
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              onClick={(e) => e.stopPropagation()}
              className="h-full w-72 max-w-[85vw]"
            >
              <Sidebar
                section={section}
                onPick={pick}
                badges={badges}
                email={email}
                onSignOut={signOut}
                onClose={() => setDrawer(false)}
              />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main content ──────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-[#E1E9F2] bg-[#F3F7FB]/85 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-4 px-5 sm:px-9">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setDrawer(true)}
                aria-label="Open menu"
                className="grid h-10 w-10 place-items-center rounded-full border border-[#E1E9F2] bg-white text-[#0B1B2B] lg:hidden"
              >
                <Menu size={18} />
              </button>
              <button
                onClick={() => setSidebarOpen((v) => !v)}
                aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
                title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
                className="hidden h-10 w-10 place-items-center rounded-full border border-[#E1E9F2] bg-white text-[#4B5E73] transition-colors hover:text-[#0B1B2B] lg:grid"
              >
                {sidebarOpen ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
              </button>
              <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
                <button
                  onClick={() => pick("overview")}
                  className="hidden text-[#4B5E73] hover:text-[#0369A1] sm:inline"
                >
                  Dashboard
                </button>
                <ChevronRight size={14} className="hidden shrink-0 text-[#8A9BB0] sm:block" />
                <span className="truncate font-semibold text-[#0B1B2B]">{active.label}</span>
              </nav>
            </div>
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-[#D5E1EE] bg-white px-4 text-sm font-semibold text-[#0B1B2B] transition-colors hover:border-[#0369A1] hover:text-[#0369A1]"
            >
              View site <ExternalLink size={14} />
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1240px] flex-1 px-5 pb-12 pt-6 sm:px-9">
          {section === "overview" && <Overview onJump={pick} />}
          {section === "exam-applications" && <ExamApplicationsSection />}
          {section === "exam-admit-cards" && <ExamAdmitCardsSection />}
          {section === "exam-settings" && <ExamSettingsSection />}
          {section === "page-heroes" && <PageHeroesSection />}
          {section === "moments" && <MomentsSection />}
          {section === "publicity" && <PublicitySection />}
          {section === "executive-committee" && <CommitteeSection view="executive-committee" />}
          {section === "honor-board" && <CommitteeSection view="honor-board" />}
          {section === "convening-committee" && <CommitteeSection view="convening-committee" />}
          {section === "leadership-messages" && <LeadershipMessagesSection />}
          {section === "program-pages" && <ProgramPagesSection />}
          {section === "felicitation" && <FelicitationSection />}
          {section === "testimonials" && <TestimonialsSection />}
          {section === "messages" && <MessagesSection />}
          {section === "join-applications" && <JoinApplicationsSection />}
          {section === "users" && <UsersSection />}
          {section === "settings" && <SettingsSection />}
        </main>
      </div>
    </div>
  );
}

interface OverviewData {
  moments: GalleryItem[];
  publicity: PublicityPost[];
  members: EcMember[];
  committee: { count: number; current: number; sessions: number };
}

const SKY = "#0EA5E9";
const SKY_DEEP = "#0369A1";

function monthKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string, withYear: boolean) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(
    "en-GB",
    withYear ? { month: "short", year: "2-digit" } : { month: "short" },
  );
}

const QUICK_ACTIONS = [
  { key: "moments", label: "Upload photos to Moments", Icon: ImageIcon },
  { key: "publicity", label: "Write a publicity post", Icon: Newspaper },
  { key: "executive-committee", label: "Add committee member", Icon: Users },
  { key: "page-heroes", label: "Edit homepage hero", Icon: GalleryHorizontal },
] as const;

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={"min-w-0 rounded-2xl border border-[#E1E9F2] bg-white p-6 " + className}>
      {children}
    </section>
  );
}

function CreateMenu({ onJump }: { onJump: (s: Section) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex h-[46px] items-center gap-2 rounded-full bg-[#0EA5E9] px-5 text-sm font-bold text-[#04203A] transition-colors hover:bg-[#38BDF8]"
      >
        <Plus size={16} strokeWidth={2.6} /> Create new
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-[calc(100%+8px)] z-30 w-64 rounded-2xl border border-[#E1E9F2] bg-white p-1.5 text-[#0B1B2B] shadow-[0_24px_48px_-16px_rgba(11,37,64,0.35)]"
          >
            {QUICK_ACTIONS.map(({ key, label, Icon }) => (
              <button
                key={key}
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onJump(key);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-[#F0F7FD]"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#EEF4FA] text-[#0369A1]">
                  <Icon size={15} />
                </span>
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Overview({ onJump }: { onJump: (s: Section) => void }) {
  const [data, setData] = useState<OverviewData | null>(null);
  const [range, setRange] = useState<6 | 12>(6);

  useEffect(() => {
    let alive = true;
    Promise.all([
      galleryApi.listAll(),
      publicityApi.listAll(),
      committeeApi.listAll(),
    ]).then(([moments, publicity, c]) => {
      if (!alive) return;
      setData({
        moments,
        publicity,
        members: c,
        committee: {
          count: c.length,
          current: c.filter((m) => m.is_current).length,
          sessions: new Set(c.map((m) => m.year)).size,
        },
      });
    });
    return () => { alive = false; };
  }, []);

  const pub = data?.publicity ?? [];
  const published = pub.filter((p) => p.published).length;

  const recent = data
    ? [
        ...data.publicity.map((p) => ({
          id: `p${p.id}`, kind: "Publicity", title: p.title, at: p.created_at, image: p.image_url, section: "publicity" as Section,
        })),
        ...data.moments.map((m) => ({
          id: `m${m.id}`, kind: "Moment", title: m.title || "Untitled photo", at: m.created_at, image: m.image_url, section: "moments" as Section,
        })),
      ]
        .sort((a, b) => +new Date(b.at) - +new Date(a.at))
        .slice(0, 6)
    : [];

  const loading = data === null;
  const now = useMemo(() => new Date(), []);
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Content added per month — moments + publicity.
  const activityTrend = useMemo(() => {
    if (!data) return [];
    const months: string[] = [];
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
    const buckets = new Map(months.map((m) => [m, { moments: 0, publicity: 0 }]));
    for (const m of data.moments) {
      const b = buckets.get(monthKey(m.created_at));
      if (b) b.moments++;
    }
    for (const p of data.publicity) {
      const b = buckets.get(monthKey(p.created_at));
      if (b) b.publicity++;
    }
    return months.map((m) => ({ month: monthLabel(m, range === 12), ...buckets.get(m)! }));
  }, [data, now, range]);

  const periodTotal = activityTrend.reduce((n, m) => n + m.moments + m.publicity, 0);

  const committeeByYear = useMemo(() => {
    if (!data) return [];
    const counts = new Map<number, number>();
    for (const m of data.members) counts.set(m.year, (counts.get(m.year) ?? 0) + 1);
    return [...counts.entries()]
      .sort((a, b) => a[0] - b[0])
      .slice(-6)
      .map(([year, count]) => ({ year: String(year), members: count }));
  }, [data]);

  const activityConfig: ChartConfig = {
    moments: { label: "Photos", color: SKY },
    publicity: { label: "Publicity", color: SKY_DEEP },
  };

  const committeeConfig: ChartConfig = {
    members: { label: "Members", color: SKY },
  };

  const sitePages = [
    { label: "Leadership", to: "/leadership" },
    { label: "Honor Board", to: "/honor-board" },
    { label: "Programs", to: "/programs" },
    { label: "Moments", to: "/moments" },
  ];

  return (
    <div className="flex flex-col gap-[22px]">
      {/* Welcome banner */}
      <div className="relative flex flex-wrap items-center gap-5 overflow-hidden rounded-[20px] bg-[#0B2540] px-6 py-7 text-white sm:px-8">
        <div
          className="pointer-events-none absolute -right-[60px] -top-20 h-[280px] w-[280px] rounded-full border-[40px] border-[#0E3A63]"
          aria-hidden="true"
        />
        <div className="relative flex min-w-0 flex-[1_1_360px] flex-col gap-2">
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-[#123A61] px-3 py-1 text-xs text-[#CFE3F5]">
            <span className="h-[7px] w-[7px] rounded-full bg-[#38BDF8]" />
            {now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </span>
          <h1 className="text-[26px] font-extrabold tracking-[-0.02em] sm:text-[30px]">{greeting}, Admin</h1>
          <p className="text-[15px] text-[#C3D3E4]">
            Keep Bishwambarpur’s story fresh — here’s the state of pusab.net.
          </p>
        </div>
        <div className="relative flex flex-wrap gap-2.5">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-[46px] items-center gap-1.5 rounded-full border border-[#3B5E83] px-[18px] text-sm font-semibold text-white transition-colors hover:border-[#8FAACB] hover:bg-white/5"
          >
            View site <ArrowUpRight size={15} />
          </Link>
          <CreateMenu onJump={onJump} />
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
        <StatCard label="Photos" tone="sky"
          value={loading ? "—" : data!.moments.length}
          sub="In the Moments gallery" onClick={() => onJump("moments")} />
        <StatCard label="Publicity posts" tone="green"
          value={loading ? "—" : pub.length}
          sub={loading ? "" : `${published} published · ${pub.length - published} drafts`}
          onClick={() => onJump("publicity")} />
        <StatCard label="Committee" tone="red"
          value={loading ? "—" : data!.committee.count}
          sub={loading ? "" : (
            <>
              {data!.committee.sessions} sessions · <strong className="text-[#0B1B2B]">{data!.committee.current} current</strong>
            </>
          )}
          onClick={() => onJump("executive-committee")} />
      </div>

      {/* Activity chart + quick actions */}
      <div className="flex flex-wrap gap-4">
        <Card className="flex flex-[2_1_460px] flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[17px] font-bold">Content activity</h2>
              <span className="text-[13px] text-[#4B5E73]">
                New items added, last {range === 6 ? "6 months" : "12 months"}
                {!loading && <> · <strong className="text-[#0B1B2B]">{periodTotal}</strong> total</>}
              </span>
            </div>
            <div role="group" aria-label="Range" className="flex gap-1 rounded-full bg-[#EEF4FA] p-1">
              {([6, 12] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={range === r}
                  onClick={() => setRange(r)}
                  className={
                    "h-8 rounded-full px-3.5 text-[13px] transition-colors " +
                    (range === r ? "bg-[#0369A1] font-semibold text-white" : "text-[#4B5E73] hover:text-[#0B1B2B]")
                  }
                >
                  {r === 6 ? "6 months" : "1 year"}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="h-[220px] animate-pulse rounded-xl bg-[#F0F7FD]" />
          ) : periodTotal === 0 ? (
            <p className="grid h-[220px] place-items-center text-sm text-[#4B5E73]">No activity in this period yet.</p>
          ) : (
            <>
              <ChartContainer config={activityConfig} className="aspect-auto h-[220px] w-full">
                <BarChart data={activityTrend} margin={{ left: -20, right: 4, top: 8 }} barCategoryGap="22%">
                  <CartesianGrid vertical={false} stroke="#E1E9F2" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} allowDecimals={false} width={32} />
                  <ChartTooltip cursor={{ fill: "#F0F7FD" }} content={<ChartTooltipContent indicator="dot" />} />
                  <Bar dataKey="moments" stackId="a" fill={SKY} radius={[0, 0, 2, 2]} maxBarSize={56} />
                  <Bar dataKey="publicity" stackId="a" fill={SKY_DEEP} radius={[10, 10, 0, 0]} maxBarSize={56} />
                </BarChart>
              </ChartContainer>
              <div className="flex gap-5 text-[13px] text-[#4B5E73]">
                <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#0EA5E9]" />Photos</span>
                <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#0369A1]" />Publicity</span>
              </div>
            </>
          )}
        </Card>

        <Card className="flex flex-[1_1_280px] flex-col gap-2.5">
          <h2 className="mb-1 text-[17px] font-bold">Quick actions</h2>
          {QUICK_ACTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onJump(key)}
              className="group flex items-center justify-between rounded-xl bg-[#F0F7FD] px-4 py-3.5 text-left text-sm font-semibold text-[#0B1B2B] transition-colors hover:bg-[#E1EEF9]"
            >
              {label}
              <ArrowRight size={16} className="shrink-0 text-[#0369A1] transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
        </Card>
      </div>

      {/* Recent activity + committee */}
      <div className="flex flex-wrap gap-4">
        <section className="min-w-0 flex-[2_1_460px] overflow-hidden rounded-2xl border border-[#E1E9F2] bg-white">
          <div className="flex items-center justify-between gap-4 px-6 pb-3 pt-6">
            <div>
              <h2 className="text-[17px] font-bold">Recent activity</h2>
              <span className="text-[13px] text-[#4B5E73]">Latest photos and posts</span>
            </div>
          </div>
          {loading ? (
            <div className="space-y-2 px-6 pb-6">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-[#F0F7FD]" style={{ animationDelay: `${i * 60}ms` }} />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <p className="px-6 pb-10 pt-6 text-center text-sm text-[#4B5E73]">Nothing yet.</p>
          ) : (
            <ul className="px-3 pb-3">
              {recent.map((r) => (
                <li key={r.id}>
                  <button
                    onClick={() => onJump(r.section)}
                    className="group flex w-full items-center gap-3.5 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[#F0F7FD]"
                  >
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-[10px] bg-[#EEF4FA]">
                      {r.image ? (
                        <img src={r.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-[#8FAACB]">
                          <ImageIcon size={16} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#0B1B2B]">{r.title}</p>
                      <p className="mt-0.5 text-xs text-[#4B5E73]">
                        {new Date(r.at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <span
                      className={
                        "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold " +
                        (r.kind === "Moment" ? "bg-[#E0F2FE] text-[#0369A1]" : "bg-[#DCFCE7] text-[#15803D]")
                      }
                    >
                      {r.kind}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex min-w-0 flex-[1_1_280px] flex-col gap-4">
          {!loading && committeeByYear.length > 1 && (
            <Card>
              <h2 className="text-[17px] font-bold">Committee by session</h2>
              <span className="text-[13px] text-[#4B5E73]">Members in recent sessions</span>
              <ChartContainer config={committeeConfig} className="mt-3 aspect-auto h-[160px] w-full">
                <BarChart data={committeeByYear} margin={{ left: -24, right: 4, top: 8 }}>
                  <CartesianGrid vertical={false} stroke="#E1E9F2" />
                  <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={6} fontSize={11} allowDecimals={false} width={30} />
                  <ChartTooltip cursor={{ fill: "#F0F7FD" }} content={<ChartTooltipContent indicator="dot" />} />
                  <Bar dataKey="members" fill={SKY} radius={[8, 8, 2, 2]} maxBarSize={32} />
                </BarChart>
              </ChartContainer>
            </Card>
          )}

          <Card className="p-0">
            <h2 className="px-6 pb-2 pt-5 text-[17px] font-bold">View site pages</h2>
            <div className="px-3 pb-3">
              {sitePages.map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  target="_blank"
                  className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-[#0B1B2B] transition-colors hover:bg-[#F0F7FD] hover:text-[#0369A1]"
                >
                  {label} <ExternalLink size={14} className="text-[#8FAACB]" />
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
