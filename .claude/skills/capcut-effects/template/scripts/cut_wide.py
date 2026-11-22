# usage: python scripts/cut_wide.py media/исходник.mp4 work/words.json --keep "26-44" [--keep "50-61"] [--gap 0.15]
# Горизонтальная нарезка 1920×1080: оставляет только выбранные слова (номера из words.json), сжимает паузы.
# Результат: media/cut.mp4 и work/words_cut.json (слова с временем уже в нарезанном ролике — по ним ставим графику).
import argparse, json, subprocess, os, re

p = argparse.ArgumentParser()
p.add_argument("src"); p.add_argument("words")
p.add_argument("--keep", action="append", required=True, help="диапазон номеров слов, например 26-44")
p.add_argument("--gap", type=float, default=0.15, help="паузы длиннее (сек) сжимаются — стиль плотный, без воздуха")
p.add_argument("--pad", type=float, default=0.07, help="запас до/после слова (сек)")
a = p.parse_args()
os.makedirs("work", exist_ok=True); os.makedirs("media", exist_ok=True)

# PowerShell при «> файл» пишет UTF-16 или UTF-8 с BOM — читаем любой вариант
raw = open(a.words, "rb").read()
txt = raw.decode("utf-16") if raw[:2] in (b"\xff\xfe", b"\xfe\xff") else raw.decode("utf-8-sig")
W = {w["i"]: w for w in json.loads(txt)["words"]}
log = subprocess.run(["ffmpeg", "-i", a.src, "-af", "silencedetect=n=-35dB:d=0.2", "-f", "null", "-"], capture_output=True, text=True).stderr
sil = list(zip([float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)], [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]))
for w in W.values():
    for s0, s1 in sil:
        if w["s"] < s0 < w["e"] and s1 > w["e"] - 0.05: w["e"] = round(s0, 2)
        if w["s"] < s1 < w["e"] and s0 < w["s"] + 0.05: w["s"] = round(s1, 2)
order = []
for k in a.keep:
    lo, hi = (int(x) for x in k.split("-")) if "-" in k else (int(k), int(k))
    order += [W[i] for i in range(lo, hi + 1) if i in W]

segs = []
for w in order:
    if segs and w["i"] == segs[-1]["last"]["i"] + 1 and w["s"] - segs[-1]["last"]["e"] <= a.gap:
        segs[-1]["words"].append(w); segs[-1]["last"] = w
    else:
        segs.append({"words": [w], "last": w})
for s in segs:
    s["a"] = max(0, s["words"][0]["s"] - a.pad); s["b"] = s["words"][-1]["e"] + a.pad

# кадр -> 1920×1080 (если исходник не 16:9 — обрезаем по центру)
fit = "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1"
f, cat, F = [], "", 0.012
for k, s in enumerate(segs):
    d = s["b"] - s["a"]
    f.append(f"[0:v]trim={s['a']:.3f}:{s['b']:.3f},setpts=PTS-STARTPTS,{fit}[v{k}]")
    f.append(f"[0:a]atrim={s['a']:.3f}:{s['b']:.3f},asetpts=PTS-STARTPTS,afade=t=in:d={F},afade=t=out:st={d - F:.3f}:d={F}[a{k}]")
    cat += f"[v{k}][a{k}]"
f.append(f"{cat}concat=n={len(segs)}:v=1:a=1[v][a]")
# длинные ролики: граф пишем в файл, чтобы не упереться в длину командной строки
open("work/_cut_graph.txt", "w", encoding="utf-8").write(";".join(f))
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.src, "-/filter_complex", "work/_cut_graph.txt", "-map", "[v]", "-map", "[a]",
                "-r", "30", "-c:v", "libx264", "-crf", "17", "-preset", "fast", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
                "media/cut.mp4"], check=True)

t, new = 0.0, []
for s in segs:
    for w in s["words"]:
        new.append({"w": w["w"], "s": round(t + w["s"] - s["a"], 2), "e": round(t + w["e"] - s["a"], 2)})
    t += s["b"] - s["a"]
json.dump({"duration": round(t, 2), "words": new}, open("work/words_cut.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print(f"Готово: media/cut.mp4 ({t:.1f} с, склеек: {len(segs) - 1}), work/words_cut.json")
