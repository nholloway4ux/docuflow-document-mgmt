<?php
/**
 * Plugin Name: GPBC PDF Bulletin Display (Scrolling Version)
 * Description: Displays PDFs from the admin system as a single scrolling page
 * Version: 2.0.0
 * Author: Greater Providence Baptist Church
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Add shortcode for displaying the PDF
add_shortcode('gpbc_bulletin', 'gpbc_display_bulletin');

function gpbc_display_bulletin($atts) {
    // Shortcode attributes
    $atts = shortcode_atts([
        'id' => '', // Specific PDF ID
        'width' => '100%',
        'min_height' => '1200px',
        'show_download' => 'yes',
        'title' => 'Church Bulletin',
        'scrolling' => 'yes', // Enable scrolling view
        'zoom' => '100' // Zoom level percentage
    ], $atts);
    
    // Determine which API endpoint to use
    if (!empty($atts['id'])) {
        // Fetch specific PDF by ID
        $api_url = 'https://pdfadminwordpress.vercel.app/api/pdfs/' . sanitize_text_field($atts['id']);
    } else {
        // Fetch the selected PDF
        $api_url = 'https://pdfadminwordpress.vercel.app/api/pdfs/selected';
    }
    
    // Set up the request with proper headers
    $args = [
        'timeout' => 30,
        'headers' => [
            'Accept' => 'application/json',
        ]
    ];
    
    $response = wp_remote_get($api_url, $args);
    
    if (is_wp_error($response)) {
        return '<div class="gpbc-pdf-error"><p>Unable to load bulletin at this time. Error: ' . $response->get_error_message() . '</p></div>';
    }
    
    $response_code = wp_remote_retrieve_response_code($response);
    if ($response_code !== 200) {
        return '<div class="gpbc-pdf-error"><p>Unable to load bulletin. Server returned error code: ' . $response_code . '</p></div>';
    }
    
    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        return '<div class="gpbc-pdf-error"><p>Invalid response from server.</p></div>';
    }
    
    // Handle the response based on whether we're fetching a specific PDF or selected PDFs
    $pdf = null;
    
    if (!empty($atts['id'])) {
        // Single PDF response
        if (isset($data['data'])) {
            $pdf = $data['data'];
        }
    } else {
        // Selected PDFs response (array)
        if (isset($data['data']) && is_array($data['data']) && !empty($data['data'])) {
            $pdf = $data['data'][0]; // Get the first selected PDF
        }
    }
    
    if (!$pdf) {
        return '<div class="gpbc-pdf-error"><p>No bulletin is currently available.</p></div>';
    }
    
    // Get the PDF URL - check both possible field names
    $pdf_url = $pdf['storage_url'] ?? $pdf['file_path'] ?? '';
    $pdf_name = $pdf['file_name'] ?? $atts['title'];
    
    if (empty($pdf_url)) {
        return '<div class="gpbc-pdf-error"><p>Bulletin file not found.</p></div>';
    }
    
    // Ensure the URL is absolute
    if (!filter_var($pdf_url, FILTER_VALIDATE_URL)) {
        // If it's a relative path, prepend the Supabase URL
        if (strpos($pdf_url, '/') === 0) {
            $pdf_url = 'https://xxqwaklciqjarvatwfnv.supabase.co' . $pdf_url;
        }
    }
    
    // Generate unique ID for this instance
    $viewer_id = 'pdf-viewer-' . uniqid();
    
    // Build the HTML output with scrolling view
    $output = '<div class="gpbc-pdf-container" id="' . $viewer_id . '" style="width: ' . esc_attr($atts['width']) . '; margin: 20px auto;">';
    
    // Add download button if requested
    if ($atts['show_download'] === 'yes') {
        $output .= '<div class="gpbc-pdf-header" style="margin-bottom: 15px; text-align: center;">';
        $output .= '<a href="' . esc_url($pdf_url) . '" download="' . esc_attr($pdf_name) . '" ';
        $output .= 'class="gpbc-download-btn" ';
        $output .= 'style="background: #a94c6a; color: white; padding: 12px 24px; text-decoration: none; ';
        $output .= 'border-radius: 4px; display: inline-block; font-weight: bold; ';
        $output .= 'box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: background 0.3s;">';
        $output .= '📥 Download ' . esc_html($pdf_name);
        $output .= '</a>';
        $output .= '</div>';
    }
    
    // Use Google Docs Viewer for scrolling view
    $google_viewer_url = 'https://docs.google.com/viewer?url=' . urlencode($pdf_url) . '&embedded=true';
    
    // Add the PDF viewer with scrolling
    $output .= '<div class="gpbc-pdf-scroll-wrapper" style="position: relative; width: 100%; overflow: auto; background: #f0f0f0; border: 1px solid #ddd; border-radius: 4px;">';
    
    // Option 1: Use Google Docs Viewer (most reliable for scrolling)
    if ($atts['scrolling'] === 'yes') {
        $output .= '<iframe src="' . esc_url($google_viewer_url) . '" ';
        $output .= 'style="width: ' . esc_attr($atts['width']) . '; min-height: ' . esc_attr($atts['min_height']) . '; height: auto; border: none;" ';
        $output .= 'frameborder="0" scrolling="yes" allowfullscreen>';
        $output .= '</iframe>';
    } else {
        // Option 2: Direct PDF embed (fallback)
        $output .= '<iframe src="' . esc_url($pdf_url) . '#view=FitH&scrollbar=1&toolbar=0&navpanes=0" ';
        $output .= 'style="width: ' . esc_attr($atts['width']) . '; min-height: ' . esc_attr($atts['min_height']) . '; height: auto; border: none;" ';
        $output .= 'frameborder="0" scrolling="yes" allowfullscreen>';
        $output .= '</iframe>';
    }
    
    $output .= '</div>';
    
    // Alternative download link
    $output .= '<div style="text-align: center; margin-top: 15px; font-size: 14px; color: #666;">';
    $output .= 'Having trouble viewing? <a href="' . esc_url($pdf_url) . '" target="_blank" style="color: #a94c6a;">Open in new window</a>';
    $output .= '</div>';
    
    $output .= '</div>';
    
    // Add CSS for responsive and scrolling behavior
    $output .= '<style>
        .gpbc-pdf-container {
            max-width: ' . esc_attr($atts['width']) . ';
        }
        .gpbc-pdf-error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
        }
        .gpbc-download-btn:hover {
            background: #8a3c5a !important;
        }
        .gpbc-pdf-scroll-wrapper {
            -webkit-overflow-scrolling: touch;
            overflow-y: auto;
        }
        .gpbc-pdf-scroll-wrapper iframe {
            display: block;
            width: 100% !important;
            min-height: ' . esc_attr($atts['min_height']) . ';
        }
        /* For 800px width specific styling */
        .gpbc-pdf-container[style*="800px"] {
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
        }
        @media (max-width: 850px) {
            .gpbc-pdf-container[style*="800px"] {
                max-width: 100%;
                padding: 0 10px;
            }
            .gpbc-pdf-scroll-wrapper iframe {
                min-height: 600px !important;
            }
        }
        @media print {
            .gpbc-pdf-header {
                display: none;
            }
        }
    </style>';
    
    // Add JavaScript for dynamic height adjustment
    $output .= '<script>
        (function() {
            var container = document.getElementById("' . $viewer_id . '");
            if (container) {
                var iframe = container.querySelector("iframe");
                if (iframe) {
                    // Try to adjust height based on content
                    iframe.onload = function() {
                        try {
                            // This might not work due to cross-origin restrictions
                            var newHeight = iframe.contentWindow.document.body.scrollHeight;
                            if (newHeight > 0) {
                                iframe.style.height = newHeight + "px";
                            }
                        } catch(e) {
                            // If cross-origin, use a reasonable default
                            iframe.style.height = "1500px";
                        }
                    };
                }
            }
        })();
    </script>';
    
    return $output;
}

