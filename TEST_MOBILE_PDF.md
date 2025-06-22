# Mobile PDF Test Guide

## Quick Test Steps

### 1. Deploy Changes
```bash
npm run build
npm run deploy
```

### 2. Test on iOS (iPhone/iPad)
1. Open pos.lia-hair.ch on Safari
2. Go to Transactions page
3. Tap a PDF icon
4. ✅ PDF should open in new tab
5. ✅ Swipe from left edge to go back

### 3. Test on Android
1. Open pos.lia-hair.ch on Chrome
2. Go to Transactions page  
3. Tap a PDF icon
4. ✅ PDF should open in same tab
5. ✅ Use back button/gesture to return

### 4. Expected Console Logs
```
[PDFManager] Mobile PDF handling for: <transaction-id>
[OrganizationPersistence] Using localStorage for storage
```

### 5. NO More Errors Like
❌ "Dieser Inhalt ist blockiert"
❌ "Refused to frame 'https://...'"
❌ CSP violations

## If Issues Persist

1. **Clear browser cache** (wichtig!)
2. **Check console** for new error messages
3. **Verify deployment** completed successfully

## Success Indicators
- PDFs open without security warnings
- Navigation back to app works
- No iframe-related errors in console
- Mobile users can view/zoom PDFs naturally