# Twitter Bot API Server

[Previous sections remain the same...]

### Media Support

Supported file types:

**Images:**
- JPEG/JPG (image/jpeg, image/jpg)
- PNG (image/png)
- GIF (image/gif)

**Videos:**
- MP4 (video/mp4)
- MOV (video/quicktime)

**Limitations:**
- Maximum file size: 20MB
- Maximum files per tweet: 4

### Testing with Postman

1. Create a new request in Postman
2. Set the method to POST
3. Enter the endpoint URL (e.g., `http://localhost:3000/api/twitter/tweet`)
4. In Body tab, select "form-data"
5. Add fields:
   - Key: `text` (Type: Text)
     Value: Your tweet text
   - Key: `media` (Type: File)
     Value: Select your image/video file(s)
   
**Note:** Make sure your files match the supported formats mentioned above.

### Common Errors

1. "Invalid file type"
   - Check if your file format is supported
   - Verify the file extension matches its actual type
   - Ensure the file's MIME type is correct

2. "File too large"
   - Files must be under 20MB

3. "Too many files"
   - Maximum 4 files per tweet allowed

[Rest of the README remains the same...]