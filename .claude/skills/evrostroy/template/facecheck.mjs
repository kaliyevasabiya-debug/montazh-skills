// node facecheck.mjs NAME 0.5 -> renders only the graphics every 0.5 s into out/fc_NAME/ (then run scripts/facecheck.py)
import fs from "fs";
import path from "path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
const [id, step = "0.5"] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const inputProps = { overlayOnly: true };
const composition = await selectComposition({ serveUrl, id, inputProps });
const dir = `out/fc_${id}`; fs.mkdirSync(dir, { recursive: true });
for (let t = 0; t < composition.durationInFrames / 30; t += parseFloat(step)) {
  const frame = Math.round(t * 30);
  await renderStill({ composition, serveUrl, frame, inputProps, imageFormat: "png", output: `${dir}/o_${frame}.png` });
}
console.log("done");
fs.rmSync(serveUrl, { recursive: true, force: true });
