import sys, wave, numpy as np
from faster_whisper import WhisperModel
w = wave.open(sys.argv[1]); audio = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
model = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8")
segs, info = model.transcribe(audio, word_timestamps=True, vad_filter=False, beam_size=5, condition_on_previous_text=False)
out = open(sys.argv[2], "w", encoding="utf-8")
out.write(f"# lang {info.language} {info.language_probability:.2f}\n")
for sg in segs:
    out.write(f"## {sg.start:.2f}-{sg.end:.2f} {sg.text.strip()}\n")
    for x in sg.words:
        out.write(f"{x.start:.2f}\t{x.end:.2f}\t{x.word.strip()}\n")
