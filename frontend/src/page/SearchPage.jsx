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
  const pageSize = 8;

 const handleSearch = ({ query, field }) => {
  setQuery(query);
  setField(field);
  setPage(1);
  fetchResults(query, 1, field);
};

  const fetchResults = async (q, p, f = field) => {
  try {
    const res = await fetch(
      `http://localhost:5000/api/search?query=${encodeURIComponent(q)}&page=${p}&size=${pageSize}&field=${f}`
    );

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
  }
};

useEffect(() => {
  if (query) {
    fetchResults(query, page, field);
  }
}, [page]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mt-8">
          <SearchBar onSearch={handleSearch} />
        </div>
        <ResultList results={results} />
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-4 py-2 rounded ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
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
