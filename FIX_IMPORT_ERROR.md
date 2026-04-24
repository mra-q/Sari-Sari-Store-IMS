# Fix: "Unable to resolve @/services/stockInsightsService" Error

## Problem
Metro bundler cache is stale and doesn't recognize the new `stockInsightsService.ts` file.

## Quick Fix (Choose ONE method)

### Method 1: Clear Cache Script (Easiest)
```bash
cd "c:\IT ELECTIVE 4\FINALS\Inventory"
clear-cache.bat
```

### Method 2: Manual Commands
```bash
cd "c:\IT ELECTIVE 4\FINALS\Inventory"

# Stop Metro
# Press Ctrl+C in the terminal running Metro

# Clear cache and restart
npx expo start --clear
```

### Method 3: Full Reset (If above don't work)
```bash
cd "c:\IT ELECTIVE 4\FINALS\Inventory"

# 1. Stop Metro (Ctrl+C)

# 2. Clear all caches
rmdir /s /q .expo
rmdir /s /q node_modules\.cache

# 3. Restart
npx expo start --clear
```

## Why This Happens
- Metro bundler caches module resolutions
- New files aren't detected until cache is cleared
- The `.expo/types` directory needs to be regenerated

## Verification
After clearing cache, you should see:
```
✓ Metro bundler started
✓ Loaded @/services/stockInsightsService
✓ No import errors
```

## If Still Not Working

Check that the file exists:
```bash
dir "c:\IT ELECTIVE 4\FINALS\Inventory\services\stockInsightsService.ts"
```

Should show:
```
stockInsightsService.ts
```

## Alternative: Temporary Fallback

If you need to run immediately, you can temporarily use the old service:

In `DashboardScreen.tsx`, change:
```typescript
import { getStockInsights, type InsightsPeriod } from '@/services/stockInsightsService';
```

To:
```typescript
import { getAnalytics as getStockInsights, type AnalyticsPeriod as InsightsPeriod } from '@/services/analyticsService';
```

This will work until Metro cache is cleared, then switch back to the new service.
