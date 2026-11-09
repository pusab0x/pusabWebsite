import type { ReactNode } from "react";
import logoPusab from "@/assets/logo-pusab.png";
import { optimizeImage, type ExamConfig } from "@/lib/api";
import {
  ORG_NAME_BN,
  bnDateLong,
  bnSerial,
  bnWeekday,
  titleWithEra,
  toBn,
} from "@/lib/exam";

/** The fields an admit card needs — satisfied by both the public status
 *  payload and the admin application record. */
export interface AdmitData {
  name_bn: string;
  photo_url: string;
  class_label: string;
  serial_no: number | null;
  roll_no: number | null;
  centerLabel: string; // "বিশ্বম্ভরপুর বালিকা উচ্চ বিদ্যালয়, বিশ্বম্ভরপুর"
}

function Photo({ url, className, style }: { url: string; className?: string; style?: React.CSSProperties }) {
  return url ? (
    <img src={optimizeImage(url, 300)} alt="শিক্ষার্থীর ছবি" className={className} style={{ ...style, objectFit: "cover" }} />
  ) : (
    <div className={className} style={style}>
      ছবি
    </div>
  );
}

/** Laptop admit card (on-screen). */
export function AdmitCardArticle({ data, config, pendingLabel = "যাচাইয়ের পর" }: { data: AdmitData; config: ExamConfig; pendingLabel?: string }) {
  const hasRoll = data.roll_no != null;
  return (
    <article
      aria-label="প্রবেশপত্র"
      className="flex min-w-0 flex-col gap-[22px] rounded-[20px] border border-[#E2E8F0] bg-white p-6 shadow-[0_20px_40px_-24px_rgba(11,37,64,.35)] sm:p-9"
    >
      <div className="flex items-start gap-[18px]">
        <img src={logoPusab} alt="PUSAB logo" className="h-16 w-16 flex-none object-contain" />
        <div className="flex flex-1 flex-col items-center gap-1.5 text-center">
          <strong className="text-[20px] leading-[1.35]">{ORG_NAME_BN}</strong>
          <span className="text-base text-[#475569]">{titleWithEra(config.title)}</span>
          <span className="mt-1 rounded-full bg-[#0F172A] px-7 py-1.5 text-[17px] font-bold text-white">প্রবেশপত্র</span>
        </div>
        <Photo
          url={data.photo_url}
          className="flex h-[116px] w-24 flex-none items-center justify-center overflow-hidden rounded-lg border border-[#CBD5E1] bg-[#F5F7FA] text-[13px] text-[#64748B]"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <InfoTile label="ক্রমিক নম্বর" value={hasRoll ? bnSerial(data.serial_no) : pendingLabel} inter={hasRoll} />
        <InfoTile label="রোল নম্বর" value={hasRoll ? toBn(data.roll_no) : pendingLabel} inter={hasRoll} />
        <InfoTile label="শ্রেণি" value={data.class_label} />
      </div>
      <div className="flex flex-col gap-2.5 text-base">
        <Row label="নাম (বাংলায়)">{data.name_bn}</Row>
        <Row label="পরীক্ষা কেন্দ্র">{data.centerLabel}</Row>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-center text-[15px] font-semibold">পরীক্ষার তারিখ ও সময়</span>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-center text-[15px]">
            <thead>
              <tr className="bg-[#0F172A] text-white">
                <th className="p-2.5 font-semibold">তারিখ</th>
                <th className="p-2.5 font-semibold">বার</th>
                <th className="p-2.5 font-semibold">সময়</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border border-[#E2E8F0]">
                <td className="p-3">{bnDateLong(config.exam_date, true)}</td>
                <td className="p-3">{bnWeekday(config.exam_date)}</td>
                <td className="p-3">{config.exam_time}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4 pt-2">
        <span className="max-w-[420px] text-[13px] leading-relaxed text-[#475569]">
          পরীক্ষা শুরুর ৩০ মিনিট আগে উপস্থিত থাকুন। প্রবেশপত্র ও সাধারণ ক্যালকুলেটর সঙ্গে আনুন।
        </span>
        <div className="flex flex-col items-center gap-1">
          <span className="w-[140px] border-t border-[#475569]" />
          <span className="text-sm">সভাপতি, পুসাব</span>
        </div>
      </div>
    </article>
  );
}

function InfoTile({ label, value, inter }: { label: string; value: string; inter?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-[#F5F7FA] p-3.5">
      <span className="text-[13px] text-[#64748B]">{label}</span>
      <strong className={(inter ? "font-inter " : "") + "text-[20px]"}>{value}</strong>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 border-b border-dashed border-[#CBD5E1] pb-2.5">
      <span className="w-[150px] flex-none text-[#64748B]">{label}</span>
      <strong>{children}</strong>
    </div>
  );
}

/** Mobile admit card (on-screen). */
export function AdmitCardMobile({ data, config, pendingLabel = "যাচাইয়ের পর" }: { data: AdmitData; config: ExamConfig; pendingLabel?: string }) {
  const hasRoll = data.roll_no != null;
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
      <div className="flex items-center gap-2.5 bg-[#0F172A] px-4 py-3.5 text-white">
        <div className="grid h-[34px] w-[34px] flex-none place-items-center overflow-hidden rounded-full border-[3px] border-[#16A34A] bg-white">
          <img src={logoPusab} alt="" className="h-[80%] w-[80%] object-contain" />
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-semibold leading-[1.35]">
            পাবলিক ইউনিভার্সিটি স্টুডেন্টস অ্যাসোসিয়েশন অব বিশ্বম্ভরপুর
          </span>
          <span className="text-xs text-[#94A3B8]">{config.title}</span>
        </div>
      </div>
      <div className="flex flex-col gap-3.5 p-4">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-[#E6F6FD] px-3.5 py-1 text-sm font-bold text-[#0F172A]">প্রবেশপত্র</span>
          <Photo
            url={data.photo_url}
            className="flex h-[74px] w-[60px] items-center justify-center overflow-hidden rounded-lg bg-[#E2E8F0] text-[11px] text-[#64748B]"
          />
        </div>
        <div className="grid grid-cols-2 gap-2.5 text-sm">
          <MobileField label="ক্রমিক নম্বর" value={hasRoll ? bnSerial(data.serial_no) : pendingLabel} />
          <MobileField label="রোল নম্বর" value={hasRoll ? toBn(data.roll_no) : pendingLabel} />
          <MobileField label="নাম" value={data.name_bn} />
          <MobileField label="শ্রেণি" value={data.class_label} />
        </div>
        <MobileField label="পরীক্ষা কেন্দ্র" value={data.centerLabel} />
        <div className="rounded-xl bg-[#F5F7FA] p-3 text-sm leading-relaxed">
          <strong>{bnDateLong(config.exam_date)}</strong> · {bnWeekday(config.exam_date)} · {config.exam_time}
        </div>
      </div>
    </div>
  );
}

function MobileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col text-sm">
      <span className="text-xs text-[#64748B]">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const DOTTED = { borderBottom: "2px dotted #000000", fontWeight: 500, lineHeight: 1.2 } as const;

/** The printable admit card — a 794×440px strip (A4 width at 96dpi) that
 *  matches the original paper form; two or three fit on one A4 sheet. */
export function AdmitCardPrint({ data, config }: { data: AdmitData; config: ExamConfig }) {
  return (
    <div
      className="admit-print"
      style={{
        width: 794,
        height: 440,
        position: "relative",
        overflow: "hidden",
        background: "#FFFFFF",
        color: "#000000",
        fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', 'Kalpurush', 'SolaimanLipi', 'Nirmala UI', sans-serif",
        breakInside: "avoid",
      }}
    >
      <div style={{ position: "absolute", left: 40, right: 40, top: 22, borderTop: "1.5px dashed #000000" }} />
      <img
        src={logoPusab}
        alt="PUSAB logo"
        style={{ position: "absolute", left: 86, top: 50, width: 80, height: 96, objectFit: "contain" }}
      />
      <div
        style={{
          position: "absolute", left: 168, top: 57, width: 458, textAlign: "center", fontSize: 17,
          fontWeight: 700, lineHeight: 1.3, whiteSpace: "nowrap", letterSpacing: "-0.01em",
        }}
      >
        {ORG_NAME_BN}
      </div>
      <div style={{ position: "absolute", left: 168, top: 92, width: 460, textAlign: "center", fontSize: 14, lineHeight: 1.3 }}>
        {titleWithEra(config.title)}
      </div>
      <div
        style={{
          position: "absolute", left: 308, top: 118, width: 177, height: 42, borderRadius: "50%",
          background: "#2F5597", color: "#FFFFFF", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 16, fontWeight: 500,
          printColorAdjust: "exact", WebkitPrintColorAdjust: "exact",
        }}
      >
        প্রবেশপত্র
      </div>
      <div
        style={{
          position: "absolute", left: 652, top: 60, width: 86, height: 101, border: "1px solid #000000",
          boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
        }}
      >
        {data.photo_url ? (
          <img src={optimizeImage(data.photo_url, 260)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: 15 }}>ছবি</span>
        )}
      </div>

      <div
        style={{
          position: "absolute", left: 121, top: 186, width: 550, display: "flex", flexDirection: "column",
          gap: 9, fontSize: 14, lineHeight: 1.5,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", whiteSpace: "nowrap" }}>
          <span>ক্রমিক নম্বরঃ&nbsp;</span>
          <span style={{ ...DOTTED, flex: "108 1 0", minWidth: 0, textAlign: "center" }}>{bnSerial(data.serial_no)}</span>
          <span style={{ paddingLeft: 6 }}>রোল নম্বরঃ</span>
          <span style={{ ...DOTTED, flex: "125 1 0", minWidth: 0, textAlign: "center" }}>{toBn(data.roll_no)}</span>
          <span style={{ paddingLeft: 8 }}>শ্রেণিঃ&nbsp;</span>
          <span style={{ ...DOTTED, flex: "170 1 0", minWidth: 0, textAlign: "center" }}>{data.class_label}</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", whiteSpace: "nowrap" }}>
          <span>নাম (বাংলায়):</span>
          <span style={{ ...DOTTED, flex: 1, paddingLeft: 8 }}>{data.name_bn}</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", whiteSpace: "nowrap" }}>
          <span>পরীক্ষা কেন্দ্রের নামঃ</span>
          <span style={{ ...DOTTED, flex: 1, paddingLeft: 8, overflow: "hidden", textOverflow: "ellipsis" }}>{data.centerLabel}</span>
        </div>
      </div>

      <div style={{ position: "absolute", left: 121, top: 310, width: 550, textAlign: "center", fontSize: 13 }}>
        পরীক্ষার তারিখ ও সময়ঃ
      </div>
      <table
        style={{
          position: "absolute", left: 121, top: 340, width: 551, borderCollapse: "collapse", fontSize: 13,
          lineHeight: 1.35, textAlign: "center", tableLayout: "fixed",
        }}
      >
        <thead>
          <tr>
            {["তারিখ", "বার", "সময়"].map((h) => (
              <th key={h} style={{ border: "1px solid #000000", padding: "1px 6px", fontWeight: 400 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: "1px solid #000000", padding: "1px 6px" }}>{bnDateLong(config.exam_date, true)}</td>
            <td style={{ border: "1px solid #000000", padding: "1px 6px" }}>{bnWeekday(config.exam_date)}</td>
            <td style={{ border: "1px solid #000000", padding: "1px 6px" }}>{config.exam_time}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export const centerLabel = (center: { name: string; location: string } | undefined) =>
  center ? (center.location ? `${center.name}, ${center.location}` : center.name) : "";
