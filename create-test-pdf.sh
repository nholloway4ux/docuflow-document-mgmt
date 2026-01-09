#!/bin/bash

# Create a larger test PDF file (>1KB)
cat > test-document.pdf << 'EOF'
%PDF-1.4
%âÉäÃÅ
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] 
   /Contents 4 0 R 
   /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>
endobj
4 0 obj
<< /Length 1500 >>
stream
BT
/F1 24 Tf
50 750 Td
(Test PDF Document) Tj
0 -40 Td
/F2 14 Tf
(Generated for Upload Testing) Tj
0 -30 Td
/F1 12 Tf
(This is a test document created to verify the PDF upload functionality.) Tj
0 -20 Td
(The document contains multiple lines of text to ensure it meets) Tj
0 -20 Td
(the minimum file size requirement of 1024 bytes.) Tj
0 -40 Td
/F2 14 Tf
(Document Details:) Tj
0 -25 Td
/F1 12 Tf
(- Created: January 2025) Tj
0 -20 Td
(- Purpose: Upload functionality testing) Tj
0 -20 Td
(- Author: PDF Embedder Test Suite) Tj
0 -20 Td
(- Version: 1.0.0) Tj
0 -40 Td
/F2 14 Tf
(Lorem Ipsum Content:) Tj
0 -25 Td
/F1 11 Tf
(Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod) Tj
0 -15 Td
(tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim) Tj
0 -15 Td
(veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea) Tj
0 -15 Td
(commodo consequat. Duis aute irure dolor in reprehenderit in voluptate) Tj
0 -15 Td
(velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat) Tj
0 -15 Td
(cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id) Tj
0 -15 Td
(est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem) Tj
0 -15 Td
(accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab) Tj
0 -15 Td
(illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
7 0 obj
<< /Type /Info
   /Title (Test PDF Document)
   /Author (PDF Embedder Test)
   /Subject (Upload Testing)
   /Keywords (test, pdf, upload, embedder)
   /Creator (Test Script)
   /Producer (PDF Embedder Test Suite)
   /CreationDate (D:20250108120000Z)
   /ModDate (D:20250108120000Z) >>
endobj
xref
0 8
0000000000 65535 f 
0000000015 00000 n 
0000000074 00000 n 
0000000131 00000 n 
0000000259 00000 n 
0000001809 00000 n 
0000001887 00000 n 
0000001969 00000 n 
trailer
<< /Size 8 /Root 1 0 R /Info 7 0 R >>
startxref
2245
%%EOF
EOF

echo "Created test-document.pdf"
ls -la test-document.pdf