# Start Bolivia Blue con Paz

## Check Backend Window

Look for the **PowerShell window** that says "Starting backend..." at the top.

### ✅ If you see this - YOU'RE GOOD!
```
Bolivia Blue con Paz backend running on port 3000
CORS origin: http://localhost:5173
Starting scheduler with 900s interval
Refreshing blue rate and official rate...
```

### ❌ If you see an error, try these fixes:

---

## Fix 1: SQLite Error

If you see: `Error: Cannot find module 'better-sqlite3'` or similar

**In the backend window**, run:
```powershell
npm install
npm run dev
```

---

## Fix 2: Port Already in Use

If you see: `Error: listen EADDRINUSE: address already in use :::3000`

**In the backend window**, run:
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
npm run dev
```

---

## Fix 3: Database File Error

If you see errors about `blue.db`

**In the backend window**, run:
```powershell
Remove-Item blue.db -ErrorAction SilentlyContinue
npm run dev
```

---

## Fix 4: Start Manually (Cleanest Way)

Close all windows and do this step by step:

### Step 1: Backend
```powershell
cd "C:\Users\jonah\OneDrive\Documents\GitHub\Bolivia Blue Con Paz\backend"
npm run dev
```

Wait for: `Bolivia Blue con Paz backend running on port 3000`

### Step 2: Frontend (in NEW window)
```powershell
cd "C:\Users\jonah\OneDrive\Documents\GitHub\Bolivia Blue Con Paz\frontend"
npm run dev
```

Wait for: `VITE v5.x.x  ready in xxx ms`

### Step 3: Open Browser
http://localhost:5173

---

## What to Tell Me

Look at your **backend window** and tell me:

1. **What do you see?** (Copy the text)
2. **Is there an error?** (Copy the error message)
3. **Or is it running?** (You'll see "backend running on port 3000")

Then I can help you fix it! 🚀

