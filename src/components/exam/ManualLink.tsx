import { FileText } from "lucide-react";
import manualUrl from "@/assets/pusab-exam-manual.pdf?url";

/** Small button that opens the Bengali step-by-step application guide (PDF). */
export function ManualLink({ dark, className = "" }: { dark?: boolean; className?: string }) {
  return (
    <a
      href={manualUrl}
      target="_blank"
      rel="noopener"
      className={
        "inline-flex w-fit items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors " +
        (dark
          ? "border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
          : "border-[#BAE6FD] bg-[#F0FAFE] text-[#0369A1] hover:bg-[#E0F2FE]") +
        " " + className
      }
    >
      <FileText size={15} aria-hidden="true" />
      কীভাবে আবেদন করবেন? নির্দেশিকা দেখুন (PDF)
    </a>
  );
}
