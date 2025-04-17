import React, { useState } from 'react';
import axios from 'axios';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/search', {
        params: { query }
      });
      setResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Tìm kiếm tài liệu</h1>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Nhập từ khóa tìm kiếm"
        style={{ padding: '10px', width: '300px' }}
      />
      <button onClick={handleSearch} style={{ padding: '10px', marginLeft: '10px' }}>
        Tìm kiếm
      </button>
      <ul>
        {results.map((result) => (
          <li key={result.id} style={{ margin: '10px 0' }}>
            <h3>{result.title}</h3>
            <p>{result.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchPage;