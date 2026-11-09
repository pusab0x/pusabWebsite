import logoPusab from "@/assets/logo-pusab.png";
import { optimizeImage, type ExamApplicationStatus, type ExamConfig } from "@/lib/api";
import { EXAM_ADMIT_START, ORG_NAME_BN, PRESIDENT_NAME_BN, formatPhone, titleWithEra, toBn } from "@/lib/exam";

const FONT = "'Hind Siliguri', 'Noto Sans Bengali', 'Kalpurush', 'SolaimanLipi', 'Nirmala UI', sans-serif";

const appliedOn = (iso: string) =>
  new Date(iso).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Dhaka" });

/** The student's own copy of what they submitted. Fluid on screen; printed
 *  inside a fixed A4-width wrapper, so it avoids viewport breakpoints. */
export function ApplicationDocument({ app, config }: { app: ExamApplicationStatus; config: ExamConfig }) {
  const rows: [string, string, boolean?][] = [
    ["নাম (বাংলায়)", app.name_bn],
    ["নাম (ইংরেজি)", app.name_en, true],
    ["মাতার নাম", app.mother_name],
    ["পিতার নাম", app.father_name],
    ["মোবাইল নম্বর", formatPhone(app.phone), true],
    ["শ্রেণি", app.class_label],
    ["শিক্ষা প্রতিষ্ঠান", app.institution],
    ["গ্রাম", app.village],
    ["ইউনিয়ন", app.union],
    ["পরীক্ষা কেন্দ্র", [app.center.name, app.center.location].filter(Boolean).join(", ")],
    ["পেমেন্ট মাধ্যম", app.payment_label],
    ["Transaction ID", app.trx_id || "—", true],
    ["আবেদন ফি", `${toBn(app.amount)} টাকা`],
  ];

  return (
    <article style={{ fontFamily: FONT, color: "#000000", background: "#FFFFFF" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, borderBottom: "1.5px solid #000000", paddingBottom: 12 }}>
        <img src={logoPusab} alt="PUSAB logo" style={{ width: 68, height: 76, objectFit: "contain", flex: "none" }} />
        <div style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.35 }}>{ORG_NAME_BN}</div>
          <div style={{ fontSize: 14, lineHeight: 1.5 }}>{titleWithEra(config.title)}</div>
          <div
            style={{
              display: "inline-block", marginTop: 6, padding: "3px 22px", borderRadius: 999, background: "#2F5597",
              color: "#FFFFFF", fontSize: 15, fontWeight: 600, printColorAdjust: "exact", WebkitPrintColorAdjust: "exact",
            }}
          >
            আবেদনপত্র
          </div>
        </div>
      </header>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginTop: 16 }}>
        <div style={{ fontSize: 15, lineHeight: 1.7, minWidth: 0 }}>
          <div>আবেদন নম্বর: <strong style={{ fontFamily: "Inter, sans-serif" }}>{app.application_no}</strong></div>
          <div>আবেদনের তারিখ: {appliedOn(app.created_at)}</div>
        </div>
        <div
          style={{
            width: 96, height: 116, flex: "none", border: "1px solid #000000", boxSizing: "border-box", overflow: "hidden",
          }}
        >
          {app.photo_url && (
            <img src={optimizeImage(app.photo_url, 280)} alt="শিক্ষার্থীর ছবি" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )}
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 14, fontSize: 15, lineHeight: 1.45 }}>
        <tbody>
          {rows.map(([label, value, latin]) => (
            <tr key={label}>
              <th scope="row" style={{ width: "36%", border: "1px solid #94A3B8", padding: "6px 10px", textAlign: "left", fontWeight: 500 }}>
                {label}
              </th>
              <td
                style={{
                  border: "1px solid #94A3B8", padding: "6px 10px", fontWeight: 600, overflowWrap: "anywhere",
                  ...(latin ? { fontFamily: "Inter, sans-serif" } : null),
                }}
              >
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ margin: "14px 0 0", fontSize: 14, lineHeight: 1.6 }}>
        প্রবেশপত্র {EXAM_ADMIT_START} থেকে ডাউনলোড করা যাবে। আবেদন নম্বর ও মোবাইল নম্বর সংরক্ষণ করে রাখুন।
      </p>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
        <div style={{ width: 230, maxWidth: "100%", textAlign: "center", fontSize: 14, lineHeight: 1.5 }}>
          <div
            aria-hidden="true"
            style={{
              fontFamily: "'Galada', cursive", fontSize: 30, lineHeight: 1.3, color: "#1E3A8A", transform: "rotate(-4deg)",
              printColorAdjust: "exact", WebkitPrintColorAdjust: "exact",
            }}
          >
            {PRESIDENT_NAME_BN}
          </div>
          <div style={{ borderTop: "1px solid #000000", paddingTop: 6, fontWeight: 700 }}>{PRESIDENT_NAME_BN}</div>
          <div>সভাপতি, পুসাব</div>
        </div>
      </div>
    </article>
  );
}
