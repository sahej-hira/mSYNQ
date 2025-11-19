# 🔧 Troubleshooting Guide

## Common Issues & Solutions

### Firebase Connection Issues

#### Issue: "Firebase is not defined"
**Symptoms:**
- Console error: `Firebase is not defined`
- App doesn't load
- White screen

**Solutions:**
1. Check `src/firebase.js` has correct config
2. Verify Firebase config is not empty
3. Check for typos in config
4. Ensure Firebase is imported correctly

```javascript
// Correct import
import { database } from '../firebase';
```

#### Issue: "Permission denied"
**Symptoms:**
- Console error: `PERMISSION_DENIED`
- Data doesn't sync
- Can't create/join rooms

**Solutions:**
1. Check Firebase Console → Realtime Database → Rules
2. Ensure rules allow read/write:
```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```
3. Click "Publish" after updating rules
4. Wait 30 seconds for rules to propagate

#### Issue: "Database URL is incorrect"
**Symptoms:**
- Connection fails
- Console error about database URL

**Solutions:**
1. Check `databaseURL` in `src/firebase.js`
2. Should be: `https://YOUR-PROJECT.firebaseio.com`
3. Get correct URL from Firebase Console
4. Ensure no trailing slash

### Video Player Issues

#### Issue: Videos don't load
**Symptoms:**
- Black screen
- Player doesn't appear
- Console errors about YouTube

**Solutions:**
1. Check video ID is valid
2. Try different video: `dQw4w9WgXcQ`
3. Check if video allows embedding
4. Verify YouTube API is loaded:

```javascript
console.log(window.YT); // Should not be undefined
```
5. Check browser console for errors
6. Try refreshing the page

#### Issue: Player not syncing
**Symptoms:**
- Host plays but guest doesn't
- Time drift is large
- Players out of sync

**Solutions:**
1. Check Firebase connection status
2. Verify both users in same room
3. Check console for errors
4. Refresh both browsers
5. Check network connection
6. Reduce `SYNC_THRESHOLD` in `useSyncedPlayer.js`

#### Issue: Infinite update loop
**Symptoms:**
- Console flooded with updates
- High CPU usage
- Player stutters

**Solutions:**
1. Check `isUpdatingRef` logic
2. Ensure cooldown periods work
3. Check event handlers don't trigger loops
4. Clear browser cache
5. Restart development server

### Room Issues

#### Issue: Can't join room
**Symptoms:**
- "Room not found"
- Join button doesn't work
- Nothing happens

**Solutions:**
1. Verify room ID is correct (case-sensitive)
2. Check room was created successfully
3. Verify Firebase connection
4. Check database rules
5. Try creating new room

#### Issue: Room ID not copying
**Symptoms:**
- Copy button doesn't work
- Clipboard empty

**Solutions:**
1. Check browser clipboard permissions
2. Try manual copy (Ctrl+C)
3. Use different browser
4. Check HTTPS (clipboard API requires HTTPS)

### Chat Issues

#### Issue: Messages not sending
**Symptoms:**
- Messages don't appear
- Send button doesn't work

**Solutions:**
1. Check Firebase rules include messages path
2. Verify room ID is correct
3. Check console for errors
4. Refresh page
5. Check network connection

#### Issue: Messages not appearing
**Symptoms:**
- Can send but can't see messages
- Other users' messages missing

**Solutions:**
1. Check Firebase listener is active
2. Verify database path: `rooms/{roomId}/messages`
3. Check console for errors
4. Clear browser cache

### Build Issues

#### Issue: Build fails
**Symptoms:**
- `npm run build` errors
- Compilation errors

**Solutions:**
1. Check Node.js version (need 18+):
```bash
node --version
```
2. Clear node_modules:
```bash
rm -rf node_modules
npm install
```
3. Clear npm cache:
```bash
npm cache clean --force
```
4. Check for syntax errors
5. Run ESLint:
```bash
npm run lint
```

#### Issue: Tailwind not working
**Symptoms:**
- No styles applied
- Plain HTML appearance

**Solutions:**
1. Check `tailwind.config.js` exists
2. Verify `@tailwind` directives in CSS
3. Restart dev server
4. Clear browser cache
5. Check PostCSS config

### Performance Issues

#### Issue: High CPU usage
**Symptoms:**
- Browser slow
- Fan spinning
- Lag

**Solutions:**
1. Check for infinite loops
2. Reduce drift check interval
3. Close other tabs
4. Check for memory leaks
5. Use production build

