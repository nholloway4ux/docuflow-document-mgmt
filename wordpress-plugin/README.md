# GPBC PDF Bulletin Display Plugin

A WordPress plugin that connects to your PDF Admin System to display church bulletins and PDFs on your WordPress website.

## 🚀 Quick Start

### Installation

1. **Download the Plugin**
   - Use `gpbc-pdf-bulletin-clean.php` for the clean version (recommended - newest)
   - Automatically displays the most recent PDF - no manual selection needed!

2. **Install in WordPress**
   - Go to WordPress Admin → Plugins → Add New → Upload Plugin
   - Select the PHP file and click "Install Now"
   - Activate the plugin

3. **Add to Your Page**
   - Edit any page or post
   - Add the shortcode: `[gpbc_bulletin]`
   - Publish or update the page

## 📝 Basic Usage

### Display the Most Recent PDF (Automatic)
```
[gpbc_bulletin]
```
This automatically displays the most recent PDF uploaded to your admin panel. No manual selection needed!

### Display a Specific PDF
```
[gpbc_bulletin id="cfcb617f-64bd-4b92-95c4-05576acb1db7"]
```
Replace the ID with your actual PDF ID from the admin panel.

## 🎉 New Feature: Automatic Most Recent PDF

**No more manual selection required!** The plugin now automatically fetches and displays the most recent PDF from your library. Just upload a new bulletin, and it automatically appears on your website.

### How It Works:
1. Upload a new PDF to the admin panel
2. The plugin automatically detects it as the most recent
3. Your website immediately shows the new PDF
4. No need to mark PDFs as "selected" anymore

### Benefits:
- ✅ **Zero maintenance** - Just upload and forget
- ✅ **Always current** - Newest PDF always shown
- ✅ **Override available** - Can still use specific IDs if needed
- ✅ **Time-saving** - No manual selection process

## 🎯 Recommended Shortcodes

### For Church Bulletin Page (Clean Display, 800px Width)
```
[gpbc_bulletin width="800px"]
```
Automatically shows the most recent PDF with clean display and full-width download button.

### For Full Width Display
```
[gpbc_bulletin width="100%"]
```

### Without Title
```
[gpbc_bulletin show_title="no"]
```

### Custom Button Text
```
[gpbc_bulletin button_text="Get This Week's Bulletin"]
```

## ⚙️ All Parameters

| Parameter | Description | Default | Example Values |
|-----------|-------------|---------|----------------|
| `id` | Specific PDF ID to display | (shows most recent PDF) | `"123"`, `"uuid-string"` |
| `show_title` | Show title above PDF | `"yes"` | `"yes"`, `"no"` |
| `title` | Custom title text | `"This Week's Sunday Bulletin"` | Any text |
| `button_text` | Download button text | `"Download Church Bulletin"` | Any text |
| `width` | Width of the PDF viewer | `"800px"` | `"800px"`, `"600px"`, `"100%"` |
| `render_as` | How to display PDF | `"image"` | `"image"`, `"embed"` |

## 📖 Complete Examples

### Standard Bulletin Display
```
[gpbc_bulletin width="800px" min_height="1500px" scrolling="yes" show_download="yes"]
```

### Embedded PDF Without Download Button
```
[gpbc_bulletin width="100%" show_download="no" scrolling="yes"]
```

### Specific PDF with Custom Title
```
[gpbc_bulletin id="123" title="December 2024 Bulletin" width="800px"]
```

### Compact View for Sidebar
```
[gpbc_bulletin width="350px" min_height="500px" show_download="no"]
```

## 🔄 How It Works

1. **Plugin connects to your PDF Admin System** at https://pdfadminwordpress.vercel.app
2. **Automatically fetches the most recent PDF** (no manual selection needed)
3. **Displays PDF directly** from Supabase storage
4. **Clean display** - No PDF viewer controls, just content and download button

## 🎨 Styling & Customization

### CSS Classes Available

- `.gpbc-pdf-container` - Main container wrapper
- `.gpbc-bulletin-container` - Main bulletin container
- `.gpbc-download-button` - Download button (full width)
- `.gpbc-pdf-content` - PDF content area
- `.gpbc-pdf-scroll-wrapper` - PDF viewer wrapper
- `.gpbc-pdf-error` - Error message container

