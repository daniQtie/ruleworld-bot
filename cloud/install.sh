#!/usr/bin/env bash
# One-time setup of the Oracle Cloud "Always Free" server (Ampere A1 ARM, Ubuntu 22.04 or 24.04).
# Run as the default "ubuntu" user from the project folder:   bash cloud/install.sh
# Installs: Python venv + packages, ffmpeg, Node.js 20, Chromium (snap), fonts, the Telegram bot service and a swap file.
# It never prints secrets. Copy .env and secrets/ from the laptop BEFORE starting the service.
set -euo pipefail
cd "$(dirname "$0")/.."
APP="$(pwd)"

echo "== system packages"
sudo apt-get update -y
sudo apt-get install -y python3 python3-venv python3-pip ffmpeg fonts-liberation fonts-noto-color-emoji fontconfig \
     libsndfile1 curl ca-certificates unzip snapd
sudo snap install chromium || true

echo "== Node.js 20"
if ! command -v node >/dev/null || [ "$(node -v | cut -c2- | cut -d. -f1)" -lt 18 ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
(cd render && npm ci --omit=dev || npm install --omit=dev)

echo "== Python venv"
python3 -m venv .venv
.venv/bin/pip install --upgrade pip
.venv/bin/pip install -r cloud/requirements.txt

echo "== fonts used by captions"
mkdir -p ~/.fonts && cp -n assets/fonts/*.ttf ~/.fonts/ 2>/dev/null || true
fc-cache -f >/dev/null

echo "== 8 GB swap (renders + Whisper on 24 GB RAM, just in case)"
if ! swapon --show | grep -q /swapfile; then
  sudo fallocate -l 8G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi

echo "== time zone (logs in PHT; YouTube slots are computed in US Eastern by the code)"
sudo timedatectl set-timezone Asia/Manila || true

echo "== automatic security updates"
sudo apt-get install -y unattended-upgrades && sudo dpkg-reconfigure -f noninteractive unattended-upgrades || true

echo "== bot service"
sed -e "s#__APP__#${APP}#g" -e "s#__USER__#$(whoami)#g" cloud/ruleworld-bot.service | sudo tee /etc/systemd/system/ruleworld-bot.service >/dev/null
sudo systemctl daemon-reload
sudo systemctl enable ruleworld-bot
if [ -f .env ] && grep -q TELEGRAM_BOT_TOKEN .env; then
  sudo systemctl restart ruleworld-bot
  echo "✅ bot started. Logs: journalctl -u ruleworld-bot -f"
else
  echo "⚠️  .env is missing: copy .env and secrets/ from the laptop, then: sudo systemctl start ruleworld-bot"
fi

echo "== quick render test (1 frame)"
node -e "console.log('node', process.version)"
ls /snap/bin/chromium && echo "chromium ok"
