import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/** Content that only exists on paper: rendered straight into <body> and
 *  shown alone while `printArea()` runs (see `.print-area` in styles.css). */
export function PrintArea({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(<div className="print-area">{children}</div>, document.body) : null;
}

/** Print the mounted PrintArea once its images have loaded. In the print
 *  dialog, "Save as PDF" gives the downloadable file. */
export async function printArea() {
  const area = document.querySelector<HTMLElement>(".print-area");
  if (!area) return;
  await Promise.all(
    Array.from(area.querySelectorAll("img")).map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          }),
    ),
  );
  await document.fonts?.ready;
  document.body.classList.add("exam-printing");
  const done = () => document.body.classList.remove("exam-printing");
  window.addEventListener("afterprint", done, { once: true });
  window.print();
  // Some mobile browsers never fire afterprint.
  setTimeout(done, 60_000);
}

/** Save an on-page element straight to a one-page A4 PDF. It goes through an
 *  image because the browser shapes Bengali correctly and PDF libraries don't. */
export async function downloadPdf(node: HTMLElement, filename: string) {
  const [{ toPng }, { jsPDF }] = await Promise.all([import("html-to-image"), import("jspdf")]);
  await document.fonts?.ready;
  const png = await toPng(node, { pixelRatio: 2, backgroundColor: "#FFFFFF" });
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 10;
  const width = pdf.internal.pageSize.getWidth() - margin * 2;
  const maxHeight = pdf.internal.pageSize.getHeight() - margin * 2;
  const height = (node.offsetHeight / node.offsetWidth) * width;
  const scale = Math.min(1, maxHeight / height);
  pdf.addImage(png, "PNG", margin + (width - width * scale) / 2, margin, width * scale, height * scale);
  pdf.save(filename);
}
