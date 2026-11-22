// node render.mjs stills NAME 1 5 10   -> out/NAME_1.png ... (check frames)
// node render.mjs full NAME            -> out/NAME.mp4      (final video)
import fs from "fs";
import path from "path";
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
const [mode = "stills", id = "Example", ...times] = process.argv.slice(2);
fs.mkdirSync("out", { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const B = { browserExecutable: "/opt/pw-browsers/chromium_headless_shell", chromiumOptions: { gl: "swangle" } };
const composition = await selectComposition({ serveUrl, id, ...B });
if (mode === "stills") {
  for (const t of times.map(Number)) await renderStill({ ...B, composition, serveUrl, frame: Math.round(t * 30), output: `out/${id}_${t}.png` });
} else if (mode === "part") {
  const [a, b] = times.map(Number);
  await renderMedia({ ...B, composition, serveUrl, codec: "h264", crf: 20, frameRange: [Math.round(a * 30), Math.round(b * 30)], outputLocation: `out/${id}_part.mp4`, concurrency: 2 });
} else {
  await renderMedia({ ...B, composition, serveUrl, codec: "h264", crf: 18, outputLocation: `out/${id}.mp4`, concurrency: 2,
    onProgress: ({ progress }) => process.stdout.write(`\r${Math.round(progress * 100)}%`) });
}
console.log("\ndone");
fs.rmSync(serveUrl, { recursive: true, force: true });
