# Вставляет эффекты в проект CapCut: 2 видеодорожки «Эффекты A/B» над цветокором + дорожка «Звуки эффектов».
# Старые дорожки с этими именами заменяются, всё остальное не трогается. Перед изменением — полный бэкап проекта.
# usage: python patch_capcut.py "<папка проекта CapCut>" "<папка эффектов с pieces.json>" "<куда класть бэкап>" ["<проект-образец со звуком>"]
# Проект-образец нужен, чтобы взять из него устройство звуковой дорожки; если не указан — ищется любой проект CapCut, где есть звук.
import json, sys, os, shutil, uuid, copy, subprocess, time

P, E, BK = sys.argv[1:4]
TPL = sys.argv[4] if len(sys.argv) > 4 else None
if not TPL:
    root = os.path.dirname(P.rstrip("\\/"))
    for name in os.listdir(root):
        q = os.path.join(root, name, "draft_content.json")
        try:
            dd = json.load(open(q, encoding="utf-8"))
            if any(t["type"] == "audio" and t["segments"] for t in dd["tracks"]): TPL = os.path.join(root, name); break
        except Exception: pass
if os.path.exists(os.path.join(P, ".locked")):
    sys.exit("Проект открыт в CapCut — закрой CapCut и запусти снова.")
nid = lambda: str(uuid.uuid4()).upper()
fwd = lambda p: p.replace("\\", "/")
US = lambda sec: int(round(sec * 1e6))

def dur_us(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path], capture_output=True, text=True, check=True)
    return int(float(r.stdout.strip()) * 1e6)

stamp = time.strftime("%Y%m%d_%H%M%S")
bk = os.path.join(BK, f"бэкап_{os.path.basename(P.rstrip(chr(92) + '/'))}_{stamp}")
shutil.copytree(P, bk, ignore=shutil.ignore_patterns(".locked"))

d = json.load(open(os.path.join(P, "draft_content.json"), encoding="utf-8"))
M, T = d["materials"], d["tracks"]
byid = {m["id"]: (k, m) for k, v in M.items() if isinstance(v, list) for m in v if isinstance(m, dict) and "id" in m}
old = [t for t in T if t.get("name", "").startswith("Эффекты") or t.get("name", "") == "Звуки эффектов"]
for t in old: T.remove(t)
if old: print("убраны старые дорожки:", ", ".join(f"{t['name']} ({len(t['segments'])})" for t in old))

info = json.load(open(os.path.join(E, "pieces.json"), encoding="utf-8"))
main = next(t for t in T if t["type"] == "video")
tpl_seg = main["segments"][0]

def clone_refs(seg, skip=("hsl",)):
    out = []
    for r in seg["extra_material_refs"]:
        if r not in byid: continue
        k, m = byid[r]
        if k in skip: continue
        c = copy.deepcopy(m); c["id"] = nid(); M[k].append(c); byid[c["id"]] = (k, c); out.append(c["id"])
    return out

def video_mat(path):
    _, tpl = byid[tpl_seg["material_id"]]; m = copy.deepcopy(tpl)
    m.update(id=nid(), path=fwd(path), material_name=os.path.basename(path), duration=dur_us(path), width=1920, height=1080,
             local_material_id=str(uuid.uuid4()))
    if "unique_id" in m: m["unique_id"] = uuid.uuid4().hex
    m["has_audio"] = False
    M["videos"].append(m); byid[m["id"]] = ("videos", m); return m["id"]

tracks = []
for name in ("Эффекты A", "Эффекты B"):
    t = copy.deepcopy({k: v for k, v in main.items() if k != "segments"}); t.update(id=nid(), name=name, is_default_name=False, segments=[])
    tracks.append(t)
for i, pc in enumerate(info["pieces"]):
    mid = video_mat(pc["file"]); du = min(dur_us(pc["file"]), byid[mid][1]["duration"])
    s = copy.deepcopy(tpl_seg)
    s.update(id=nid(), material_id=mid, extra_material_refs=clone_refs(tpl_seg), source_timerange={"start": 0, "duration": du},
             target_timerange={"start": US(pc["s"]), "duration": du}, common_keyframes=[], keyframe_refs=[], volume=0.0,
             last_nonzero_volume=1.0, speed=1.0, visible=True, enable_hsl=False, enable_lut=False, enable_adjust=False)
    s["clip"] = {"scale": {"x": 1.0, "y": 1.0}, "rotation": 0.0, "transform": {"x": 0.0, "y": 0.0},
                 "flip": {"vertical": False, "horizontal": False}, "alpha": 1.0}
    tracks[i % 2]["segments"].append(s)

T.extend(tracks)   # над корректирующими слоями — цветокор графику не трогает
vend = max(s["target_timerange"]["start"] + s["target_timerange"]["duration"] for s in main["segments"])
if not TPL:
    print("Не нашёл проект-образец со звуком — звуки не вставлены. Перетащи", info["sfx"], "в CapCut на 0:00 вручную.")
    TPL = None
td = json.load(open(os.path.join(TPL, "draft_content.json"), encoding="utf-8")) if TPL else None
if td:
    # звук: устройство материала и ссылок берём из проекта-образца, где уже есть звук
    tby = {m["id"]: (k, m) for k, v in td["materials"].items() if isinstance(v, list) for m in v if isinstance(m, dict) and "id" in m}
    atr = next(t for t in td["tracks"] if t["type"] == "audio" and t["segments"])
    aseg = copy.deepcopy(atr["segments"][0])
    _, am = tby[aseg["material_id"]]; am = copy.deepcopy(am)
    sfx = info["sfx"]; sd = min(dur_us(sfx), vend)   # звуки ровно до конца ролика
    am.update(id=nid(), name=os.path.basename(sfx), path=fwd(sfx), duration=dur_us(sfx))
    if "unique_id" in am: am["unique_id"] = uuid.uuid4().hex
    M.setdefault("audios", []).append(am)
    refs = []
    for r in aseg["extra_material_refs"]:
        k, m = tby[r]; c = copy.deepcopy(m); c["id"] = nid(); M.setdefault(k, []).append(c); refs.append(c["id"])
    aseg.update(id=nid(), material_id=am["id"], extra_material_refs=refs, source_timerange={"start": 0, "duration": sd},
                target_timerange={"start": 0, "duration": sd}, volume=1.0, last_nonzero_volume=1.0, keyframe_refs=[], common_keyframes=[])
    atrack = copy.deepcopy({k: v for k, v in atr.items() if k != "segments"}); atrack.update(id=nid(), name="Звуки эффектов", is_default_name=False, segments=[aseg])
    T.append(atrack)
d["duration"] = vend
for i, t in enumerate(T):
    for s in t["segments"]: s["track_render_index"] = i

blob = json.dumps(d, ensure_ascii=False)
written = []
for root, _, files in os.walk(P):
    for f in files:
        if f in ("draft_content.json", "template-2.tmp", "template.tmp"):
            q = os.path.join(root, f)
            try: same = json.load(open(q, encoding="utf-8")).get("id") == d["id"]
            except Exception: same = False
            if same: open(q, "w", encoding="utf-8").write(blob); written.append(os.path.relpath(q, P))
print("бэкап:", bk)
print("добавлено: 2 дорожки эффектов (%d кусков) + дорожка звуков" % len(info["pieces"]))
print("записано:", written)
