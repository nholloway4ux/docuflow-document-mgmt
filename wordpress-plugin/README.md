# GPBC PDF Bulletin Display Plugin

A WordPress plugin that connects to your PDF Admin System to display church bulletins and PDFs on your WordPress website.

## 🚀 Quick Start

### Installation

1. **Download the Plugin**
   - Use `gpbc-pdf-bulletin-scrolling.php` for the scrolling version (recommended)
   - Or use `gpbc-pdf-bulletin.php` for the standard version

2. **Install in WordPress**
   - Go to WordPress Admin → Plugins → Add New → Upload Plugin
   - Select the PHP file and click "Install Now"
   - Activate the plugin

3. **Add to Your Page**
   - Edit any page or post
   - Add the shortcode: `[gpbc_bulletin]`
   - Publish or update the page

## 📝 Basic Usage

### Display the Selected PDF
```
[gpbc_bulletin]
```
This displays whichever PDF is currently marked as "selected" in your admin panel.

### Display a Specific PDF
```
[gpbc_bulletin id="cfcb617f-64bd-4b92-95c4-05576acb1db7"]
```
Replace the ID with your actual PDF ID from the admin panel.

## 🎯 Recommended Shortcodes

### For Church Bulletin Page (800px Width, Scrolling)
```
[gpbc_bulletin width="800px" min_height="1500px" scrolling="yes"]
```

### For Full Width Display
```
[gpbc_bulletin scrolling="yes"]
```

### For Sidebar Widget
```
[gpbc_bulletin width="300px" min_height="400px" show_download="yes"]
```

### For Mobile-Optimized View
```
[gpbc_bulletin width="100%" min_height="800px" scrolling="yes"]
```

## ⚙️ All Parameters

| Parameter | Description | Default | Example Values |
|-----------|-------------|---------|----------------|
| `id` | Specific PDF ID to display | (shows selected PDF) | `"123"`, `"uuid-string"` |
| `width` | Width of the PDF viewer | `"100%"` | `"800px"`, `"600px"`, `"50%"` |
| `min_height` | Minimum height of viewer | `"1200px"` | `"800px"`, `"1500px"`, `"2000px"` |
| `scrolling` | Enable continuous scroll view | `"yes"` | `"yes"`, `"no"` |
| `show_download` | Display download button | `"yes"` | `"yes"`, `"no"` |
| `title` | Custom title for download | `"Church Bulletin"` | Any text |

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
2. **Fetches PDF information** via API
3. **Displays PDF directly** from Supabase storage
4. **No iframe from your app** - displays PDF directly for better compatibility

## 🎨 Styling & Customization

### CSS Classes Available

- `.gpbc-pdf-container` - Main container wrapper
- `.gpbc-pdf-header` - Download button area
- `.gpbc-download-btn` - Download button
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
.gpbc-download-btn {
    background: #a94c6a !important;
    font-size: 18px !important;
    padding: 15px 30px !important;
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
- `/api/pdfs` - List all PDFs
- `/api/pdfs/selected` - Get selected PDF
- `/api/pdfs/{id}` - Get specific PDF

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
| "No bulletin available" | Upload and select a PDF in admin panel |
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

- **v2.0.0** - Added scrolling view, Google Docs viewer option
- **v1.0.1** - Added specific PDF ID support
- **v1.0.0** - Initial release

## 📄 License

This plugin is provided as-is for Greater Providence Baptist Church.

---

**Need to manage PDFs?** Visit the [PDF Admin Panel](https://pdfadminwordpress.vercel.app/admin)