# Quick Test Guide - Activity Log Feature

## 🚀 How to Test Locally

### Step 1: Start Development Server
```bash
cd employee-eligibility-checker
npm run dev
```
Open: http://localhost:3000

---

### Step 2: Test All 5 Flows

#### ✅ Test 1: Eligible Employee WITH Mobile (Just Check)
1. Enter an existing employee ID that has a mobile number
2. Click "Check Eligibility"
3. You'll see green "Eligible" badge with mobile number
4. **Don't click anything else**

**Check Google Sheet → Activity Log tab:**
```
Should see: | [Timestamp] | PS123456 | Yes | 9876543210 | Checked |
```

---

#### ✅ Test 2: Eligible Employee WITHOUT Mobile (Add Mobile)
1. Enter an existing employee ID that has NO mobile number
2. Click "Check Eligibility"
3. You'll see "No mobile number on record"
4. Enter mobile: `9123456789`
5. Click "Save Mobile Number"

**Check Google Sheet → Activity Log tab:**
```
Row 1: | [Timestamp] | PS789012 | Yes | -          | Checked      |
Row 2: | [Timestamp] | PS789012 | Yes | 9123456789 | Mobile Added |
```

---

#### ✅ Test 3: Eligible Employee WITH Mobile (Edit Mobile)
1. Enter an existing employee ID that has a mobile number
2. Click "Check Eligibility"
3. Click "Edit" button
4. Change mobile to: `9999888877`
5. Click "Save Mobile Number"

**Check Google Sheet → Activity Log tab:**
```
Row 1: | [Timestamp] | PS456789 | Yes | 9876543210 | Checked        |
Row 2: | [Timestamp] | PS456789 | Yes | 9999888877 | Mobile Updated |
```

---

#### ✅ Test 4: Non-Eligible Employee (Just Check)
1. Enter a random employee ID that doesn't exist: `PS999999`
2. Click "Check Eligibility"
3. You'll see red "Not Eligible" badge
4. **Don't enter mobile number**

**Check Google Sheet → Activity Log tab:**
```
Should see: | [Timestamp] | PS999999 | No | - | Checked |
```

---

#### ✅ Test 5: Non-Eligible Employee (Add Mobile)
1. Enter a random employee ID that doesn't exist: `PS888888`
2. Click "Check Eligibility"
3. You'll see red "Not Eligible" badge
4. Enter mobile: `9111222333`
5. Click "Save Mobile Number"

**Check Google Sheet → Activity Log tab:**
```
Row 1: | [Timestamp] | PS888888 | No | -          | Checked      |
Row 2: | [Timestamp] | PS888888 | No | 9111222333 | Mobile Added |
```

---

## 📊 What to Look For in Google Sheets

### Main Employee Sheet
- Should remain unchanged except for mobile number updates
- Still has columns: Employee ID | Mobile Number | Status

### Activity Log Sheet (NEW - Auto-Created)
- Should appear as a new tab called "Activity Log"
- Headers: `Timestamp | Employee ID | Eligible | Mobile Number | Action`
- Every search creates a new row
- Every mobile save creates another row
- Timestamps should be in format: `2026-02-15 14:30:25`

---

## 🎯 Success Criteria

✅ Activity Log sheet is automatically created
✅ All 5 test flows log correctly
✅ Timestamps are readable (not epoch time)
✅ Eligible shows "Yes" or "No" (not true/false)
✅ Mobile shows actual number or "-" (not null)
✅ Action shows correct type (Checked/Mobile Added/Mobile Updated)
✅ Main employee sheet still works normally
✅ No errors in browser console
✅ No errors in terminal/server logs

---

## 🐛 If Something Goes Wrong

### Activity Log Sheet Not Created
- Check server logs for errors
- Verify Google Sheets API permissions
- Try refreshing the page and searching again

### Logging Errors But App Works
- This is expected! Logging failures don't break the app
- Check server logs to see the error
- Main functionality should continue working

### Timestamps Look Wrong
- They should be: `2026-02-15 14:30:25`
- NOT: `1739623825000` (epoch time)
- If wrong format, report the issue

---

## 🚀 Ready to Push?

After all tests pass:

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "Add Activity Log tracking for event analytics

- Auto-creates 'Activity Log' sheet in Google Sheets
- Logs all employee searches (eligible & non-eligible)
- Logs all mobile number saves (add & update)
- Tracks timestamp, employee ID, eligibility, mobile, action type
- Enables post-event analytics and reporting
- No additional env vars needed
- Logging errors don't break main functionality

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Push to GitHub
git push origin main
```

Then deploy to Render (auto-deploy if configured, or manual deploy).

---

## 📞 Post-Deployment Test on Render

After deploying:
1. Visit your Render URL
2. Run Test 1 (check eligible employee)
3. Open Google Sheet
4. Verify Activity Log tab exists and has the entry
5. If works, all other flows will work too!

**Done! 🎉**
