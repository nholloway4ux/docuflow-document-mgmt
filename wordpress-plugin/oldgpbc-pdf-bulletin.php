<?php
/**
 * Plugin Name: GPBC PDF Bulletin Display
 * Description: Displays PDFs from the admin system
 * Version: 1.0.1
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
        'height' => '800px',
        'width' => '100%',
        'show_download' => 'yes',
        'title' => 'Church Bulletin'
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
    
    // Build the HTML output with better styling
    $output = '<div class="gpbc-pdf-container" style="width: ' . esc_attr($atts['width']) . '; margin: 20px 0;">';
    
    // Add download button if requested
    if ($atts['show_download'] === 'yes') {
        $output .= '<div class="gpbc-pdf-header" style="margin-bottom: 15px; text-align: center;">';
        $output .= '<a href="' . esc_url($pdf_url) . '" download="' . esc_attr($pdf_name) . '" ';
        $output .= 'style="background: #a94c6a; color: white; padding: 12px 24px; text-decoration: none; ';
        $output .= 'border-radius: 4px; display: inline-block; font-weight: bold; ';
        $output .= 'box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: background 0.3s;"';
        $output .= 'onmouseover="this.style.background=\'#8a3c5a\'" ';
        $output .= 'onmouseout="this.style.background=\'#a94c6a\'">';
        $output .= '📥 Download ' . esc_html($pdf_name);
        $output .= '</a>';
        $output .= '</div>';
    }
    
    // Add the PDF viewer using iframe (better compatibility)
    $output .= '<div style="position: relative; width: 100%; background: #f0f0f0; border: 1px solid #ddd; border-radius: 4px; overflow: hidden;">';
    $output .= '<iframe src="' . esc_url($pdf_url) . '" ';
    $output .= 'style="width: ' . esc_attr($atts['width']) . '; height: ' . esc_attr($atts['height']) . '; border: none;" ';
    $output .= 'frameborder="0" allowfullscreen>';
    $output .= '</iframe>';
    $output .= '</div>';
    
    // Alternative: Use Google Docs viewer as fallback
    $output .= '<noscript>';
    $output .= '<div style="text-align: center; padding: 20px; background: #fff3cd; border: 1px solid #ffc107; margin-top: 10px;">';
    $output .= '<p>JavaScript is required to view the PDF. ';
    $output .= '<a href="' . esc_url($pdf_url) . '">Click here to download the bulletin instead.</a></p>';
    $output .= '</div>';
    $output .= '</noscript>';
    
    $output .= '</div>';
    
    // Add some CSS
    $output .= '<style>
        .gpbc-pdf-error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
        }
        @media (max-width: 768px) {
            .gpbc-pdf-container iframe {
                height: 500px !important;
            }
        }
    </style>';
    
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
            <h2>📋 How to Use This Plugin</h2>
            
            <h3>Method 1: Display the Selected PDF</h3>
            <p>This will show whichever PDF is currently selected in your admin panel:</p>
            <code style="background: #f0f0f0; padding: 10px; display: block; margin: 10px 0; font-size: 14px;">[gpbc_bulletin]</code>
            
            <h3>Method 2: Display a Specific PDF</h3>
            <p>Use the ID to display a specific PDF:</p>
            <code style="background: #f0f0f0; padding: 10px; display: block; margin: 10px 0; font-size: 14px;">[gpbc_bulletin id="YOUR_PDF_ID"]</code>
            
            <h3>Optional Parameters:</h3>
            <table class="widefat" style="margin: 20px 0;">
                <thead>
                    <tr>
                        <th>Parameter</th>
                        <th>Description</th>
                        <th>Default</th>
                        <th>Example</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>id</strong></td>
                        <td>Specific PDF ID to display</td>
                        <td>(none - shows selected)</td>
                        <td>[gpbc_bulletin id="123"]</td>
                    </tr>
                    <tr>
                        <td><strong>height</strong></td>
                        <td>Height of the viewer</td>
                        <td>800px</td>
                        <td>[gpbc_bulletin height="600px"]</td>
                    </tr>
                    <tr>
                        <td><strong>width</strong></td>
                        <td>Width of the viewer</td>
                        <td>100%</td>
                        <td>[gpbc_bulletin width="80%"]</td>
                    </tr>
                    <tr>
                        <td><strong>show_download</strong></td>
                        <td>Show download button</td>
                        <td>yes</td>
                        <td>[gpbc_bulletin show_download="no"]</td>
                    </tr>
                    <tr>
                        <td><strong>title</strong></td>
                        <td>Custom title for download</td>
                        <td>Church Bulletin</td>
                        <td>[gpbc_bulletin title="Weekly Bulletin"]</td>
                    </tr>
                </tbody>
            </table>
            
            <?php if (!empty($pdfs)): ?>
            <h3>📁 Available PDFs:</h3>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 4px; max-height: 300px; overflow-y: auto;">
                <table class="widefat">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>File Name</th>
                            <th>Selected</th>
                            <th>Shortcode</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($pdfs as $pdf): ?>
                        <tr>
                            <td><?php echo esc_html($pdf['id']); ?></td>
                            <td><?php echo esc_html($pdf['file_name']); ?></td>
                            <td><?php echo $pdf['is_selected'] ? '✓' : ''; ?></td>
                            <td><code>[gpbc_bulletin id="<?php echo esc_html($pdf['id']); ?>"]</code></td>
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