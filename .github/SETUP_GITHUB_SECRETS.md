# Setting Up GitHub Secrets for Deployment

The GitHub Actions need your Firebase credentials to build and deploy the app. You need to add these as **GitHub Secrets**.

## Why Secrets?

GitHub Secrets keep your Firebase credentials secure. They're encrypted and only accessible during GitHub Actions runs.

## Required Secrets

You need to add these 8 secrets to your GitHub repository:

1. `VITE_FIREBASE_API_KEY`
2. `VITE_FIREBASE_AUTH_DOMAIN`
3. `VITE_FIREBASE_DATABASE_URL`
4. `VITE_FIREBASE_PROJECT_ID`
5. `VITE_FIREBASE_STORAGE_BUCKET`
6. `VITE_FIREBASE_MESSAGING_SENDER_ID`
7. `VITE_FIREBASE_APP_ID`
8. `VITE_FIREBASE_MEASUREMENT_ID`

## How to Add Secrets

### Step 1: Go to Repository Settings

1. Go to your repository: https://github.com/AyushPathak2610/mSYNQ
2. Click **Settings** (top menu)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**

### Step 2: Add Each Secret

For each secret, you'll:
1. Click **New repository secret**
2. Enter the **Name** (exactly as shown above)
3. Enter the **Value** (from your `.env` file)
4. Click **Add secret**

### Step 3: Get Values from Your .env File

Open your local `.env` file and copy the values:

```env
VITE_FIREBASE_API_KEY=your_actual_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Example: Adding the First Secret

**Name:** `VITE_FIREBASE_API_KEY`
**Value:** `your_actual_api_key_from_env_file`

Repeat for all 8 secrets.

## Verify Secrets Are Added

After adding all secrets, you should see them listed:

```
✅ VITE_FIREBASE_API_KEY
✅ VITE_FIREBASE_AUTH_DOMAIN
✅ VITE_FIREBASE_DATABASE_URL
✅ VITE_FIREBASE_PROJECT_ID
✅ VITE_FIREBASE_STORAGE_BUCKET
✅ VITE_FIREBASE_MESSAGING_SENDER_ID
✅ VITE_FIREBASE_APP_ID
✅ VITE_FIREBASE_MEASUREMENT_ID
✅ FIREBASE_SERVICE_ACCOUNT_MSYNQ_F81A4 (already exists)
```

## Test the Deployment

After adding secrets:

1. Make a small change to any file
2. Commit and push:
   ```bash
   git add .
   git commit -m "fix: update GitHub Actions with build step"
   git push
   ```
3. Go to **Actions** tab on GitHub
4. Watch the deployment run
5. It should succeed this time! ✅

## What the GitHub Action Does

When you push to `main`:

1. **Checkout code** - Gets your code
2. **Setup Node.js** - Installs Node.js 20
3. **Install dependencies** - Runs `npm ci`
4. **Build app** - Runs `npm run build` with your secrets as environment variables
5. **Deploy** - Uploads the `dist` folder to Firebase Hosting

## Troubleshooting

### "Secret not found"
- Make sure secret names are EXACTLY as shown (case-sensitive)
- No extra spaces in names or values

### "Build failed"
- Check the Actions log for specific errors
- Verify all 8 secrets are added
- Make sure values are correct (no quotes, no extra spaces)

### "Deploy failed"
- Check Firebase service account secret exists
- Verify Firebase project ID is correct

## Security Notes

✅ **Safe:**
- Secrets are encrypted
- Only visible during Actions runs
- Not visible in logs
- Not accessible to forks

⚠️ **Never:**
- Share secret values publicly
- Commit secrets to code
- Post secrets in issues/PRs

---

**After setting up secrets, your app will auto-deploy on every push to main!** 🚀
