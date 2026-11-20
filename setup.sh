#!/bin/bash
# Скрипт установки для облачного окружения Claude Code.
# Целиком вставь его в поле «Setup script» окружения на claude.ai/code.
set -e

export DEBIAN_FRONTEND=noninteractive
SUDO=""; [ "$(id -u)" != "0" ] && SUDO="sudo"

# 1. ffmpeg, шрифты, утилиты
$SUDO apt-get update -y
$SUDO apt-get install -y ffmpeg wget unzip fonts-dejavu fonts-liberation

# 2. Google Chrome — все скиллы ищут его по пути /usr/bin/google-chrome
if [ ! -x /usr/bin/google-chrome ]; then
  wget -q -O /tmp/chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
    && $SUDO apt-get install -y /tmp/chrome.deb \
    || { $SUDO apt-get install -y chromium || $SUDO apt-get install -y chromium-browser; \
         $SUDO ln -sf "$(command -v chromium || command -v chromium-browser)" /usr/bin/google-chrome; }
fi

# 3. Python-пакеты: распознавание речи, лицо, картинки, скачивание с Google Drive
PIP_PKGS="faster-whisper numpy soundfile pillow opencv-python-headless mediapipe sherpa-onnx gdown"
python3 -m pip install -q $PIP_PKGS || python3 -m pip install -q --break-system-packages $PIP_PKGS

# 4. Node.js — нужен 20+
node -v || true

# 5. Свежие скиллы Нурсерика — каждый раз последняя версия.
#    Новые скиллы приходят сами, «Sync fork» не нужен.
mkdir -p "$HOME/.claude/skills"
rm -rf /tmp/proxima-skills
if git clone -q --depth 1 https://github.com/nurserikkoptileuov1-lang/montazh-skills /tmp/proxima-skills; then
  cp -r /tmp/proxima-skills/.claude/skills/. "$HOME/.claude/skills/"
  rm -rf /tmp/proxima-skills
  echo "Скиллы обновлены: $(ls "$HOME/.claude/skills" | wc -l) шт."
else
  echo "Не удалось скачать свежие скиллы — работаю с теми, что в папке"
fi

# 6. Модель распознавания русской речи (время слов) — в ~/models
M=sherpa-onnx-zipformer-ru-2024-09-18
if [ ! -d "$HOME/models/$M" ]; then
  mkdir -p "$HOME/models"
  wget -q -O /tmp/m.tar.bz2 "https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/$M.tar.bz2" \
    && tar xjf /tmp/m.tar.bz2 -C "$HOME/models" && rm -f /tmp/m.tar.bz2 \
    || echo "Модель распознавания не скачалась"
fi

# 7. clean-premium: в облаке рендерить через безэкранный Chrome (обычный зависает)
for f in "$HOME"/.claude/skills/clean-premium/template/render.mjs */.claude/skills/clean-premium/template/render.mjs; do
  [ -f "$f" ] && [ -x /opt/pw-browsers/chromium_headless_shell ] || continue
  grep -q chromium_headless_shell "$f" && continue
  sed -i "s|headless: true, executablePath: CHROME, args: \['|headless: 'shell', executablePath: '/opt/pw-browsers/chromium_headless_shell', args: ['--no-sandbox', '|" "$f"
done

ffmpeg -version | head -1
/usr/bin/google-chrome --version || true
echo "Окружение для монтажа готово"
