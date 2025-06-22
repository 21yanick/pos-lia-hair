# Mobile PDF Solution

## Problem
"Dieser Inhalt ist blockiert" - Mobile browsers block PDFs in iframes due to security headers from Supabase Storage.

## Root Cause
Supabase Storage URLs include security headers:
- `X-Frame-Options: DENY` 
- `Content-Security-Policy: frame-ancestors 'none'`

These prevent embedding in iframes (protection against clickjacking).

## Solution
Instead of fighting the security headers, we now use native mobile PDF handling:

### iOS (Safari)
```typescript
// Opens in new tab - Safari handles PDFs excellently
window.open(url, '_blank')
```

### Android & Other Mobile
```typescript
// Direct navigation - browser's built-in PDF viewer
window.location.href = url
```

### Fallback
```typescript
// Download if browser can't display PDFs inline
const link = document.createElement('a')
link.href = url
link.download = 'dokument.pdf'
link.click()
```

## Implementation Changes

### 1. Removed iframe approach
- No more modal with iframe on mobile
- Eliminated security header conflicts
- Better performance (no double loading)

### 2. Native PDF handling
- iOS: New tab (users can swipe back)
- Android: Direct navigation (back button works)
- Fallback: Download for older browsers

### 3. Return URL tracking
```typescript
// Save where user came from
sessionStorage.setItem('pdf_return_url', currentUrl)
```

## Benefits
✅ No more "content blocked" errors
✅ Native pinch-to-zoom
✅ Native PDF controls
✅ Better performance
✅ Works with all security headers
✅ Consistent with mobile UX patterns

## Testing
1. iOS Safari: PDF opens in new tab
2. Android Chrome: PDF opens with back navigation
3. Older browsers: PDF downloads

## User Experience
- **iOS**: Swipe from left edge to go back
- **Android**: Use back button or gesture
- **Download**: File saved to device

This approach respects security headers while providing a smooth mobile experience.