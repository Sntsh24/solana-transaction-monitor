# How to Add Environment Variable in Vercel

## 🎯 Visual Guide: Where to Add the Environment Variable

### **Scenario 1: Adding During Initial Deploy (Before First Deploy)**

When you import your repository and see the "Configure Project" screen:

```
┌─────────────────────────────────────────────────────────────┐
│  Configure Project                                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Project Name                                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ solana-transaction-monitor                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Framework Preset                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Next.js (detected automatically)                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Root Directory                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ./                                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ▼ Environment Variables  ← ← ← CLICK HERE TO EXPAND!      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Name (Key)                                            │  │
│  │ ┌────────────────────────────────────────────────┐   │  │
│  │ │ NEXT_PUBLIC_HELIUS_RPC_URL                      │   │  │
│  │ └────────────────────────────────────────────────┘   │  │
│  │                                                        │  │
│  │ Value                                                  │  │
│  │ ┌────────────────────────────────────────────────┐   │  │
│  │ │ https://mainnet.helius-rpc.com/?api-key=...    │   │  │
│  │ └────────────────────────────────────────────────┘   │  │
│  │                                                        │  │
│  │ Environment: ☑ Production ☑ Preview ☑ Development    │  │
│  │                                                        │  │
│  │ [Add] ← Click to add the variable                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│                                        [Deploy] ← Then click │
└─────────────────────────────────────────────────────────────┘
```

### **Scenario 2: Adding After Already Deployed (Fixing Failed Deploy)**

If you already deployed and it failed:

**Step 1: Go to your project dashboard**
- Visit https://vercel.com
- You'll see your project listed: `solana-transaction-monitor`
- Click on it

**Step 2: Navigate to Settings**
```
┌─────────────────────────────────────────────────────────────┐
│  solana-transaction-monitor                                  │
├─────────────────────────────────────────────────────────────┤
│  [Overview] [Deployments] [Analytics] [Settings] ← CLICK    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Step 3: Click Environment Variables in sidebar**
```
┌──────────────────────┬──────────────────────────────────────┐
│  Settings Menu       │  Environment Variables                │
│                      │                                       │
│  General             │  Add environment variables for this   │
│  Domains             │  project.                             │
│  Git                 │                                       │
│  → Environment       │  [Add New] ← CLICK THIS BUTTON       │
│    Variables         │                                       │
│  Functions           │  ┌─────────────────────────────────┐ │
│  Cron Jobs           │  │ No variables yet                 │ │
│  Security            │  └─────────────────────────────────┘ │
│                      │                                       │
└──────────────────────┴──────────────────────────────────────┘
```

**Step 4: Fill in the form**
```
┌─────────────────────────────────────────────────────────────┐
│  Add New Environment Variable                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Name                                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ NEXT_PUBLIC_HELIUS_RPC_URL                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Value                                                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ https://mainnet.helius-rpc.com/?api-key=bf1fdace...  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Environments                                                │
│  ☑ Production    (check this)                               │
│  ☑ Preview       (check this)                               │
│  ☑ Development   (check this)                               │
│                                                              │
│                                    [Cancel]  [Save]  ← CLICK│
└─────────────────────────────────────────────────────────────┘
```

**Step 5: Redeploy**
- Go to the "Deployments" tab
- Find the latest (failed) deployment
- Click the three dots "..." menu on the right
- Click "Redeploy"

---

## 📋 Copy-Paste Values

**Name:**
```
NEXT_PUBLIC_HELIUS_RPC_URL
```

**Value:**
```
https://mainnet.helius-rpc.com/?api-key=bf1fdace-ed05-416f-bc9f-e2f9a209adf9
```

**Environments:** Check ALL THREE boxes:
- ☑ Production
- ☑ Preview
- ☑ Development

---

## 🔍 Can't Find "Environment Variables"?

**During Import:**
- Look for a section that says "Environment Variables" - it might be collapsed/hidden
- It's usually between "Build Settings" and "Deploy" button
- Click the dropdown arrow (▼) to expand it

**In Settings:**
- After clicking "Settings" tab, look at the LEFT SIDEBAR
- Should be under "General" and above "Functions"
- If you don't see it, make sure you're logged in as the project owner

---

## ✅ How to Verify It Worked

After adding the variable and redeploying:
1. Wait 2-3 minutes for build to complete
2. Build should succeed with green checkmark ✓
3. You'll get a live URL
4. Open the URL on your phone
5. Go to `/ore` route to see the dashboard

---

## 🆘 Still Having Issues?

Take a screenshot of your Vercel screen and I can help you identify exactly where to click!
