import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/autocomplete?q=${encodeURIComponent(query)}`);
        setSuggestions(res.data);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Autocomplete fetch error:", error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSearch = async (searchTerm) => {
    setQuery(searchTerm);
    setShowSuggestions(false);
    try {
      const response = await axios.get(`http://localhost:5000/api/search?query=${encodeURIComponent(searchTerm)}`);
      onSearch(response.data);
    } catch (error) {
      console.error('Lỗi tìm kiếm:', error);
      onSearch([]);
    }
  };

  return (
    <div className="relative max-w-xl mx-auto">
  <div className="flex items-center gap-2">
    <div className="relative flex-1">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => { if (suggestions.length) setShowSuggestions(true); }}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder="Nhập từ khóa tìm kiếm..."
        className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
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
    <button
      onClick={() => handleSearch(query)}
      className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-1"
    >
      <svg
        className="h-5 w-5"
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
      <span>Tìm kiếm</span>
    </button>
  </div>

  {showSuggestions && suggestions.length > 0 && (
    <ul className="absolute z-50 left-0 right-0 bg-white border border-gray-200 rounded-lg mt-2 max-h-60 overflow-y-auto shadow-xl">
      {suggestions.map((s, idx) => (
        <li
          key={idx}
          onMouseDown={(e) => { e.preventDefault(); handleSearch(s); }}
          className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-2"
        >
          <svg
            className="h-4 w-4 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
              clipRule="evenodd"
            />
          </svg>
          <span className="truncate">{s}</span>
        </li>
      ))}
    </ul>
  )}
</div>
  );
};

export default SearchBar;
