# python scripts/facecheck.py NAME public/media/v1.mp4 -> seconds where graphics cover the face. Must print "none".
import sys, glob, re, cv2, numpy as np
from PIL import Image
comp, src = sys.argv[1], sys.argv[2]
det = cv2.FaceDetectorYN.create("models/yunet.onnx", "", (540, 960), 0.6)
cap = cv2.VideoCapture(src); bad = []
for f in sorted(glob.glob(f"out/fc_{comp}/o_*.png"), key=lambda x: int(re.findall(r"o_(\d+)", x)[0])):
    fr = int(re.findall(r"o_(\d+)", f)[0]); cap.set(1, fr); ok, img = cap.read()
    if not ok: continue
    _, faces = det.detect(cv2.resize(img, (540, 960)))
    if faces is None: continue
    x, y, w, h = [int(v * 2) for v in faces[0][:4]]
    m = 25; x0, y0, x1, y1 = max(0, x - m), max(0, y - m), min(1080, x + w + m), min(1920, y + h + m)
    hit = int((np.array(Image.open(f).convert("RGBA"))[..., 3] > 60)[y0:y1, x0:x1].sum())
    if hit > 400: bad.append((round(fr / 30, 1), hit))
print(comp, "FACE COVERED at:", bad if bad else "none")
