const multer = require('multer');
const path = require('path');
const { execFile } = require('child_process');
const express = require('express');
const router = express.Router();
const pLimit = require('p-limit');
const limit = pLimit(3); // 👈 giới hạn 3 tiến trình Python đồng thời
// Cấu hình lưu file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../documents')), // Đảm bảo đường dẫn đúng
  filename: (req, file, cb) => cb(null, file.originalname)  // Lưu file với tên gốc
});
const upload = multer({ storage });

const execFilePromise = (filePath) =>
  new Promise((resolve, reject) => {
    execFile('python', ['C:/myProject/KLTN/backend/scripts/add_document_pdf.py', filePath], { shell: true }, (err, stdout, stderr) => {
      if (err) {
        console.error(`Error indexing PDF ${filePath}:`, err);
        return reject(err);
      }
      console.log(`Indexing output for ${filePath}:`, stdout);
      resolve(stdout);
    });
  });



// API upload nhiều file
const uploadDocument = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' }); 
  }

  try {
    const tasks = req.files.map(file => {
      const filePath = path.join(__dirname, 'documents', file.filename);
      return limit(() => execFilePromise(filePath)); // giới hạn thực thi
    });

    await Promise.all(tasks);

    res.json({ message: 'Thêm tài liệu thành công' });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi khi thêm tài liệu',
      error: error.message
    });
  }
};

// Đảm bảo multer nhận đúng key 'pdfs' để xử lý file
router.post('/upload', upload.array('pdfs', 10), uploadDocument); // Dùng 'pdfs' như key để upload file

module.exports = router;

