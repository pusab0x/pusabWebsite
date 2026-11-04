// Typed CRUD helpers for each API resource. Reads are public; writes need an
// admin token (handled automatically by apiFetch).

import { apiFetch, API_URL } from "./client";
import type {
  AdminUser,
  ContactMessage,
  EcMember,
  ExamApplication,
  ExamApplicationStatus,
  ExamApplyBody,
  ExamCenter,
  ExamConfig,
  ExamStats,
  FelicitationEntry,
  GalleryItem,
  LeaderMessage,
  Paginated,
  PageHero,
  PageHeroKey,
  Program,
  ProgramPage,
  PublicityPost,
  SiteSettings,
  Testimonial,
} from "./types";

type QueryValue = string | number | boolean | undefined;
type Query = Record<string, QueryValue>;

function qs(params?: Query): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}

function crud<T, Body = Partial<T>>(resource: string, requiresAuth = false) {
  const base = `/api/${resource}/`;
  return {
    list: (params?: Query) =>
      apiFetch<Paginated<T>>(`${base}${qs(params)}`, {}, { auth: requiresAuth }),
    /** Convenience: fetch all results, following pagination until exhausted. */
    listAll: async (params?: Query): Promise<T[]> => {
      const results: T[] = [];
      // First page via apiFetch so the auth token is attached when needed.
      let page = await apiFetch<Paginated<T>>(
        `${base}${qs({ ...params, page_size: 200 })}`,
        {},
        { auth: requiresAuth },
      );
      results.push(...page.results);
      // Subsequent pages: the `next` field is an absolute URL, so fetch
      // directly but keep the auth header if required.
      while (page.next) {
        const headers: Record<string, string> = { Accept: "application/json" };
        if (requiresAuth) {
          const { tokenStore } = await import("./client");
          if (tokenStore.access) headers["Authorization"] = `Bearer ${tokenStore.access}`;
        }
        const res = await fetch(page.next, { headers });
        if (!res.ok) throw new Error(`API error ${res.status}`);
        page = await res.json();
        results.push(...page.results);
      }
      return results;
    },
    get: (id: number) => apiFetch<T>(`${base}${id}/`, {}, { auth: false }),
    create: (body: Body) => apiFetch<T>(base, { method: "POST", body: JSON.stringify(body) }),
    update: (id: number, body: Body) =>
      apiFetch<T>(`${base}${id}/`, { method: "PATCH", body: JSON.stringify(body) }),
    remove: (id: number) => apiFetch<void>(`${base}${id}/`, { method: "DELETE" }),
  };
}

export const galleryApi = crud<GalleryItem>("gallery");
export const publicityApi = crud<PublicityPost>("publicity");
export const committeeApi = crud<EcMember>("committee");
export const programsApi = crud<Program>("programs");
export const contactApi = crud<ContactMessage>("contact", true); // admin-only read
export const usersApi = crud<AdminUser>("users", true);
export const felicitationApi = crud<FelicitationEntry>("felicitation");
export const testimonialsApi = crud<Testimonial>("testimonials");

