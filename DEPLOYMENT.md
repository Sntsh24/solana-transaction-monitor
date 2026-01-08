# 🚀 Deploy to Vercel - Quick Guide

Your $ORE Token Dashboard is ready to deploy! Follow these simple steps to access it on your phone.

## ✅ Easy Deployment via GitHub (Recommended)

### Step 1: Go to Vercel
1. Visit **https://vercel.com**
2. Click **"Sign Up"** or **"Log In"**
3. Use **"Continue with GitHub"** to login

### Step 2: Import Your Repository
1. Click **"Add New..."** → **"Project"**
2. Find and select: **`Sntsh24/solana-transaction-monitor`**
3. Click **"Import"**

### Step 3: Configure Environment Variable
**IMPORTANT:** Before deploying, add your Helius API key:

1. Expand **"Environment Variables"** section
2. Add variable:
   - **Name:** `NEXT_PUBLIC_HELIUS_RPC_URL`
   - **Value:** Your full Helius RPC URL (e.g., `https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY`)
   - **Environment:** Production, Preview, Development (select all)

### Step 4: Deploy
1. Leave all other settings as default
2. Click **"Deploy"**
3. Wait 2-3 minutes for build to complete

### Step 5: Access on Your Phone
1. Once deployed, Vercel will show your app URL: `https://your-app.vercel.app`
2. Click the URL or copy it
3. Open it on your phone!

**Dashboard URLs:**
- Main Monitor: `https://your-app.vercel.app/`
- $ORE Dashboard: `https://your-app.vercel.app/ore`

---

## 🔄 Auto-Deployment

Once set up, Vercel will **automatically redeploy** whenever you push changes to GitHub! No manual deployment needed.

---

## 🛠️ Alternative: Deploy via CLI

If you prefer using the command line:

```bash
# Login to Vercel
vercel login

# Deploy
vercel --prod

# Add environment variable
vercel env add NEXT_PUBLIC_HELIUS_RPC_URL
```

---

## 📱 Accessing on Your Phone

After deployment, you'll get a URL like: `https://solana-transaction-monitor-abc123.vercel.app`

**Bookmark these on your phone:**
- Main dashboard: `https://your-url.vercel.app/`
- $ORE dashboard: `https://your-url.vercel.app/ore`

---

## 🔐 Security Note

Your Helius API key is stored securely as an environment variable on Vercel. It won't be exposed in the client code, but since we're using `NEXT_PUBLIC_*`, it will be visible in the browser. For production use, consider implementing a backend API route to proxy requests.

---

## ❓ Troubleshooting

**Build fails?**
- Make sure you added the `NEXT_PUBLIC_HELIUS_RPC_URL` environment variable
- Check that your Helius API key is valid

**Dashboard shows error?**
- Verify your Helius RPC URL is correct
- Make sure the $ORE mint address is correct: `oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp`

**Need help?**
- Check the Vercel deployment logs in the dashboard
- Verify all environment variables are set correctly

---

## 🎉 That's It!

Your $ORE DCA monitoring dashboard is now live and accessible from anywhere! Share the URL with others to let them monitor $ORE transactions too.
