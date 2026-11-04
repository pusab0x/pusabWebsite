// DTOs matching the Django REST API serializers (backend/).

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_admin: boolean;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface GalleryItem {
  id: number;
  title: string;
  caption: string;
  /** Free-text — admins can create new categories from the dashboard. */
  category: string;
  year: number | null;
  image_url: string;
  created_at: string;
}

export interface PublicityPost {
  id: number;
  type: "news" | "press" | "event" | "blog";
  title: string;
  excerpt: string;
  body: string;
  link: string;
  image_url: string;
  date: string | null;
  author: string;
  published: boolean;
  created_at: string;
}

export interface EcMember {
  id: number;
  name: string;
  role: string;
  university: string;
  year: number;
  is_current: boolean;
  is_convening: boolean;
  photo_url: string;
}

export interface Program {
  id: number;
  title: string;
  category: string;
  description: string;
  location: string;
  image_url: string;
  date: string | null;
  ongoing: boolean;
  recurrence: string;
  status: "upcoming" | "ongoing" | "completed";
  created_at: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  phone: string;
  father_name: string;
  mother_name: string;
  blood_group: string;
  subject: string;
  university: string;
  session: string;
  union_name: string;
  village: string;
  school: string;
  college: string;
  message: string;
  email: string;
  is_read: boolean;
  created_at: string;
}

export interface SiteSettings {
  email: string;
  phone: string;
  members: string;
  founded: string;
  founded_at: string;
  address: string;
  facebook: string;
  updated_at: string;
}

export interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  is_admin: boolean;
  is_active: boolean;
  date_joined: string;
}

export interface LeaderMessage {
  id: number;
  role: "president" | "secretary";
  name: string;
  designation: string;
  session: string;
  photo_url: string;
  quote: string;
  body: string;
  updated_at: string;
}

export interface PageHeroImage {
  id: number;
  image_url: string;
  alt_text: string;
  order: number;
}

export type PageHeroKey =
  | "home"
  | "about"
  | "programs"
  | "leadership"
  | "moments"
  | "publicity"
  | "convening-committee"
  | "honor-board";

export interface PageHero {
  id: number;
  page: PageHeroKey;
  title: string;
  lede: string;
  images: PageHeroImage[];
  updated_at: string;
}

export interface FelicitationEntry {
  id: number;
  name: string;
  title: string;
  /** Free-text, admin-defined — e.g. "Achiever", "Fresher", or any custom category. */
  category: string;
  year: number;
  image_url: string;
  note: string;
  created_at: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  quote: string;
  photo_url: string;
  program: string;
  is_featured: boolean;
  order: number;
  created_at: string;
}

export interface ProgramObjective {
  id: number;
  title: string;
  description: string;
  icon: string;
  image_url: string;
  order: number;
}

export interface ProgramInfoItem {
  id: number;
  icon: string;
  label: string;
  value: string;
  order: number;
}

export interface ProgramStat {
  id: number;
  label: string;
  value: string;
  order: number;
}

export interface ProgramGalleryImage {
  id: number;
  image_url: string;
  caption: string;
  order: number;
}

export interface ProgramTestimonial {
  id: number;
  name: string;
  role: string;
  quote: string;
  photo_url: string;
  order: number;
}

export interface ProgramWebinar {
  id: number;
  tag: string;
  title: string;
  speaker_name: string;
  speaker_role: string;
  speaker_photo_url: string;
  event_date: string;
  event_time: string;
  status: "live" | "upcoming";
  register_url: string;
  order: number;
}

export interface ProgramPage {
  id: number;
  slug: string;
  year: number;
  title: string;
  tagline: string;
  hero_image_url: string;
  overview: string;
  eligibility: string;
  process: string;
  schedule_note: string;
  event_date: string;
  venue: string;
  event_time: string;
  register_label: string;
  register_url: string;
  cta_title: string;
  cta_subtitle: string;
  objectives: ProgramObjective[];
  info_items: ProgramInfoItem[];
  stats: ProgramStat[];
  gallery: ProgramGalleryImage[];
  testimonials: ProgramTestimonial[];
  webinars: ProgramWebinar[];
  /** Every edition year that exists for this slug, newest first. Only
   * present on GET responses (added by the backend view), not on writes. */
  years?: number[];
  updated_at: string;
}

// ── Scholarship exam ────────────────────────────────────────────────────────

export type ExamClassLevel = 8 | 9 | 10;
export type ExamPaymentMethod = "bkash" | "nagad" | "rocket" | "offline";
export type ExamStatus = "pending" | "verified" | "rejected";

export interface ExamCenter {
  id: number;
  name: string;
  location: string;
  short_name: string;
  order: number;
  is_active: boolean;
}

export interface ExamContact {
  name: string;
  role: string;
  phone: string;
}

export interface ExamConfig {
  title: string;
  short_title: string;
  year: number;
  application_prefix: string;
  exam_date: string | null; // YYYY-MM-DD
  exam_time: string;
  deadline: string | null; // YYYY-MM-DD, inclusive
  fee: number;
  bkash_number: string;
  nagad_number: string;
  rocket_number: string;
  applications_open: boolean;
  show_home_banner: boolean;
  admit_download_open: boolean;
  roll_start_8: number;
  roll_start_9: number;
  roll_start_10: number;
  contacts: ExamContact[];
  accepting: boolean;
  deadline_passed: boolean;
  centers: ExamCenter[];
  updated_at: string;
}

export interface ExamApplyBody {
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
  center: number;
  payment_method: Exclude<ExamPaymentMethod, "offline">;
  sender_number: string;
  trx_id: string;
  website?: string; // honeypot
}

/** What a student sees for their own application. */
export interface ExamApplicationStatus {
  application_no: string;
  name_bn: string;
  name_en: string;
  photo_url: string;
  class_level: ExamClassLevel;
  class_label: string;
  institution: string;
  center: ExamCenter;
  payment_method: ExamPaymentMethod;
  payment_label: string;
  trx_id: string;
  amount: number;
  status: ExamStatus;
  serial_no: number | null;
  roll_no: number | null;
  admit_available: boolean;
  note: string;
  created_at: string;
}

export interface ExamApplication {
  id: number;
  exam_year: number;
  application_no: string;
  name_bn: string;
  name_en: string;
  mother_name: string;
  father_name: string;
  phone: string;
  photo_url: string;
  class_level: ExamClassLevel;
  class_label: string;
  institution: string;
  village: string;
  union: string;
  upazila: string;
  district: string;
  center: number;
  center_name: string;
  center_short: string;
  payment_method: ExamPaymentMethod;
  payment_label: string;
  sender_number: string;
  trx_id: string;
  amount: number;
  status: ExamStatus;
  note: string;
  serial_no: number | null;
  roll_no: number | null;
  verified_at: string | null;
  admit_downloaded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExamStats {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
  collected: number;
  with_roll: number;
  downloaded: number;
  verified_by_class: Record<"8" | "9" | "10", number>;
}
