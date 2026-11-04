import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Menu, X, ChevronDown, ChevronRight, Heart } from "lucide-react";
import { NAV_LINKS, SITE } from "@/lib/site-content";
import { committeeApi } from "@/lib/api";
import { ecOrdinal } from "@/routes/ec.$year";
import logoPusab from "@/assets/logo-pusab.png";
import {
  ANNOUNCEMENT_BAR_H,
  ExamAnnouncementBar,
  ExamNavButton,
  useExamPromo,
} from "@/components/site/ExamHome";
import { EXAM_PATH, EXAM_STATUS_PATH } from "@/lib/exam";

type NavChild = { to: string; label: string; children?: readonly NavChild[] };
type NavItem = { to: string; label: string; children?: readonly NavChild[] };

/**
 * Leadership dropdown. Top-level items with children (Executive Committee)
 * open ONE flyout panel to the right. Inside that flyout, a deeper group
 * (Previous EC) expands its sessions inline as an accordion — so the menu
 * is never more than two panels wide and never overflows the viewport.
 */
function LeadershipMenu({
  items,
  expanded,
  setExpanded,
  pathname,
  onClose,
}: {
  items: readonly NavChild[];
  expanded: string[];
  setExpanded: (p: string[]) => void;
  pathname: string;
  onClose: () => void;
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
  };
  const openKey = (key: string) => {
    cancel();
    setExpanded([key]);
  };
  const scheduleClose = () => {
    cancel();
    timer.current = setTimeout(() => setExpanded([]), 160);
  };

  const leaf = (item: NavChild, pad: string) => {
    const active = pathname.startsWith(item.to);
    return (
      <Link
        to={item.to}
        onClick={onClose}
        className={
          "block rounded-xl py-2.5 text-sm font-medium transition-colors " +
          pad +
          " " +
          (active
            ? "bg-[var(--color-surface-2)] text-[var(--color-accent-1)]"
            : "text-foreground/75 hover:bg-[var(--color-surface-2)] hover:text-foreground")
        }
      >
        {item.label}
      </Link>
    );
  };

  // A group rendered INSIDE the flyout that expands its children downward.
  const InlineGroup = ({ group, parentTo }: { group: NavChild; parentTo: string }) => {
    const sessions: readonly NavChild[] =
      "children" in group && group.children ? group.children : [];
    const key = "sub:" + group.label;
    const open = expanded.includes(key);
    return (
      <li
        onMouseEnter={() => setExpanded([parentTo, key])}
        onMouseLeave={() => setExpanded([parentTo])}
      >
        <button
          type="button"
          className={
            "flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors " +
            (open
              ? "bg-[var(--color-surface-2)] text-foreground"
              : "text-foreground/75 hover:bg-[var(--color-surface-2)] hover:text-foreground")
          }
        >
          {group.label}
          <ChevronDown
            size={14}
            className={"opacity-50 transition-transform duration-200 " + (open ? "rotate-180" : "")}
          />
        </button>
        <AnimatePresence initial={false}>
          {open && sessions.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="ml-3.5 mt-0.5 space-y-0.5 border-l border-border pl-2">
                {sessions.map((s) => (
                  <div key={s.to + s.label}>{leaf(s, "px-3")}</div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </li>
    );
  };

  return (
    <ul
      className="min-w-[230px] rounded-2xl border border-border bg-[var(--color-surface)] p-1.5 shadow-[0_24px_50px_-20px_rgba(15,23,42,0.45)]"
      onMouseEnter={cancel}
    >
      {items.map((item) => {
        const hasChildren = "children" in item && item.children && item.children.length > 0;

        if (!hasChildren) {
          return <li key={item.to + item.label}>{leaf(item, "px-3.5")}</li>;
        }

        // Any item with children → right-side flyout
        const ecChildren: readonly NavChild[] =
          "children" in item && item.children ? item.children : [];
        const branchOpen = expanded[0] === item.to;
        const itemKey = item.to + item.label;

        return (
          <li
            key={itemKey}
            className="relative"
            onMouseEnter={() => openKey(item.to)}
            onMouseLeave={scheduleClose}
          >
            <button
              type="button"
              className={
                "flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors " +
                (branchOpen
                  ? "bg-[var(--color-surface-2)] text-foreground"
                  : "text-foreground/75 hover:bg-[var(--color-surface-2)] hover:text-foreground")
              }
            >
              {item.label}
              <ChevronRight size={14} className="opacity-50" />
            </button>

            <AnimatePresence>
              {branchOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-full top-0 pl-2"
                  onMouseEnter={() => {
                    cancel();
                    setExpanded([item.to]);
                  }}
                >
                  <ul className="max-h-[70vh] min-w-[230px] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-[var(--color-surface)] p-1.5 shadow-[0_24px_50px_-20px_rgba(15,23,42,0.45)]">
                    {ecChildren.map((g) => {
                      const gHasChildren = "children" in g && g.children && g.children.length > 0;
                      if (!gHasChildren) {
                        return <li key={g.to + g.label}>{leaf(g, "px-3.5")}</li>;
                      }
                      return <InlineGroup key={g.to + g.label} group={g} parentTo={item.to} />;
                    })}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}

export function FloatingNavbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openPath, setOpenPath] = useState<string[]>([]);
  const subMenuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string[]>([]);
  const toggleMobile = (key: string) =>
    setMobileExpanded((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  const [pastYears, setPastYears] = useState<number[]>([]);
  const examPromo = useExamPromo();
  // The exam strip sits above the navbar on the homepage until you scroll.
  const showExamBar = pathname === "/" && !!examPromo && !scrolled;

  // Load past (non-current) session years for the "Previous EC" submenu.
  // We always list the full history 1st→12th EC (2014–2025); any year that
  // also exists in the backend gets its real data on its page. The current
  // session's year is excluded.
  useEffect(() => {
    let alive = true;
    const FOUNDING_YEAR = 2014;
    const LATEST_PAST_YEAR = 2025; // 12th EC = 2025
    const fullRange = Array.from(
      { length: LATEST_PAST_YEAR - FOUNDING_YEAR + 1 },
      (_, i) => FOUNDING_YEAR + i,
    );

    committeeApi
      .listAll()
      .then((rows) => {
        if (!alive) return;
        const currentYears = new Set(rows.filter((m) => m.is_current).map((m) => m.year));
        const backendYears = rows.map((m) => m.year).filter((y) => !Number.isNaN(y));
        const years = [...new Set([...fullRange, ...backendYears])]
          .filter((y) => !currentYears.has(y))
          .sort((a, b) => a - b); // oldest first (1st, 2nd, ...)
        setPastYears(years);
      })
      .catch(() => {
        // Backend unreachable — still show the full known history.
        if (alive) setPastYears(fullRange);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Inject past sessions into the "Previous EC" submenu.
  const navLinks = useMemo<readonly NavItem[]>(() => {
    const previousEcChildren: NavChild[] = [
      { to: "/convening-committee", label: "Convening Committee" },
      ...pastYears.map((y) => ({
        to: `/ec/${y}`,
        label: `${ecOrdinal(y)} EC · ${y}-${String((y + 1) % 100).padStart(2, "0")}`,
      })),
    ];

    return NAV_LINKS.map((link) => {
      if (link.to !== "/leadership" || !("children" in link)) return link;
      return {
        ...link,
        children: link.children.map((c) => {
          // Executive Committee → inject Previous EC children
          if (c.label === "Executive Committee" && "children" in c) {
            return {
              ...c,
              children: c.children.map((gc) =>
                gc.label === "Previous EC" ? { ...gc, children: previousEcChildren } : gc,
              ),
            };
          }
          return c;
        }),
      };
    });
  }, [pastYears]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
    setOpenPath([]);
    setMobileExpanded([]);
  }, [pathname]);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileOpen]);

  // Cleanup hover timer on unmount.
  useEffect(
    () => () => {
      if (subMenuTimer.current) clearTimeout(subMenuTimer.current);
    },
    [],
  );

  // Close any open dropdown on outside click or Escape.
  useEffect(() => {
    if (!openMenu) return;
    const close = () => {
      setOpenMenu(null);
      setOpenPath([]);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenu]);

  return (
    <>
      <AnimatePresence initial={false}>
        {showExamBar && examPromo && (
          <motion.div
            key="exam-bar"
            initial={{ y: -ANNOUNCEMENT_BAR_H }}
            animate={{ y: 0 }}
            exit={{ y: -ANNOUNCEMENT_BAR_H }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 top-0"
            style={{ zIndex: 10000 }}
          >
            <ExamAnnouncementBar promo={examPromo} />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.header
        initial={false}
        animate={{
          paddingInline: scrolled ? 16 : 24,
          paddingTop: scrolled ? 8 : 12,
          top: showExamBar ? ANNOUNCEMENT_BAR_H : 0,
        }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        id="floating-navbar"
        className="fixed inset-x-0 top-0 flex justify-center pointer-events-none"
        style={{ zIndex: 9999 }}
      >
        <motion.nav
          layout
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={
            "pointer-events-auto flex items-center gap-2 w-full " +
            (scrolled
              ? "max-w-6xl rounded-full glass shadow-[0_10px_40px_-15px_rgba(79,110,247,0.35)]"
              : "max-w-7xl rounded-2xl glass")
          }
          style={{
            paddingInline: scrolled ? 12 : 18,
            paddingBlock: scrolled ? 8 : 12,
          }}
        >
          {/* Logo */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              sessionStorage.setItem("pusab:scrollTopOnLoad", "1");
              window.location.href = "/";
            }}
            className="group flex items-center gap-2.5 pr-3"
          >
            <img
              src={logoPusab}
              alt="PUSAB logo"
              className="h-12 w-12 object-contain transition-transform duration-700 group-hover:rotate-[360deg]"
            />
            <div className="flex flex-col leading-none">
              <span className="font-display text-[18px] font-bold tracking-[0.02em] text-foreground">
                PUSAB
              </span>
              <span className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground mt-0.5 whitespace-nowrap">
                est. 2014
              </span>
            </div>
          </a>

          {/* Desktop links */}
          <ul className="hidden lg:flex items-center gap-1 mx-auto">
            {navLinks.map((link) => {
              const children = "children" in link ? link.children : undefined;
              const childActive = children?.some(
                (c) =>
                  pathname.startsWith(c.to) ||
                  ("children" in c && c.children?.some((g) => pathname.startsWith(g.to))),
              );
              const isActive =
                (link.to === "/" ? pathname === "/" : pathname.startsWith(link.to)) ||
                Boolean(childActive);
              const pillClasses =
                "relative inline-flex cursor-pointer items-center gap-1 px-3.5 py-1.5 text-sm font-semibold tracking-[0.02em] text-foreground/75 hover:text-foreground transition-colors";
              const pill = isActive && (
                <motion.span
                  layoutId="nav-pill"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-[var(--color-surface-2)] border border-border"
                />
              );

              if (!children) {
                return (
                  <li key={link.to}>
                    <Link to={link.to} className={pillClasses}>
                      {pill}
                      <span className="relative z-10">{link.label}</span>
                    </Link>
                  </li>
                );
              }

              const isOpen = openMenu === link.to;
              const openThisMenu = () => {
                if (subMenuTimer.current) clearTimeout(subMenuTimer.current);
                setOpenMenu(link.to);
              };
              const closeThisMenu = () => {
                if (subMenuTimer.current) clearTimeout(subMenuTimer.current);
                subMenuTimer.current = setTimeout(() => {
                  setOpenMenu(null);
                  setOpenPath([]);
                }, 160);
              };
              return (
                <li
                  key={link.to}
                  className="relative"
                  onMouseEnter={openThisMenu}
                  onMouseLeave={closeThisMenu}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenu(isOpen ? null : link.to);
                    }}
                    className={pillClasses}
                  >
                    {pill}
                    <span className="relative z-10">{link.label}</span>
                    <ChevronDown
                      size={13}
                      className={
                        "relative z-10 opacity-60 transition-transform duration-200 " +
                        (isOpen ? "rotate-180" : "")
                      }
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        onClick={(e) => e.stopPropagation()}
                        onMouseEnter={openThisMenu}
                        className="absolute left-1/2 top-full z-20 -translate-x-1/2 pt-3"
                      >
                        {link.label === "Leadership" ? (
                          <LeadershipMenu
                            items={children}
                            expanded={openPath}
                            setExpanded={setOpenPath}
                            pathname={pathname}
                            onClose={() => {
                              setOpenMenu(null);
                              setOpenPath([]);
                            }}
                          />
                        ) : (
                          <ul className="min-w-[200px] rounded-2xl border border-border bg-[var(--color-surface)] p-1.5 shadow-[0_24px_50px_-20px_rgba(15,23,42,0.45)]">
                            {children.map((c) => {
                              const cActive = pathname.startsWith(c.to);
                              return (
                                <li key={c.to + c.label}>
                                  <Link
                                    to={c.to}
                                    onClick={() => setOpenMenu(null)}
                                    className={
                                      "block rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors " +
                                      (cActive
                                        ? "bg-[var(--color-surface-2)] text-foreground"
                                        : "text-foreground/75 hover:bg-[var(--color-surface-2)] hover:text-foreground")
                                    }
                                  >
                                    {c.label}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>

          {/* CTA */}
          <div className="ml-auto hidden lg:flex items-center gap-2">
            {pathname === "/" && examPromo ? (
              <ExamNavButton promo={examPromo} />
            ) : (
            <Link
              to="/support"
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border px-3.5 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:border-[color-mix(in_oklab,var(--color-accent-1)_45%,transparent)] hover:text-foreground"
            >
              <Heart size={14} className="text-[var(--color-accent-1)]" /> Contribute
            </Link>
            )}
            <Link to="/join" className="formal-cta group">
              <span>Join PUSAB</span>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="ml-auto lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-full border border-border bg-[var(--color-surface-2)] text-foreground"
            aria-label="Open menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </motion.nav>
      </motion.header>

      {/* CTA styles */}
      <style>{`
        .formal-cta {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 18px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.02em;
          white-space: nowrap;
          color: #ffffff;
          background: linear-gradient(90deg, var(--color-accent-1), var(--color-accent-2));
          box-shadow: 0 10px 24px -14px color-mix(in srgb, var(--color-accent-1) 60%, transparent);
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .formal-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 32px -14px color-mix(in srgb, var(--color-accent-2) 60%, transparent);
        }
      `}</style>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 lg:hidden"
            style={{ zIndex: 10000 }}
          >
            {/* Solid backdrop — fully covers page content */}
            <div className="absolute inset-0 bg-[var(--color-background)]" />
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -right-16 h-[50vh] w-[50vh] rounded-full bg-[var(--color-accent-1)] opacity-[0.07] blur-[100px]" />
              <div className="absolute -bottom-24 -left-16 h-[50vh] w-[50vh] rounded-full bg-[var(--color-accent-2)] opacity-[0.07] blur-[100px]" />
            </div>

            {/* Panel */}
            <div className="relative flex h-full flex-col">
              {/* Header row inside menu */}
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <a
                  href="/"
                  className="flex items-center gap-2.5"
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileOpen(false);
                    sessionStorage.setItem("pusab:scrollTopOnLoad", "1");
                    window.location.href = "/";
                  }}
                >
                  <img src={logoPusab} alt="PUSAB" className="h-10 w-10 object-contain" />
                  <div className="flex flex-col leading-none">
                    <span className="font-display text-base font-bold tracking-[0.02em]">
                      PUSAB
                    </span>
                    <span className="mt-0.5 text-[8px] uppercase tracking-[0.28em] text-muted-foreground">
                      est. 2014
                    </span>
                  </div>
                </a>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-full border border-border text-foreground"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable nav */}
              <nav className="flex-1 overflow-y-auto px-5 py-6">
                <motion.ul
                  initial="hidden"
                  animate="show"
                  variants={{
                    show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
                  }}
                  className="space-y-1"
                >
                  {navLinks.map((link) => {
                    const children = "children" in link ? link.children : undefined;
                    const isActive =
                      link.to === "/" ? pathname === "/" : pathname.startsWith(link.to);
                    const topKey = "top:" + link.to;
                    const topExpanded = mobileExpanded.includes(topKey);
                    return (
                      <motion.li
                        key={link.to}
                        variants={{
                          hidden: { opacity: 0, y: 12 },
                          show: {
                            opacity: 1,
                            y: 0,
                            transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                          },
                        }}
                      >
                        {children ? (
                          <button
                            type="button"
                            onClick={() => toggleMobile(topKey)}
                            aria-expanded={topExpanded}
                            className={
                              "flex w-full items-center justify-between rounded-xl px-4 py-3 font-display text-lg font-bold tracking-tight transition-colors " +
                              (isActive
                                ? "bg-[var(--color-surface-2)] text-foreground"
                                : "text-foreground/85 hover:bg-[var(--color-surface-2)]")
                            }
                          >
                            {link.label}
                            <ChevronDown
                              size={16}
                              className={
                                "opacity-50 transition-transform duration-200 " +
                                (topExpanded ? "rotate-180" : "")
                              }
                            />
                          </button>
                        ) : (
                          <Link
                            to={link.to}
                            onClick={() => setMobileOpen(false)}
                            className={
                              "block rounded-xl px-4 py-3 font-display text-lg font-bold tracking-tight transition-colors " +
                              (isActive
                                ? "bg-[var(--color-surface-2)] text-foreground"
                                : "text-foreground/85 hover:bg-[var(--color-surface-2)]")
                            }
                          >
                            {link.label}
                          </Link>
                        )}
                        {children && topExpanded && (
                          <ul className="mb-1 ml-3 mt-0.5 space-y-0.5 border-l border-border pl-4">
                            {children.map((c) => {
                              const grandchildren = "children" in c ? c.children : undefined;
                              const cActive = pathname.startsWith(c.to);
                              if (!grandchildren) {
                                return (
                                  <li key={c.to + c.label}>
                                    <Link
                                      to={c.to}
                                      onClick={() => setMobileOpen(false)}
                                      className={
                                        "block rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
                                        (cActive
                                          ? "text-(--color-accent-1)"
                                          : "text-foreground/65 hover:text-foreground")
                                      }
                                    >
                                      {c.label}
                                    </Link>
                                  </li>
                                );
                              }
                              // Item with nested children (e.g. "Executive Committee") — accordion
                              const mKey = c.to + c.label;
                              const mExpanded = mobileExpanded.includes(mKey);
                              return (
                                <li key={mKey}>
                                  <button
                                    type="button"
                                    onClick={() => toggleMobile(mKey)}
                                    className={
                                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
                                      (cActive
                                        ? "text-(--color-accent-1)"
                                        : "text-foreground/65 hover:text-foreground")
                                    }
                                  >
                                    {c.label}
                                    <ChevronDown
                                      size={12}
                                      className={
                                        "opacity-50 transition-transform duration-200 " +
                                        (mExpanded ? "rotate-180" : "")
                                      }
                                    />
                                  </button>
                                  {mExpanded && (
                                    <ul className="ml-3 space-y-0.5 border-l border-border pl-3">
                                      {grandchildren.map((g) => {
                                        const ggChildren = "children" in g ? g.children : undefined;
                                        const gActive = pathname.startsWith(g.to);
                                        if (!ggChildren) {
                                          return (
                                            <li key={g.to + g.label}>
                                              <Link
                                                to={g.to}
                                                onClick={() => setMobileOpen(false)}
                                                className={
                                                  "block rounded-lg px-3 py-2 text-[13px] font-medium transition-colors " +
                                                  (gActive
                                                    ? "text-(--color-accent-1)"
                                                    : "text-foreground/55 hover:text-foreground")
                                                }
                                              >
                                                {g.label}
                                              </Link>
                                            </li>
                                          );
                                        }
                                        // 4th level — "Previous EC" expandable
                                        const ggKey = g.to + g.label;
                                        const ggExpanded = mobileExpanded.includes(ggKey);
                                        return (
                                          <li key={ggKey}>
                                            <button
                                              type="button"
                                              onClick={() => toggleMobile(ggKey)}
                                              className={
                                                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-[13px] font-medium transition-colors " +
                                                (gActive
                                                  ? "text-(--color-accent-1)"
                                                  : "text-foreground/55 hover:text-foreground")
                                              }
                                            >
                                              {g.label}
                                              <ChevronDown
                                                size={11}
                                                className={
                                                  "opacity-50 transition-transform duration-200 " +
                                                  (ggExpanded ? "rotate-180" : "")
                                                }
                                              />
                                            </button>
                                            {ggExpanded && (
                                              <ul className="ml-3 space-y-0.5 border-l border-border pl-3">
                                                {ggChildren.map((item) => {
                                                  const iActive = pathname.startsWith(item.to);
                                                  return (
                                                    <li key={item.to + item.label}>
                                                      <Link
                                                        to={item.to}
                                                        onClick={() => setMobileOpen(false)}
                                                        className={
                                                          "block rounded-lg px-3 py-2 text-[12px] font-medium transition-colors " +
                                                          (iActive
                                                            ? "text-(--color-accent-1)"
                                                            : "text-foreground/50 hover:text-foreground")
                                                        }
                                                      >
                                                        {item.label}
                                                      </Link>
                                                    </li>
                                                  );
                                                })}
                                              </ul>
                                            )}
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </motion.li>
                    );
                  })}
                </motion.ul>
              </nav>

              {/* Footer — CTAs + contact */}
              <div className="border-t border-border px-5 py-5">
                {examPromo && (
                  <Link
                    to={examPromo.mode === "apply" ? EXAM_PATH : EXAM_STATUS_PATH}
                    onClick={() => setMobileOpen(false)}
                    className="exam-ui mb-3 flex h-12 items-center justify-center gap-2 rounded-full border-[1.5px] border-[#03A9EC] text-[15px] font-bold text-[#0369A1]"
                  >
                    <span className="h-[7px] w-[7px] rounded-full bg-[#16A34A]" />
                    {examPromo.mode === "apply" ? "মেধাবৃত্তি পরীক্ষায় আবেদন" : "প্রবেশপত্র ডাউনলোড"}
                  </Link>
                )}
                <div className="flex gap-3">
                  <Link
                    to="/support"
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border py-3 text-sm font-semibold"
                  >
                    <Heart size={15} className="text-[var(--color-accent-1)]" /> Contribute
                  </Link>
                  <Link
                    to="/join"
                    onClick={() => setMobileOpen(false)}
                    className="formal-cta flex-1 justify-center"
                  >
                    <span>Join PUSAB</span>
                  </Link>
                </div>
                <div className="mt-4 flex flex-col items-center gap-0.5 text-center text-xs text-muted-foreground">
                  <p>{SITE.email}</p>
                  <p>{SITE.phone}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
