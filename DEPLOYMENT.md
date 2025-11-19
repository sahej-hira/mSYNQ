# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Firebase account
- Git (optional)

## Step 1: Firebase Setup

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "syncplay-app")
4. Disable Google Analytics (optional)
5. Click "Create project"

### Enable Realtime Database

1. In Firebase Console, go to "Build" → "Realtime Database"
2. Click "Create Database"
3. Choose location (closest to your users)
4. Start in "Test mode" (for development)
5. Click "Enable"

### Configure Database Rules

1. Go to "Rules" tab
2. Replace with:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true,
        ".indexOn": ["lastUpdated"]
      }
    }
  }
}
```

3. Click "Publish"

### Get Firebase Config

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps"
3. Click web icon (</>)
4. Register app (name: "SyncPlay Web")
5. Copy the firebaseConfig object

## Step 2: Configure Application

### Update Firebase Config

Edit `src/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxxxxxxxxxx"
};
```

## Step 3: Local Development

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open http://localhost:5173

## Step 4: Production Build

### Build Application

```bash
npm run build
```

This creates optimized files in `dist/` folder.

### Test Production Build

```bash
npm run preview
```

## Step 5: Deploy to Firebase Hosting

### Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Login to Firebase

```bash
firebase login
```

### Initialize Firebase Hosting

```bash
firebase init hosting
```

Configuration:
- Use existing project: Select your project
- Public directory: `dist`
- Single-page app: `Yes`
- GitHub deploys: `No`

### Deploy

```bash
npm run build
firebase deploy --only hosting
```

Your app is now live at: `https://your-project.web.app`

## Alternative Deployment Options

### Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
npm run build
vercel --prod
```

### Netlify

1. Install Netlify CLI:
```bash
npm i -g netlify-cli
```

2. Deploy:
```bash
npm run build
netlify deploy --prod --dir=dist
```

### GitHub Pages

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add to package.json:
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  },
  "homepage": "https://yourusername.github.io/syncplay"
}
```

3. Deploy:
```bash
npm run deploy
```

## Environment Variables (Optional)

For better security, use environment variables:

1. Create `.env`:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_DATABASE_URL=your_db_url
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

2. Update `src/firebase.js`:
```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ... etc
};
```

## Production Checklist

- [ ] Firebase config updated
- [ ] Database rules configured
- [ ] App builds without errors
- [ ] Tested in production mode
- [ ] HTTPS enabled
- [ ] Custom domain configured (optional)
- [ ] Analytics setup (optional)
- [ ] Error monitoring (optional)

## Monitoring

### Firebase Console

Monitor usage:
- Realtime Database → Usage tab
- Hosting → Usage tab

### Performance

Add Firebase Performance Monitoring:

```bash
npm install firebase
```

```javascript
import { getPerformance } from 'firebase/performance';
const perf = getPerformance(app);
```

## Troubleshooting

**Build fails:**
- Check Node.js version (18+)
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm cache clean --force`

**Firebase connection fails:**
- Verify config is correct
- Check database rules
- Ensure database URL is correct

**Videos don't load:**
- Check YouTube API availability
- Verify video IDs are valid
- Check browser console for errors

## Cost Estimation

Firebase Free Tier (Spark Plan):
- Realtime Database: 1GB storage, 10GB/month download
- Hosting: 10GB storage, 360MB/day transfer
- Suitable for ~1000 daily users

Paid Plan (Blaze):
- Pay as you go
- ~$0.50-2.00 per 1000 users/day
- Monitor usage in Firebase Console
