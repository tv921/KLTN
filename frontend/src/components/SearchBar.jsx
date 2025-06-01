import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [field, setField] = useState('all'); // 'all', 'title', 'content'

  const handleSearch = () => {
    if (query.trim() !== '') {
      onSearch({ query, field }); // Truyền object lên cha
    }
  };

  return (
    <div className="relative max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nhập từ khóa tìm kiếm..."
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <select
          value={field}
          onChange={(e) => setField(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">Tất cả</option>
          <option value="title">Tên file</option>
          <option value="content">Nội dung</option>
        </select>

        <button
          onClick={handleSearch}
          className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Tìm kiếm
        </button>
      </div>
    </div>
  );
};

export default SearchBar;

