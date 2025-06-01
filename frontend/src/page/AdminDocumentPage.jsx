import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';

const getFileName = (filePath) => {
  return filePath?.split(/[/\\]/).pop();
};

const AdminDocumentPage = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/admin/documents', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDocs(res.data);
      } catch (err) {
        console.error('Lỗi khi tải danh sách tài liệu:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const handleDelete = async (id) => {
  const confirm = window.confirm("Bạn có chắc chắn muốn xoá tài liệu này?");
  if (!confirm) return;

  try {
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:5000/api/document/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setDocs((prev) => prev.filter((doc) => doc._id !== id));
  } catch (error) {
    console.error("Lỗi xoá tài liệu:", error);
    alert("Không thể xoá tài liệu.");
  }
};

const handleSearch = async ({ query, field }) => {
  setSearching(true);
  setLoading(true);
  try {
    const res = await axios.get('http://localhost:5000/api/search', {
      params: {
        query,
        field,
        page: 1,
        size: 20
      }
    });
    setDocs(res.data.results || []);
  } catch (error) {
    console.error('Lỗi tìm kiếm:', error);
  } finally {
    setLoading(false);
    setSearching(false);
  }
};

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
        <SearchBar onSearch={handleSearch} />
        </div>

        <h1 className="text-2xl font-bold mb-4">Tài liệu đã đăng</h1>
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="grid gap-4">
            {docs.map((doc) => (
              <div key={doc._id} className="border p-4 rounded shadow">
                <h2 className="font-semibold text-lg">
                  {doc._source.title || 'Không có tiêu đề'}
                </h2>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {doc._source.content?.slice(0, 150)}...
                </p>
                <div className="mb-4">
                    <a
                href={`http://localhost:5000/documents/${getFileName(doc._source.file_path)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 mr-4 text-blue-600 hover:underline"
                >   
                Xem tài liệu
                </a>
              {
               <button
                onClick={() => navigate(`/result/${doc._id}`)}
                className="text-green-600 hover:underline"
                >
                Xem kết quả
                </button>
              }
                <button
                onClick={() => handleDelete(doc._id)}
                className="mt-2 text-red-600 hover:underline"
                >
                Xoá tài liệu
                </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminDocumentPage;
