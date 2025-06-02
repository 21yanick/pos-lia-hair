# Settlement Import Debugging Guide

## Steps to Debug Failed Import

1. **Open Browser Console** (F12 → Console tab)
2. **Upload SumUp CSV file** through Settings → Settlement Import
3. **Check for these log patterns:**

### File Reading Issues
```
🚀 Starting settlement import for file: [filename] [size] bytes
📝 File validation result: {valid: true/false}
📄 File content length: [X] characters
📄 First 200 chars: [preview]
```

### CSV Parsing Issues  
```
🔍 Starting SumUp CSV parsing...
📄 Total lines in CSV: [X]
📄 Header line: [header content]
📝 Line [X]: [Y] fields
⏭️ Skipping line [X]: insufficient fields ([Y] < 21)
⏭️ Skipping line [X]: status is "[status]" (not "Erfolgreich")
⏭️ Skipping line [X]: missing settlement data
```

### Matching Issues
```
🔍 Parse result: {success: true, transactions: [X]}
💳 Loaded pending transactions: [X]
🎯 Generated matches: [X]
🎯 High confidence matches (≥50%): [X]
```

### Database Update Issues
```
💾 Starting database updates:
🔍 Processing match: confidence=[X]%, type=[type]
⏭️ Skipping (confidence < 50%)
✅ Successfully updated transaction [id]
🎯 Database update summary: [X] transactions updated
```

## Common Issues & Solutions

1. **No transactions parsed** → CSV format different than expected
2. **0 high confidence matches** → Amount/date mismatches between POS and CSV
3. **Database errors** → Settlement field constraints or data validation issues
4. **Payment method mismatch** → POS shows 'sumup' but CSV shows different provider

## Manual Override

If needed, you can manually approve low-confidence matches through the UI after import.