// Leader messages (President / General Secretary) — looked up by role string.
export const leaderMessageApi = {
  list: () =>
    apiFetch<Paginated<LeaderMessage>>("/api/leader-messages/", {}, { auth: false }),
  listAll: async (): Promise<LeaderMessage[]> => {
    const page = await apiFetch<Paginated<LeaderMessage>>(
      "/api/leader-messages/",
      {},
      { auth: false },
    );
    return page.results;
  },
  get: (role: "president" | "secretary") =>
    apiFetch<LeaderMessage>(`/api/leader-messages/${role}/`, {}, { auth: false }),
  update: (role: "president" | "secretary", body: Partial<LeaderMessage>) =>
    apiFetch<LeaderMessage>(`/api/leader-messages/${role}/`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};

// Site settings is a singleton (no list/id) — read public, update by admins.
export const settingsApi = {
  get: () => apiFetch<SiteSettings>("/api/settings/", {}, { auth: false }),
  update: (body: Partial<SiteSettings>) =>
    apiFetch<SiteSettings>("/api/settings/", { method: "PATCH", body: JSON.stringify(body) }),
};

// Page heroes (banner title/lede/image(s)) — looked up by page key. Writing
// `images` always replaces the full ordered list, so `id` is optional.
type PageHeroImageInput = Omit<PageHero["images"][number], "id"> & { id?: number };
type PageHeroUpdateBody = Partial<Pick<PageHero, "title" | "lede">> & {
  images?: PageHeroImageInput[];
};

export const pageHeroApi = {
  listAll: async (): Promise<PageHero[]> => {
    const page = await apiFetch<Paginated<PageHero>>("/api/page-heroes/", {}, { auth: false });
    return page.results;
  },
  get: (page: PageHeroKey) =>
    apiFetch<PageHero>(`/api/page-heroes/${page}/`, {}, { auth: false }),
  update: (page: PageHeroKey, body: PageHeroUpdateBody) =>
    apiFetch<PageHero>(`/api/page-heroes/${page}/`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};

// Program detail pages — looked up by slug (matches the /programs/<slug>
// route). Each slug now has one row per edition year; omitting ?year=
// returns the latest edition, and the response always includes a `years`
// array listing every edition that exists for that slug.
export const programPagesApi = {
  listAll: async (): Promise<ProgramPage[]> => {
    const page = await apiFetch<Paginated<ProgramPage>>(
      "/api/program-pages/",
      {},
      { auth: false },
    );
    return page.results;
  },
  /** Latest edition (or a specific `year`) for a slug. */
  get: (slug: string, year?: number) =>
    apiFetch<ProgramPage>(
      `/api/program-pages/${slug}/${year ? `?year=${year}` : ""}`,
      {},
      { auth: false },
    ),
  /** Creates a brand-new edition (slug + year combination). */
  create: (body: Partial<ProgramPage> & { slug: string; year: number }) =>
    apiFetch<ProgramPage>("/api/program-pages/", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (slug: string, year: number, body: Partial<ProgramPage>) =>
    apiFetch<ProgramPage>(`/api/program-pages/${slug}/?year=${year}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};

// Scholarship exam. Config, centres, apply and status are public; the
// application list and its actions need an admin token.
type ExamListQuery = {
  status?: string;
  class_level?: number | string;
  center?: number | string;
  q?: string;
  has_roll?: boolean;
  order?: "roll";
};

export const examApi = {
  config: () => apiFetch<ExamConfig>("/api/exam/config/", {}, { auth: false }),
  updateConfig: (body: Partial<ExamConfig>) =>
    apiFetch<ExamConfig>("/api/exam/config/", { method: "PATCH", body: JSON.stringify(body) }),

  centers: () => apiFetch<ExamCenter[]>("/api/exam/centers/"),
  createCenter: (body: Partial<ExamCenter>) =>
    apiFetch<ExamCenter>("/api/exam/centers/", { method: "POST", body: JSON.stringify(body) }),
  updateCenter: (id: number, body: Partial<ExamCenter>) =>
    apiFetch<ExamCenter>(`/api/exam/centers/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  removeCenter: (id: number) => apiFetch<void>(`/api/exam/centers/${id}/`, { method: "DELETE" }),

  apply: (body: ExamApplyBody) =>
    apiFetch<ExamApplicationStatus>(
      "/api/exam/apply/",
      { method: "POST", body: JSON.stringify(body) },
      { auth: false },
    ),
  status: (application_no: string, phone: string, markDownloaded = false) =>
    apiFetch<ExamApplicationStatus>(
      "/api/exam/status/",
      {
        method: "POST",
        body: JSON.stringify({ application_no, phone, mark_downloaded: markDownloaded }),
      },
      { auth: false },
    ),

  /** All applications of the current edition matching the filters. */
  list: async (params?: ExamListQuery): Promise<ExamApplication[]> => {
    const page = await apiFetch<Paginated<ExamApplication>>(
      `/api/exam/applications/${qs({ ...params, page_size: 5000 })}`,
    );
    return page.results;
  },
  stats: () => apiFetch<ExamStats>("/api/exam/applications/stats/"),
  create: (body: Partial<ExamApplication>) =>
    apiFetch<ExamApplication>("/api/exam/applications/", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id: number, body: Partial<ExamApplication>) =>
    apiFetch<ExamApplication>(`/api/exam/applications/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  remove: (id: number) =>
    apiFetch<void>(`/api/exam/applications/${id}/`, { method: "DELETE" }),
  verify: (id: number, note = "") =>
    apiFetch<ExamApplication>(`/api/exam/applications/${id}/verify/`, {
      method: "POST",
      body: JSON.stringify({ note }),
    }),
  reject: (id: number, note: string) =>
    apiFetch<ExamApplication>(`/api/exam/applications/${id}/reject/`, {
      method: "POST",
      body: JSON.stringify({ note }),
    }),
  reset: (id: number) =>
    apiFetch<ExamApplication>(`/api/exam/applications/${id}/reset/`, { method: "POST" }),
  assignRoll: (id: number) =>
    apiFetch<ExamApplication>(`/api/exam/applications/${id}/assign-roll/`, { method: "POST" }),
  assignRolls: () =>
    apiFetch<{ assigned: number }>("/api/exam/applications/assign-rolls/", { method: "POST" }),
};
