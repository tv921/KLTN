import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import ResultList from '../components/ResultList';
import Navbar from '../components/Navbar';

const SearchPage = () => {
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [field, setField] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [loading, setLoading] = useState(false);
  const pageSize = 8;
  const [hasSearched, setHasSearched] = useState(false);


  // ✅ Gọi khi người dùng nhấn "Tìm kiếm"
const handleSearch = ({ query, field, fromDate, toDate, documentType }) => {
  setQuery(query);
  setField(field);
  setFromDate(fromDate);
  setToDate(toDate);
  setDocumentType(documentType);
  setPage(1);
  setHasSearched(true); // ✅ Đánh dấu là đã nhấn nút tìm kiếm
  fetchResults(query, 1, field, fromDate, toDate, documentType);
};


  // ✅ Hàm fetch dữ liệu từ backend
  const fetchResults = async (q, p, f = field, from = fromDate, to = toDate, docType = documentType) => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');

    const params = new URLSearchParams();
    params.append('query', q || '');
    params.append('page', p);
    params.append('size', pageSize);
    params.append('field', f || 'all');

    if (from) params.append('fromDate', from);
    if (to) params.append('toDate', to);
    if (docType) params.append('documentType', docType);

    const res = await fetch(`http://localhost:5000/api/search?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    const data = await res.json();
    setResults(data.results || data);
    setTotal(data.total || data.length || 0);
  } catch (error) {
    console.error('Lỗi khi tìm kiếm:', error);
    setResults([]);
  } finally {
    setLoading(false);
  }
};


  // ✅ Khi người dùng chuyển trang
 useEffect(() => {
  if (hasSearched) {
    fetchResults(query, page, field, fromDate, toDate, documentType);
  }
}, [page]);


  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-50">
      <Navbar />

      <main className="flex-grow container mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-700">Tìm kiếm tài liệu thông minh</h1>
        </div>

        <div className="mb-6">
          <SearchBar onSearch={handleSearch} />
        </div>

        {!loading && total > 0 && (
          <p className="text-center text-gray-500 mb-4">Tìm thấy {total} tài liệu</p>
        )}

        {loading ? (
          <div className="text-center text-gray-600 mt-10">Đang tìm kiếm...</div>
        ) : (
          <ResultList results={results} />
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-4 py-2 rounded ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-blue-600 text-white py-4">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row sm:justify-between items-center">
          <nav className="mb-4 sm:mb-0">
            <ul className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6">
              <li><a href="/site/about" className="text-white hover:text-gray-200">Về chúng tôi</a></li>
              <li><a href="/site/help" className="text-white hover:text-gray-200">Hỗ trợ</a></li>
              <li><a href="/site/contact" className="text-white hover:text-gray-200">Phản hồi</a></li>
              <li><a href="/site/terms" className="text-white hover:text-gray-200">Điều khoản sử dụng</a></li>
            </ul>
          </nav>
          <div className="text-sm">© 2025 Hệ thống tìm kiếm tài liệu</div>
        </div>
      </footer>
    </div>
  );
};

export default SearchPage;
