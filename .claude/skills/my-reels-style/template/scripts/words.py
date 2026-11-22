# usage: python scripts/words.py public/media/v1.mp4 [models/sherpa-onnx-zipformer-ru-2024-09-18] > src/words_v1.ts
# Russian speech -> word timings for subtitles (offline, on your computer)
import sys, subprocess, numpy as np, sherpa_onnx

src = sys.argv[1]
m = sys.argv[2] if len(sys.argv) > 2 else "models/sherpa-onnx-zipformer-ru-2024-09-18"
rec = sherpa_onnx.OfflineRecognizer.from_transducer(
    encoder=f"{m}/encoder.int8.onnx", decoder=f"{m}/decoder.onnx", joiner=f"{m}/joiner.int8.onnx",
    tokens=f"{m}/tokens.txt", num_threads=4, decoding_method="greedy_search")
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                     capture_output=True, check=True).stdout
audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768

words = []
CH = 16000 * 20  # 20-second pieces keep memory small
for off in range(0, len(audio), CH):
    st = rec.create_stream(); st.accept_waveform(16000, audio[off:off + CH]); rec.decode_stream(st)
    r = st.result
    new = True
    for tok, t in zip(r.tokens, r.timestamps):
        t += off / 16000
        if tok.startswith(("▁", " ")):
            new = True
        tok = tok.lstrip("▁ ")
        if not tok:
            continue
        if new:
            words.append([tok, t]); new = False
        else:
            words[-1][0] += tok
print("// \"|\" = forced subtitle break, \"*\" = highlighted keyword. Check spelling by ear!")
print("export const WORDS: [string, number][] = [")
for w, t in words:
    if w:
        print(f'  ["{w.lower()}", {t:.2f}],')
print("];")
