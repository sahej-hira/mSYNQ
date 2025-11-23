# Testing Guide

## Manual Testing

### Test Scenario 1: Create and Join Room

**Steps:**
1. Open app in Browser 1
2. Enter username "Alice"
3. Click "Create New Room"
4. Copy room ID
5. Open app in Browser 2 (incognito/different browser)
6. Enter username "Bob"
7. Paste room ID
8. Click "Join Room"

**Expected:**
- Both users see the same video
- Connection status shows "Connected"
- Alice shows "Host" badge
- Bob shows "Guest" status

### Test Scenario 2: Playback Sync

**Steps:**
1. Host clicks Play
2. Wait 5 seconds
3. Check guest player

**Expected:**
- Guest player starts playing automatically
- Both players show same timestamp (±0.5s)
- Sync indicator shows "Synced"

### Test Scenario 3: Pause Sync

**Steps:**
1. Host clicks Pause
2. Check guest player immediately

**Expected:**
- Guest player pauses automatically
- Both show same timestamp
- Play button appears for host

### Test Scenario 4: Seek Sync

**Steps:**
1. Host seeks to 1:30 (90 seconds)
2. Check guest player

**Expected:**
- Guest player jumps to 1:30
- Both players synchronized
- Playback continues if was playing

### Test Scenario 5: Video Change

**Steps:**
1. Host clicks "Change Video"
2. Enter new video ID: "jNQXAC9IVRw"
3. Click "Load"
4. Check guest player

**Expected:**
- Guest player loads new video
- Both start at 0:00
- Video paused by default

### Test Scenario 6: Chat

**Steps:**
1. Alice types "Hello!"
2. Bob types "Hi there!"

**Expected:**
- Messages appear in both chats
- Usernames displayed correctly
- Messages in chronological order

### Test Scenario 7: Drift Correction

**Steps:**
1. Start playback
2. Manually seek guest player (open dev tools)
3. Wait 2-3 seconds

**Expected:**
- Guest player auto-corrects
- Syncs back to host position
- Sync indicator briefly shows "Syncing..."

### Test Scenario 8: Reconnection

**Steps:**
1. Start playback
2. Disable network on guest
3. Wait 5 seconds
4. Re-enable network

**Expected:**
- Connection status shows "Disconnected"
- After reconnect, shows "Connected"
- Player syncs to current position
- No errors in console

### Test Scenario 9: Late Join

**Steps:**
1. Host starts video at 2:00
2. New user joins room

**Expected:**
- New user's player seeks to 2:00
- Playback state matches (playing/paused)
- Sync happens within 1 second

### Test Scenario 10: Multiple Guests

**Steps:**
1. Host creates room
2. Guest 1 joins
3. Guest 2 joins
4. Guest 3 joins
5. Host controls playback

**Expected:**
- All guests stay synchronized
- Chat works for all users
- No performance degradation

## Browser Compatibility Testing

Test in:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

## Performance Testing

### Metrics to Check

1. **Initial Load Time**
   - Target: < 3 seconds
   - Measure: Network tab in DevTools

2. **Sync Latency**
   - Target: < 500ms
   - Measure: Time from host action to guest sync

3. **Memory Usage**
   - Target: < 100MB
   - Measure: Performance tab in DevTools

4. **CPU Usage**
   - Target: < 10% idle, < 30% during playback
   - Measure: Task Manager

### Load Testing

Test with multiple users:
- 2 users: Should work perfectly
- 5 users: Should work well
- 10 users: May see slight delays
- 20+ users: Consider Firebase upgrade

## Automated Testing (Future)

### Unit Tests Example

```javascript
// useSyncedPlayer.test.js
import { renderHook } from '@testing-library/react-hooks';
import { useSyncedPlayer } from './useSyncedPlayer';

test('calculates drift correctly', () => {
  const { result } = renderHook(() => useSyncedPlayer('room1', 'user1', false));
  
  const drift = result.current.calculateDrift(100, 100.6);
  expect(drift).toBe(0.6);
});
```

### Integration Tests Example

```javascript
// SyncRoom.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { SyncRoom } from './SyncRoom';

test('host can control playback', () => {
  render(<SyncRoom roomId="test" userId="host" isHost={true} />);
  
  const playButton = screen.getByRole('button', { name: /play/i });
  fireEvent.click(playButton);
  
  expect(playButton).toHaveTextContent('Pause');
});
```

## Debugging Tips

### Enable Verbose Logging

Add to `useSyncedPlayer.js`:

```javascript
const DEBUG = true;

if (DEBUG) {
  console.log('Sync state:', {
    currentTime,
    expectedTime,
    drift,
    isPlaying: roomState.isPlaying
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
1. Open DevTools → Network tab
2. Select "Slow 3G"
3. Test sync behavior

### Common Issues

**Issue: Players not syncing**
- Check: Firebase connection
- Check: Database rules
- Check: Console errors
- Solution: Verify config in firebase.js

**Issue: High drift**
- Check: Network latency
- Check: SYNC_THRESHOLD value
- Solution: Reduce threshold or improve network

**Issue: Infinite update loop**
- Check: isUpdatingRef logic
- Check: Event handlers
- Solution: Add proper guards

**Issue: Chat not working**
- Check: Firebase rules for messages
- Check: Message structure
- Solution: Verify database path

## Test Checklist

Before deploying:

- [ ] All manual tests pass
- [ ] No console errors
- [ ] No console warnings
- [ ] Works in all major browsers
- [ ] Mobile responsive
- [ ] Firebase costs acceptable
- [ ] Performance metrics met
- [ ] Security rules configured
- [ ] Error handling works
- [ ] Reconnection works

## Reporting Issues

When reporting bugs, include:
1. Browser and version
2. Steps to reproduce
3. Expected vs actual behavior
4. Console errors
5. Network tab screenshot
6. Firebase database state