### Custom CSS Example

Add to your theme's CSS file:

```css
/* Center the bulletin on the page */
.gpbc-pdf-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

/* Style the download button */
.gpbc-download-button {
    background: #a94c6a !important;
    font-size: 20px !important;
    padding: 20px 40px !important;
    width: 100% !important;
}

/* Add shadow to PDF viewer */
.gpbc-pdf-scroll-wrapper {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
    .gpbc-pdf-container {
        padding: 10px;
    }
    .gpbc-pdf-scroll-wrapper iframe {
        min-height: 600px !important;
    }
}
```

## 🛠️ Admin Features

### WordPress Admin Menu
- Go to **WordPress Admin → Church Bulletin**
- View all available PDFs with their IDs
- See which PDF is currently selected
- Copy shortcodes directly from the admin page
- Link to PDF Admin Panel for uploads

### API Endpoints Used
- `/api/pdfs` - List all PDFs (plugin uses this to get most recent)
- `/api/pdfs/{id}` - Get specific PDF (optional override)

## 📱 Mobile Responsiveness

The plugin automatically adjusts for mobile devices:
- Width changes to 100% on screens under 850px
- Height adjusts to fit mobile screens
- Download button remains accessible
- Scrolling is touch-friendly

## 🔍 Troubleshooting

### PDF Not Displaying

1. **Check if PDF is uploaded** in admin panel
2. **Verify PDF ID** is correct
3. **Check browser console** for errors
4. **Ensure PDF is selected** (if not using specific ID)

### Download Button Not Working

- Check if `show_download="yes"` is set
- Verify PDF URL is accessible
- Check browser popup blocker settings

### Height Issues

- Adjust `min_height` parameter
- Use `scrolling="yes"` for long PDFs
- Set specific height for consistency

### Width Problems

- Use percentage widths for responsive design
- Set max-width in custom CSS
- Test on different screen sizes

## 🔐 Security Features

- **Sanitized inputs** - All shortcode attributes are sanitized
- **Escaped output** - HTML output is properly escaped
- **API validation** - Responses are validated before display
- **WordPress nonces** - Admin actions are protected

## 📊 Performance

- **Caching** - API responses can be cached (optional)
- **Lazy loading** - PDFs load only when visible
- **Optimized requests** - Minimal API calls
- **CDN delivery** - PDFs served from Supabase CDN

## 🚦 Requirements

- WordPress 5.0 or higher
- PHP 7.2 or higher
- Active internet connection
- PDF Admin System access

## 📞 Support

### Getting Help
1. Check this documentation
2. View the admin panel instructions
3. Test with a simple shortcode first
4. Check browser developer console for errors

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "No bulletin available" | Upload a PDF in admin panel (automatically shows most recent) |
| "Server error 404" | Check PDF ID is correct |
| PDF too small | Increase `min_height` parameter |
| PDF too wide | Adjust `width` parameter |
| Can't see download button | Set `show_download="yes"` |

## 🎯 Use Cases

### Weekly Bulletin Page
```
[gpbc_bulletin width="800px" min_height="1500px" scrolling="yes" title="This Week's Bulletin"]
```

### Archive Page with Multiple Bulletins
```
<!-- December Bulletin -->
<h3>December 2024</h3>
[gpbc_bulletin id="dec-2024-id" width="800px" show_download="yes"]

<!-- November Bulletin -->
<h3>November 2024</h3>
[gpbc_bulletin id="nov-2024-id" width="800px" show_download="yes"]
```

### Homepage Widget
```
[gpbc_bulletin width="100%" min_height="600px" show_download="no"]
```

### Mobile App WebView
```
[gpbc_bulletin width="100%" scrolling="yes" show_download="yes"]
```

## 📝 Version History

- **v3.1.0** - Automatic most recent PDF display, full-width download button
- **v3.0.0** - Clean version with no PDF viewer controls
- **v2.0.0** - Added scrolling view, Google Docs viewer option
- **v1.0.1** - Added specific PDF ID support
- **v1.0.0** - Initial release

## 📄 License

This plugin is provided as-is for Greater Providence Baptist Church.

---

**Need to manage PDFs?** Visit the [PDF Admin Panel](https://pdfadminwordpress.vercel.app/admin)