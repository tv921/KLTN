import { useState } from 'react';
import axios from 'axios';

function UploadFile() {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => setFiles(e.target.files); // Đảm bảo lấy được file

  const handleUpload = async () => {
    if (files.length === 0) {
      setMessage('Vui lòng chọn file');
      return;
    }

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('pdfs', file); // 'pdfs' là key bạn dùng trong backend
    });

    try {
      const res = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage(res.data.message); // Hiển thị thông báo
    } catch (err) {
      setMessage('Upload lỗi');
      console.error('Upload error:', err.response ? err.response.data : err.message);
    }
  };

  return (
    <div>
      <input type="file" accept=".pdf" multiple onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload PDF</button>
      <p>{message}</p>
    </div>
  );
}

export default UploadFile;


