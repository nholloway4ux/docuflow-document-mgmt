<?php
/**
 * Plugin Name: GPBC PDF Bulletin Display (Clean Version)
 * Description: Displays PDF content as clean HTML with download button - automatically shows most recent PDF
 * Version: 3.1.0
 * Author: Greater Providence Baptist Church
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Add shortcode for displaying the PDF
add_shortcode('gpbc_bulletin', 'gpbc_display_bulletin_clean');

function gpbc_display_bulletin_clean($atts) {
    // Shortcode attributes
    $atts = shortcode_atts([
        'id' => '', // Specific PDF ID
        'show_title' => 'yes',
        'title' => 'This Week\'s Sunday Bulletin',
        'button_text' => 'Download Church Bulletin',
        'button_style' => 'default',
        'width' => '800px',
        'render_as' => 'image' // 'image' or 'embed'
    ], $atts);
    
    // Determine which API endpoint to use
    if (!empty($atts['id'])) {
        // Fetch specific PDF by ID
        $api_url = 'https://pdfadminwordpress.vercel.app/api/pdfs/' . sanitize_text_field($atts['id']);
    } else {
        // Fetch all PDFs to get the most recent one
        $api_url = 'https://pdfadminwordpress.vercel.app/api/pdfs';
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
        return '<div class="gpbc-pdf-error"><p>Unable to load bulletin at this time.</p></div>';
    }
    
    $response_code = wp_remote_retrieve_response_code($response);
    if ($response_code !== 200) {
        return '<div class="gpbc-pdf-error"><p>Unable to load bulletin.</p></div>';
    }
    
    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        return '<div class="gpbc-pdf-error"><p>Invalid response from server.</p></div>';
    }
    
    // Handle the response based on whether we're fetching a specific PDF or all PDFs
    $pdf = null;
    
    if (!empty($atts['id'])) {
        // Single PDF response
        if (isset($data['data'])) {
            $pdf = $data['data'];
        }
    } else {
        // All PDFs response - get the most recent one
        if (isset($data['data']) && is_array($data['data']) && !empty($data['data'])) {
            // The API returns PDFs sorted by created_at DESC (newest first)
            $pdf = $data['data'][0]; // Get the most recent PDF
        }
    }
    
    if (!$pdf) {
        return '<div class="gpbc-pdf-error"><p>No bulletin is currently available.</p></div>';
    }
    
    // Get the PDF details
    $pdf_id = $pdf['id'] ?? '';
    $pdf_url = $pdf['storage_url'] ?? $pdf['file_path'] ?? '';
    $pdf_name = $pdf['file_name'] ?? $pdf['filename'] ?? $pdf['original_name'] ?? 'Church Bulletin';
    
    if (empty($pdf_id)) {
        return '<div class="gpbc-pdf-error"><p>Bulletin ID not found.</p></div>';
    }
    
    // Use the Next.js embed page for display
    $embed_url = 'https://pdfadminwordpress.vercel.app/embed/' . $pdf_id;
    
    // Keep the storage URL for download
    if (empty($pdf_url)) {
        $pdf_url = $pdf['storage_url'] ?? $pdf['file_path'] ?? '';
    }
    // Ensure download URL is absolute
    if (!filter_var($pdf_url, FILTER_VALIDATE_URL)) {
        if (strpos($pdf_url, '/') === 0) {
            $pdf_url = 'https://sirvbbqnufgpklyodmqq.supabase.co' . $pdf_url;
        }
    }
    
    // Generate unique ID for this instance
    $viewer_id = 'pdf-viewer-' . uniqid();
    
    // Build the HTML output
    $output = '<div class="gpbc-bulletin-container" id="' . $viewer_id . '" style="max-width: ' . esc_attr($atts['width']) . '; margin: 0 auto; font-family: Georgia, serif;">';
    
    // Add title if requested
    if ($atts['show_title'] === 'yes') {
        $output .= '<h2 style="text-align: center; font-size: 36px; font-weight: normal; margin: 30px 0; font-family: Georgia, serif;">' . esc_html($atts['title']) . '</h2>';
    }
    
    // Add the PDF content display
    if ($atts['render_as'] === 'image') {
        // Option 1: Display as images (requires PDF.js or similar on server)
        // For now, we'll use an embed approach but styled cleanly
        $output .= '<div class="gpbc-pdf-content" style="background: white; padding: 20px; margin: 20px 0; min-height: 1000px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">';
        
        // Use Next.js embed page for better control over display
        $output .= '<iframe src="' . esc_url($embed_url) . '" ';
        $output .= 'style="width: 100%; height: 1500px; border: none; background: white;" ';
        $output .= 'frameborder="0" scrolling="auto">';
        $output .= '</iframe>';
        
        $output .= '</div>';
    } else {
        // Option 2: Clean embedded view
        $output .= '<div class="gpbc-pdf-content" style="background: white; margin: 20px 0;">';
        
        // Use Next.js embed page
        $output .= '<iframe src="' . esc_url($embed_url) . '" ';
        $output .= 'style="width: 100%; height: 1500px; border: none;" frameborder="0" scrolling="auto">';
        $output .= '</iframe>';
        $output .= '</div>';
    }
    
    // Add the download button - full width like in the screenshot
    $output .= '<div style="margin: 40px 0;">';
    $output .= '<a href="' . esc_url($pdf_url) . '" download="' . esc_attr($pdf_name) . '" ';
    $output .= 'class="gpbc-download-button" ';
    $output .= 'style="display: block; background: #a94c6a; color: white; padding: 20px 40px; ';
    $output .= 'text-decoration: none; font-size: 20px; font-family: Arial, sans-serif; text-align: center; ';
    $output .= 'border-radius: 4px; font-weight: normal; transition: background 0.3s; width: 100%; box-sizing: border-box;">';
    $output .= esc_html($atts['button_text']);
    $output .= '</a>';
    $output .= '</div>';
    
    $output .= '</div>';
    
    // Add CSS for clean display
    $output .= '<style>
        .gpbc-bulletin-container {
            background: #f9f9f9;
            padding: 20px;
        }
        .gpbc-pdf-error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            padding: 15px;
            border-radius: 4px;
            text-align: center;
            margin: 20px auto;
            max-width: 600px;
        }
        .gpbc-download-button:hover {
            background: #8a3c5a !important;
        }
        .gpbc-pdf-content iframe,
        .gpbc-pdf-content object {
            display: block;
            margin: 0 auto;
        }
        @media (max-width: 850px) {
            .gpbc-bulletin-container {
                padding: 10px;
            }
            .gpbc-pdf-content iframe,
            .gpbc-pdf-content object {
                height: 800px !important;
            }
            .gpbc-download-button {
                font-size: 18px !important;
                padding: 16px 30px !important;
                width: 100% !important;
            }
        }
        @media print {
            .gpbc-download-button {
                display: none !important;
            }
        }
    </style>';
    
    // Add JavaScript to hide PDF toolbar
    $output .= '<script>
        document.addEventListener("DOMContentLoaded", function() {
            var container = document.getElementById("' . $viewer_id . '");
            if (container) {
                var iframe = container.querySelector("iframe");
                if (iframe) {
                    // Try to hide toolbar after load
                    iframe.onload = function() {
                        try {
                            // Add parameters to hide toolbar
                            if (iframe.src.indexOf("#") === -1) {
                                iframe.src = iframe.src + "#toolbar=0&navpanes=0&scrollbar=0&view=FitH";
                            }
                        } catch(e) {
                            // Cross-origin, can\'t modify
                        }
                    };
                }
            }
        });
    </script>';
    
    return $output;
}

// Alternative shortcode for simple image display (if PDF is converted to images)
add_shortcode('gpbc_bulletin_simple', 'gpbc_display_bulletin_simple');

function gpbc_display_bulletin_simple($atts) {
    // Shortcode attributes  
    $atts = shortcode_atts([
        'id' => '',
        'title' => 'This Week\'s Sunday Bulletin',
        'button_text' => 'Download Church Bulletin',
        'width' => '800px'
    ], $atts);
    
    // Fetch PDF info (same as above)
    if (!empty($atts['id'])) {
        $api_url = 'https://pdfadminwordpress.vercel.app/api/pdfs/' . sanitize_text_field($atts['id']);
    } else {
        // Fetch all PDFs to get the most recent one
        $api_url = 'https://pdfadminwordpress.vercel.app/api/pdfs';
    }
    
    $args = [
        'timeout' => 30,
        'headers' => ['Accept' => 'application/json']
    ];
    
    $response = wp_remote_get($api_url, $args);
    
    if (is_wp_error($response)) {
        return '<p style="text-align: center; color: #999;">Bulletin temporarily unavailable.</p>';
    }
    
    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);
    
    // Get PDF data
    $pdf = null;
    if (!empty($atts['id'])) {
        $pdf = $data['data'] ?? null;
    } else {
        // Get the most recent PDF from the list
        $pdf = (isset($data['data']) && is_array($data['data']) && !empty($data['data'])) ? $data['data'][0] : null;
    }
    
    if (!$pdf) {
        return '<p style="text-align: center; color: #999;">No bulletin available.</p>';
    }
    
    $pdf_url = $pdf['storage_url'] ?? $pdf['file_path'] ?? '';
    $pdf_name = $pdf['file_name'] ?? 'Church Bulletin';
    
    // Super clean output - just title, space for content, and button
    $output = '<div style="max-width: ' . esc_attr($atts['width']) . '; margin: 0 auto; font-family: Georgia, serif; padding: 20px;">';
    
    // Title
    $output .= '<h2 style="text-align: center; font-size: 36px; font-weight: normal; margin: 30px 0;">' . esc_html($atts['title']) . '</h2>';
    
    // Placeholder for PDF content (you could add actual content here if you parse the PDF)
    $output .= '<div style="background: white; min-height: 200px; margin: 30px 0; padding: 40px; text-align: center; color: #666;">';
    $output .= '<p style="font-size: 18px;">📄 PDF Content Display</p>';
    $output .= '<p>For full bulletin view, please download below.</p>';
    $output .= '</div>';
    
    // Download button - full width
    $output .= '<div style="margin: 40px 0;">';
    $output .= '<a href="' . esc_url($pdf_url) . '" ';
    $output .= 'style="display: block; background: #a94c6a; color: white; ';
    $output .= 'padding: 20px 40px; text-decoration: none; font-size: 20px; text-align: center; ';
    $output .= 'border-radius: 4px; width: 100%; box-sizing: border-box;" ';
    $output .= 'onmouseover="this.style.background=\'#8a3c5a\'" ';
    $output .= 'onmouseout="this.style.background=\'#a94c6a\'">';
    $output .= esc_html($atts['button_text']);
    $output .= '</a>';
    $output .= '</div>';
    
    $output .= '</div>';
    
    return $output;
}