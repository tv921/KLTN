import { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

function UploadFile() {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => setFiles(e.target.files);

  const handleUpload = async () => {
    if (files.length === 0) {
      setMessage('Vui lòng chọn file');
      return;
    }

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('pdfs', file);
    });

    try {
      const res = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage(res.data.message);
    } catch (err) {
      setMessage('Upload lỗi');
      console.error('Upload error:', err.response ? err.response.data : err.message);
    }
  };

  return (
    <>
    <Navbar></Navbar>
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md">

        <input
          type="file"
          accept=".pdf"
          multiple
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-md file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100 mb-4"
        />

        <button
          onClick={handleUpload}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
        >
          Upload PDF
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-700 bg-gray-100 p-2 rounded">{message}</p>
        )}
      </div>
    </div>
  </>
  );
}

export default UploadFile;


