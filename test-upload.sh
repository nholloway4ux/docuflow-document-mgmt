#!/bin/bash

# Test PDF upload through the API

# Use the test-upload.pdf file
TEST_FILE="test-upload.pdf"

if [ ! -f "$TEST_FILE" ]; then
  echo "Error: $TEST_FILE not found!"
  exit 1
fi

echo "Using $TEST_FILE for upload test"

# Get file size
FILE_SIZE=$(stat -f%z "$TEST_FILE" 2>/dev/null || stat -c%s "$TEST_FILE" 2>/dev/null)
echo "File size: $FILE_SIZE bytes"

echo "Requesting upload token..."
# Step 1: Request upload URL (trying with mock user ID)
UPLOAD_TOKEN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/uploads/request-url \
  -H "Content-Type: application/json" \
  -d "{
    \"filename\": \"Biz_website_questions.pdf\",
    \"file_size\": $FILE_SIZE,
    \"file_type\": \"application/pdf\"
  }")

echo "Response: $UPLOAD_TOKEN_RESPONSE"

# Extract upload token using grep and sed
UPLOAD_TOKEN=$(echo "$UPLOAD_TOKEN_RESPONSE" | grep -o '"upload_token":"[^"]*' | sed 's/"upload_token":"//')

if [ -z "$UPLOAD_TOKEN" ]; then
  echo "Failed to get upload token. Response was:"
  echo "$UPLOAD_TOKEN_RESPONSE"
  exit 1
fi

echo "Got upload token: ${UPLOAD_TOKEN:0:30}..."

# Step 2: Upload the file
echo "Uploading file..."
UPLOAD_RESPONSE=$(curl -s -X POST http://localhost:3001/api/uploads/complete \
  -F "upload_token=$UPLOAD_TOKEN" \
  -F "file=@$TEST_FILE;type=application/pdf" \
  -F "title=Business Website Questions" \
  -F "description=Test PDF upload via API script" \
  -F "is_public=true")

echo "Upload response: $UPLOAD_RESPONSE"

# Check if upload was successful
if echo "$UPLOAD_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Upload successful!"
  
  # Extract PDF ID
  PDF_ID=$(echo "$UPLOAD_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')
  echo "PDF ID: $PDF_ID"
else
  echo "❌ Upload failed!"
  echo "$UPLOAD_RESPONSE"
  exit 1
fi

echo "Test completed successfully!"