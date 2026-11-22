# python scripts/cutout.py public/media/v1.mp4 public/cut_v1 '[[3.0,5.5]]'
# cuts the person out of each frame in those seconds -> lets a huge word sit BEHIND the person
import cv2, numpy as np, sys, json, os
from rembg import new_session, remove
from PIL import Image
sess = new_session("u2net_human_seg")
vid, out = sys.argv[1], sys.argv[2]; wins = json.loads(sys.argv[3]); fps = 30
os.makedirs(out, exist_ok=True)
cap = cv2.VideoCapture(vid); i = 0; n = 0
while True:
    ok, fr = cap.read()
    if not ok: break
    if any(a * fps <= i <= b * fps for a, b in wins):
        rgb = cv2.cvtColor(fr, cv2.COLOR_BGR2RGB)
        m = np.array(remove(Image.fromarray(rgb).resize((540, 960)), session=sess, only_mask=True)).astype(np.float32) / 255
        M = cv2.GaussianBlur(np.clip((cv2.resize(m, (1080, 1920)) - 0.15) / 0.7, 0, 1), (5, 5), 0)
        Image.fromarray(np.dstack([rgb, (M * 255).astype(np.uint8)])).save(f"{out}/f{i}.webp", quality=88); n += 1
    i += 1
print("done", n)
