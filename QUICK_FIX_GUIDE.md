# 🔧 QUICK FIX: Import Error Solution

## The Error You're Seeing:
```
Unable to resolve "@/services/stockInsightsService" from "features\owner\screens\DashboardScreen.tsx"
```

## ✅ SOLUTION (Run This):

### Option 1: Double-click this file
```
fix-and-restart.bat
```
Located in: `c:\IT ELECTIVE 4\FINALS\Inventory\fix-and-restart.bat`

### Option 2: Run in terminal
```bash
cd "c:\IT ELECTIVE 4\FINALS\Inventory"
npx expo start --clear
```

## 🎯 What This Does:
1. ✅ Stops Metro bundler
2. ✅ Creates missing `.expo/types` directory
3. ✅ Clears Metro cache
4. ✅ Restarts Metro with clean cache

## ⏱️ Expected Result:
- Metro will restart (takes ~30 seconds)
- Import error will be gone
- App will load normally

## 🔍 Why This Happened:
- New file `stockInsightsService.ts` was created
- Metro bundler had old cache
- Cache didn't know about the new file
- Clearing cache fixes it

## 📝 Verification:
After running the fix, you should see:
```
✓ Metro bundler started
✓ JavaScript bundle built
✓ No import errors
```

## 🚨 If Still Not Working:

### Check 1: File exists?
```bash
dir "c:\IT ELECTIVE 4\FINALS\Inventory\services\stockInsightsService.ts"
```
Should show the file.

### Check 2: Full reset
```bash
cd "c:\IT ELECTIVE 4\FINALS\Inventory"
rmdir /s /q .expo
rmdir /s /q node_modules\.cache
npx expo start --clear
```

### Check 3: Restart computer
Sometimes Windows locks files. A restart helps.

## 💡 Quick Temporary Fix:
If you need to run RIGHT NOW without waiting for cache clear:

Edit `DashboardScreen.tsx` line 26:
```typescript
// Change this:
import { getStockInsights, type InsightsPeriod } from '@/services/stockInsightsService';

// To this (temporary):
import { getAnalytics as getStockInsights, type AnalyticsPeriod as InsightsPeriod } from '@/services/analyticsService';
```

This uses the old service temporarily. Switch back after clearing cache.

## ✅ Summary:
1. Run `fix-and-restart.bat` OR
2. Run `npx expo start --clear`
3. Wait 30 seconds
4. Error should be gone!

That's it! 🎉
