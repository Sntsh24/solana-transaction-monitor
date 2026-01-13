# Import Environment Variables to Vercel

There are 3 easy ways to import your `.env.local` file to Vercel:

---

## ✨ Method 1: Use the Import Script (Easiest)

Run this command in your terminal:

```bash
./import-env-to-vercel.sh
```

It will automatically:
1. Login to Vercel
2. Read your `.env.local` file
3. Push all variables to Vercel (Production, Preview, Development)

---

## 🔧 Method 2: Manual CLI Commands

If you prefer to do it manually:

```bash
# Login to Vercel
vercel login

# Add environment variable to all environments
vercel env add NEXT_PUBLIC_HELIUS_RPC_URL production
# Paste: https://mainnet.helius-rpc.com/?api-key=bf1fdace-ed05-416f-bc9f-e2f9a209adf9

vercel env add NEXT_PUBLIC_HELIUS_RPC_URL preview
# Paste: https://mainnet.helius-rpc.com/?api-key=bf1fdace-ed05-416f-bc9f-e2f9a209adf9

vercel env add NEXT_PUBLIC_HELIUS_RPC_URL development
# Paste: https://mainnet.helius-rpc.com/?api-key=bf1fdace-ed05-416f-bc9f-e2f9a209adf9
```

---

## 🌐 Method 3: Use Vercel Dashboard (No CLI needed)

If you don't want to use CLI:

1. Go to https://vercel.com
2. Click your project: **solana-transaction-monitor**
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Copy-paste:
   - **Name:** `NEXT_PUBLIC_HELIUS_RPC_URL`
   - **Value:** `https://mainnet.helius-rpc.com/?api-key=bf1fdace-ed05-416f-bc9f-e2f9a209adf9`
   - **Check all 3 boxes:** Production, Preview, Development
6. Click **Save**

---

## 🚀 After Importing

Once you've added the environment variables:

1. **Redeploy your project:**
   ```bash
   vercel --prod
   ```

   Or in the Vercel dashboard:
   - Go to **Deployments** tab
   - Click **"..."** on latest deployment
   - Click **"Redeploy"**

2. **Verify the deployment:**
   - Wait 2-3 minutes for build to complete
   - Open your Vercel URL
   - Navigate to `/ore` to see the dashboard

---

## ✅ Verify Environment Variables

To check if they were imported correctly:

```bash
# List all environment variables
vercel env ls

# Pull environment variables from Vercel
vercel env pull
```

Or in the dashboard:
- Go to **Settings** → **Environment Variables**
- You should see `NEXT_PUBLIC_HELIUS_RPC_URL` listed

---

## 🔍 Troubleshooting

**"vercel: command not found"**
```bash
npm install -g vercel
```

**"Not authorized"**
```bash
vercel login
# Follow the prompts to login
```

**"No project linked"**
```bash
vercel link
# Select your project: solana-transaction-monitor
```

---

## 📝 Note

The `.env.local` file is already in `.gitignore`, so your API key won't be committed to GitHub. The script and commands above are safe to use - they push the variables directly to Vercel's secure storage.
