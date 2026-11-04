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