#### Issue: High memory usage
**Symptoms:**
- Browser uses lots of RAM
- Tab crashes

**Solutions:**
1. Check for memory leaks
2. Ensure cleanup functions run
3. Limit message history
4. Close unused rooms
5. Restart browser

#### Issue: Slow sync
**Symptoms:**
- Sync takes >1 second
- Noticeable delay

**Solutions:**
1. Check network speed
2. Reduce `SYNC_THRESHOLD`
3. Reduce `DRIFT_CHECK_INTERVAL`
4. Check Firebase region
5. Use wired connection

### Deployment Issues

#### Issue: Firebase deploy fails
**Symptoms:**
- Deploy command errors
- Authentication fails

**Solutions:**
1. Login to Firebase:
```bash
firebase login
```
2. Check project is selected:
```bash
firebase use --add
```
3. Verify `firebase.json` exists
4. Check build completed:
```bash
npm run build
```
5. Check Firebase CLI version:
```bash
firebase --version
```

#### Issue: Deployed app doesn't work
**Symptoms:**
- Works locally but not in production
- White screen in production

**Solutions:**
1. Check Firebase config in production
2. Verify environment variables
3. Check browser console
4. Check Firebase database rules
5. Verify HTTPS is enabled
6. Clear CDN cache

### Browser-Specific Issues

#### Chrome/Edge
- Clear cache: Ctrl+Shift+Delete
- Disable extensions
- Try incognito mode
- Check console (F12)

#### Firefox
- Clear cache: Ctrl+Shift+Delete
- Disable add-ons
- Try private window
- Check console (F12)

#### Safari
- Clear cache: Cmd+Option+E
- Disable extensions
- Try private window
- Check console (Cmd+Option+C)

### Mobile Issues

#### Issue: Not responsive
**Solutions:**
1. Check viewport meta tag
2. Test in Chrome DevTools mobile view
3. Check Tailwind responsive classes
4. Test on actual device

#### Issue: Touch controls don't work
**Solutions:**
1. Check touch event handlers
2. Test on actual device
3. Check button sizes (min 44x44px)
4. Verify no hover-only interactions

## Debugging Tips

### Enable Verbose Logging

Add to `useSyncedPlayer.js`:
```javascript
const DEBUG = true;

if (DEBUG) {
  console.log('Sync:', {
    currentTime,
    expectedTime,
    drift,
    isPlaying
  });
}
```

### Monitor Firebase

1. Open Firebase Console
2. Go to Realtime Database
3. Watch data update in real-time
4. Check for unexpected writes

### Network Throttling

Test with slow connections:
1. Open DevTools → Network
2. Select "Slow 3G"
3. Test sync behavior

### Check Firebase Usage

1. Firebase Console → Usage
2. Check connections
3. Check bandwidth
4. Check storage

## Error Messages

### "Failed to fetch"
- Network connection issue
- Check internet connection
- Check Firebase status
- Try different network

### "Quota exceeded"
- Firebase free tier limit reached
- Upgrade to Blaze plan
- Reduce usage
- Check for leaks

### "Invalid video ID"
- Video doesn't exist
- Video is private
- Video doesn't allow embedding
- Try different video

### "WebSocket connection failed"
- Network firewall blocking
- Check proxy settings
- Try different network
- Check Firebase status

## Getting Help

### Before Asking for Help

1. Check this troubleshooting guide
2. Check browser console for errors
3. Check Firebase Console for issues
4. Try in different browser
5. Try on different device
6. Check documentation

### Information to Provide

When reporting issues:
1. Browser and version
2. Operating system
3. Steps to reproduce
4. Expected vs actual behavior
5. Console errors (screenshot)
6. Network tab (screenshot)
7. Firebase database state

### Useful Commands

```bash
# Check versions
node --version
npm --version
firebase --version

# Clear everything
rm -rf node_modules package-lock.json
npm install

# Reset Firebase
firebase logout
firebase login

# Check build
npm run build
npm run preview

# Check for errors
npm run lint
```

## Still Having Issues?

1. Review all documentation
2. Check Firebase Console
3. Check browser console
4. Try example video IDs
5. Test in incognito mode
6. Clear all caches
7. Restart everything

---

**Most issues are solved by:**
1. ✅ Correct Firebase config
2. ✅ Proper database rules
3. ✅ Valid video IDs
4. ✅ Good network connection
5. ✅ Updated dependencies
