import type { CSSProperties } from "react";
import { ADMIT_RULES, EXAM_OFFICIALS, toBn } from "@/lib/exam";

const LINK: CSSProperties = { fontFamily: "Inter, sans-serif", color: "#0369A1" };

/** Website and Facebook addresses inside a rule, set apart like the paper form. */
function RuleText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(www\.[^\s)]+)/).map((part, i) =>
        part.startsWith("www.") ? <span key={i} style={LINK}>{part}</span> : part,
      )}
    </>
  );
}

/** The rules printed under the admit card. Inline styles so the same block
 *  works on screen, in print and in the PDF. */
export function AdmitRules({ fontSize = 13 }: { fontSize?: number }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 20, fontSize, lineHeight: 1.6, textAlign: "justify" }}>
      {ADMIT_RULES.map((rule) => (
        <li key={rule} style={{ marginBottom: 2 }}>
          <RuleText text={rule} />
        </li>
      ))}
    </ul>
  );
}

/** "সার্বিক প্রয়োজনে" — the president and general secretary with their numbers. */
export function OfficialsBlock({ fontSize = 14 }: { fontSize?: number }) {
  return (
    <div style={{ fontSize, lineHeight: 1.6, textAlign: "center" }}>
      <div style={{ marginBottom: 4 }}>সার্বিক প্রয়োজনে:</div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-around", gap: "8px 24px" }}>
        {EXAM_OFFICIALS.map((o) => (
          <div key={o.phone} style={{ fontWeight: 700 }}>
            <div>{o.name}</div>
            <div>{o.role}</div>
            <div>
              মোবাইল নম্বর:{" "}
              <a href={`tel:${o.phone}`} style={{ color: "inherit", textDecoration: "none" }}>{toBn(o.phone)}</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
