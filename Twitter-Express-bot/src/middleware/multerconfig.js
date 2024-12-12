const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, Date.now() + ext);
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    console.log('Uploaded file details:');
    console.log('Original name:', file.originalname);
    console.log('Mime type:', file.mimetype);
    
    const ext = path.extname(file.originalname).toLowerCase();
    console.log('Extension:', ext);

    // Define allowed extensions
    const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov']);

    if (allowedExtensions.has(ext)) {
        console.log('File extension is allowed, accepting file...');
        cb(null, true);
    } else {
        console.log('File extension not allowed');
        cb(new Error(`Invalid file type. Allowed extensions are: .jpg, .jpeg, .png, .gif, .mp4, .mov`), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB limit
        files: 4 // Maximum 4 files
    }
});

module.exports = upload;
