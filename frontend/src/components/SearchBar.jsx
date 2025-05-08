import React, { useState } from 'react';
import axios from 'axios';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/search?query=${encodeURIComponent(query)}`);
      onSearch(response.data);
    } catch (error) {
      console.error('Lỗi tìm kiếm:', error);
      onSearch([]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nhập từ khóa tìm kiếm..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tìm kiếm
        </button>
      </div>
    </div>
  );
};

export default SearchBar;