// Add admin menu for settings
add_action('admin_menu', 'gpbc_admin_menu');

function gpbc_admin_menu() {
    add_menu_page(
        'GPBC Bulletin Settings',
        'Church Bulletin',
        'manage_options',
        'gpbc-bulletin',
        'gpbc_admin_page',
        'dashicons-media-document',
        30
    );
}

function gpbc_admin_page() {
    // Fetch list of available PDFs
    $api_url = 'https://pdfadminwordpress.vercel.app/api/pdfs';
    $response = wp_remote_get($api_url);
    $pdfs = [];
    
    if (!is_wp_error($response)) {
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        if (isset($data['data'])) {
            $pdfs = $data['data'];
        }
    }
    ?>
    <div class="wrap">
        <h1>Church Bulletin Settings</h1>
        
        <div style="background: white; padding: 20px; margin-top: 20px; border-left: 4px solid #a94c6a;">
            <h2>📋 Recommended Shortcodes</h2>
            
            <h3 style="color: #a94c6a;">✨ For 800px Width with Scrolling (Your Request):</h3>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 4px; margin: 15px 0;">
                <code style="background: #333; color: #0f0; padding: 15px; display: block; font-size: 16px; border-radius: 4px;">
                    [gpbc_bulletin width="800px" min_height="1500px" scrolling="yes"]
                </code>
                <p style="margin-top: 10px; color: #666;">This creates a centered 800px wide PDF viewer with scrolling enabled.</p>
            </div>
            
            <h3>Other Common Configurations:</h3>
            
            <div style="background: #f0f0f0; padding: 15px; border-radius: 4px; margin: 15px 0;">
                <h4>Full Width Scrolling:</h4>
                <code style="background: white; padding: 10px; display: block; margin: 10px 0;">[gpbc_bulletin scrolling="yes"]</code>
                
                <h4>Specific PDF with 800px Width:</h4>
                <code style="background: white; padding: 10px; display: block; margin: 10px 0;">[gpbc_bulletin id="YOUR_PDF_ID" width="800px"]</code>
                
                <h4>No Download Button:</h4>
                <code style="background: white; padding: 10px; display: block; margin: 10px 0;">[gpbc_bulletin width="800px" show_download="no"]</code>
            </div>
            
            <h3>📊 All Parameters:</h3>
            <table class="widefat" style="margin: 20px 0;">
                <thead>
                    <tr>
                        <th>Parameter</th>
                        <th>Description</th>
                        <th>Default</th>
                        <th>Options</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>id</strong></td>
                        <td>Specific PDF ID</td>
                        <td>(shows selected)</td>
                        <td>Any PDF ID</td>
                    </tr>
                    <tr>
                        <td><strong>width</strong></td>
                        <td>Viewer width</td>
                        <td>100%</td>
                        <td>800px, 600px, 100%, etc.</td>
                    </tr>
                    <tr>
                        <td><strong>min_height</strong></td>
                        <td>Minimum height</td>
                        <td>1200px</td>
                        <td>1500px, 2000px, etc.</td>
                    </tr>
                    <tr>
                        <td><strong>scrolling</strong></td>
                        <td>Enable scroll view</td>
                        <td>yes</td>
                        <td>yes / no</td>
                    </tr>
                    <tr>
                        <td><strong>show_download</strong></td>
                        <td>Show download button</td>
                        <td>yes</td>
                        <td>yes / no</td>
                    </tr>
                </tbody>
            </table>
            
            <?php if (!empty($pdfs)): ?>
            <h3>📁 Your PDFs:</h3>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 4px; max-height: 300px; overflow-y: auto;">
                <table class="widefat">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>File Name</th>
                            <th>Selected</th>
                            <th>800px Shortcode</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($pdfs as $pdf): ?>
                        <tr>
                            <td><?php echo esc_html($pdf['id']); ?></td>
                            <td><?php echo esc_html($pdf['file_name']); ?></td>
                            <td><?php echo $pdf['is_selected'] ? '✓ Selected' : ''; ?></td>
                            <td><code style="font-size: 11px;">[gpbc_bulletin id="<?php echo esc_html($pdf['id']); ?>" width="800px"]</code></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
            <?php endif; ?>
            
            <h3>🔧 Admin Panel</h3>
            <p>To upload new PDFs or change the selected bulletin:</p>
            <a href="https://pdfadminwordpress.vercel.app/admin" target="_blank" class="button button-primary" style="font-size: 16px; padding: 8px 16px;">
                Open PDF Admin Panel →
            </a>
        </div>
    </div>
    <?php
}