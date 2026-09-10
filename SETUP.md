# 💰 Sajeev & Shikha Finance Tracker — Setup Guide (Mac)

## What you're setting up
A personal finance tracking app running locally on your Mac.
Accessible by both you and Shikha on any device on your home WiFi.

---

## Step 1 — Install Node.js (one time only)

Open Terminal (Cmd + Space → type "Terminal") and run:

```bash
# Install Homebrew (Mac package manager) if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Verify it worked
node --version   # should show v18 or higher
npm --version    # should show a version number
```

---

## Step 2 — Set up the app

```bash
# Navigate to where you want the app to live
cd ~/Documents

# Copy the finance-app folder here (from wherever you downloaded it)
# Then enter the folder
cd finance-app

# Install dependencies (takes 1-2 minutes)
npm install

# Initialize the database (creates your users + seed data)
npm run db:init
```

You should see:
```
✅ Users created: sajeev / shikha (password: finance2026)
✅ Loans seeded
✅ Goals seeded
✅ Database initialized
```

---

## Step 3 — Start the app

```bash
npm run dev
```

You'll see:
```
▲ Next.js 14.2.3
- Local:    http://localhost:3000
- Network:  http://192.168.x.x:3000   ← this is for Shikha's phone
```

Open http://localhost:3000 in your browser.

**Login credentials:**
- Username: `sajeev` or `shikha`
- Password: `finance2026`

> ⚠️ Change passwords after first login by editing scripts/init-db.js and re-running npm run db:init

---

## Step 4 — Access from Shikha's phone (same WiFi)

1. Make sure both devices are on the same WiFi
2. Look at the Network address in the terminal (e.g. `http://192.168.1.42:3000`)
3. Shikha opens that URL on her phone browser
4. She can log in with username `shikha`, password `finance2026`
5. Optional: she adds it to home screen (Safari → Share → Add to Home Screen) for app-like experience

---

## Step 5 — Access from ANYWHERE with Tailscale (optional but recommended)

This lets you both access the app even when you're in Lyon, Paris, or India.

```bash
# Install Tailscale
brew install --cask tailscale
```

1. Open Tailscale from Applications
2. Create a free account at tailscale.com
3. Install Tailscale on Shikha's phone too (free iOS/Android app)
4. Both sign in to the same Tailscale account
5. Your Mac gets a Tailscale IP like `100.x.x.x`
6. Shikha accesses `http://100.x.x.x:3000` from anywhere in the world

**Cost: €0 forever for personal use.**

---

## Step 6 — Make it start automatically on Mac login

```bash
# Create a Launch Agent so the app starts when your Mac boots
mkdir -p ~/Library/LaunchAgents

cat > ~/Library/LaunchAgents/com.finance-app.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.finance-app</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/node</string>
    <string>/Users/YOUR_USERNAME/Documents/finance-app/node_modules/.bin/next</string>
    <string>start</string>
  </array>
  <key>WorkingDirectory</key>
  <string>/Users/YOUR_USERNAME/Documents/finance-app</string>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
</dict>
</plist>
EOF

# Replace YOUR_USERNAME with your actual Mac username
# Find it with: whoami

# Load it
launchctl load ~/Library/LaunchAgents/com.finance-app.plist
```

> For development (with hot reload): use `npm run dev`
> For permanent running: first build with `npm run build`, then it auto-starts

---

## Backup your data

Your entire database is one file: `finance-app/data/finance.db`

To back it up:
```bash
cp ~/Documents/finance-app/data/finance.db ~/Desktop/finance-backup-$(date +%Y%m%d).db
```

Or set up automatic backup to iCloud:
```bash
# Add to crontab (runs backup every Sunday at 8am)
crontab -e
# Add this line:
0 8 * * 0 cp ~/Documents/finance-app/data/finance.db ~/Library/Mobile\ Documents/com~apple~CloudDocs/finance-backup.db
```

---

## Updating the app in the future

When Claude gives you updated code, just replace the relevant files and restart:
```bash
# Stop the running app: Ctrl+C in terminal
# Replace files
# Restart:
npm run dev
```

---

## Troubleshooting

**Port 3000 already in use:**
```bash
npm run dev -- -p 3001
# Access on http://localhost:3001
```

**Database error:**
```bash
rm -rf data/
npm run db:init
npm run dev
```

**Can't find app on Shikha's phone:**
- Make sure Mac firewall allows port 3000: System Settings → Network → Firewall → Options → Allow next.js

---

## App Features

| Tab | What it does |
|-----|-------------|
| 📊 KPIs | Live dashboard — loan countdown, goals, charts |
| ✏️ Track Month | Enter monthly income + expenses |
| 📈 Investments | Update PEA, AV, PEE, Livret A balances |
| 💳 Loans | Track loan capital, mark as cleared |
| 🎯 Goals | See all financial goals and progress |
| 📅 History | 6-month expense history + charts |
