import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [field, setField] = useState('all');

  const handleSearch = () => {
    if (query.trim() !== '') {
      onSearch({ query, field });
    }
  };

  return (
    <div className="relative max-w-4xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nhập từ khóa tìm kiếm..."
            className="w-full p-4 pl-12 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaSearch className="absolute left-4 top-4 text-gray-400" />
        </div>

        <select
          value={field}
          onChange={(e) => setField(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tất cả</option>
          <option value="title">Tên file</option>
          <option value="content">Nội dung</option>
        </select>

        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow"
        >
          Tìm kiếm
        </button>
      </div>
    </div>
  );
};

export default SearchBar;

