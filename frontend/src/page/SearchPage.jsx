import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import ResultList from '../components/ResultList';

const SearchPage = () => {
  const [results, setResults] = useState([]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-xl font-bold">Trang Tìm Kiếm</div>
          <div>
            <a href="/upload" className="hover:text-blue-200">Upload Tài Liệu</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mt-8">
          <SearchBar onSearch={setResults} />
        </div>
        <ResultList results={results} />
      </main>

      {/* Footer */}
      <footer className="bg-blue-600 text-white py-4">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row sm:justify-between items-center">
          <nav className="mb-4 sm:mb-0">
            <ul className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6">
              <li><a href="/site/about" className="text-white hover:text-gray-200 transition-colors duration-300">Về chúng tôi</a></li>
              <li><a href="/site/help" className="text-white hover:text-gray-200 transition-colors duration-300">Hỗ trợ</a></li>
              <li><a href="/site/contact" className="text-white hover:text-gray-200 transition-colors duration-300">Phản hồi</a></li>
              <li><a href="/site/terms" className="text-white hover:text-gray-200 transition-colors duration-300">Điều khoản sử dụng</a></li>
            </ul>
          </nav>
          <div className="text-white text-sm">© 2025 Hệ thống tìm kiếm tài liệu</div>
        </div>
      </footer>
    </div>
  );
};

export default SearchPage;
