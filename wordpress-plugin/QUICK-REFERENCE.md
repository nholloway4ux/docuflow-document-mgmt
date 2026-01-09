# Quick Reference Guide - GPBC PDF Plugin

## 🚀 Most Used Shortcodes

### Default Church Bulletin (What You'll Use Most)
```
[gpbc_bulletin width="800px" min_height="1500px" scrolling="yes"]
```

### Just Show Selected PDF (Simplest)
```
[gpbc_bulletin]
```

### Show Specific PDF
```
[gpbc_bulletin id="YOUR_PDF_ID_HERE"]
```

## 📋 Copy & Paste Templates

### For Main Bulletin Page
```html
<h2>This Week's Church Bulletin</h2>
[gpbc_bulletin width="800px" min_height="1500px" scrolling="yes"]
```

### For Sidebar
```html
<h3>Latest Bulletin</h3>
[gpbc_bulletin width="300px" min_height="400px" show_download="yes"]
<p><a href="/bulletins">View All Bulletins →</a></p>
```

### For Archive Page
```html
<h2>Church Bulletin Archive</h2>

<h3>December 2024</h3>
[gpbc_bulletin id="dec-2024-id" width="800px"]

<h3>November 2024</h3>
[gpbc_bulletin id="nov-2024-id" width="800px"]

<h3>October 2024</h3>
[gpbc_bulletin id="oct-2024-id" width="800px"]
```

## ⚙️ Parameter Cheat Sheet

```
[gpbc_bulletin 
    id="123"                  // Optional: Specific PDF ID
    width="800px"             // Width: 800px, 100%, 600px, etc.
    min_height="1500px"       // Height: 1200px, 1500px, 2000px
    scrolling="yes"           // Scrolling: yes or no
    show_download="yes"       // Download button: yes or no
    title="Custom Title"      // Optional: Custom download name
]
```

## 🎨 Common Combinations

| What You Want | Shortcode |
|--------------|-----------|
| **Standard bulletin, 800px wide** | `[gpbc_bulletin width="800px"]` |
| **Full width, no download** | `[gpbc_bulletin show_download="no"]` |
| **Specific PDF, scrolling** | `[gpbc_bulletin id="123" scrolling="yes"]` |
| **Mobile friendly** | `[gpbc_bulletin width="100%"]` |
| **Compact view** | `[gpbc_bulletin width="400px" min_height="600px"]` |

## 🔧 Admin Tasks

### Find Your PDF IDs
1. Go to WordPress Admin → Church Bulletin
2. Look at the table of PDFs
3. Copy the ID from the first column

### Change Selected PDF
1. Go to https://pdfadminwordpress.vercel.app/admin
2. Log in with your credentials
3. Click "Select" next to the PDF you want

### Upload New PDF
1. Go to https://pdfadminwordpress.vercel.app/admin
2. Click "Upload PDF"
3. Select your file
4. Click "Select" to make it active

## ❓ Quick Fixes

**PDF not showing?**
- Check if you uploaded a PDF first
- Make sure you selected it in admin panel
- Verify the ID if using specific PDF

**Too small/big?**
- Adjust `width` and `min_height` parameters
- Try `width="100%"` for responsive

**No download button?**
- Add `show_download="yes"` to shortcode

## 📱 Mobile Tips

- Use `width="100%"` for mobile pages
- Set `scrolling="yes"` for easier mobile reading
- Keep `min_height` under 1000px for mobile

## 🎯 Your Most Likely Setup

For your church bulletin page, just use:
```
[gpbc_bulletin width="800px" min_height="1500px" scrolling="yes"]
```

This gives you:
- ✅ 800px centered width
- ✅ Scrolling PDF (no pages)
- ✅ Download button
- ✅ Responsive on mobile
- ✅ Shows selected PDF from admin

---
**Admin Panel:** https://pdfadminwordpress.vercel.app/admin
**Need Help?** Check the full README.md for detailed documentation