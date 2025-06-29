import React, { useState } from 'react';
import { FaSearch, FaAngleDown } from 'react-icons/fa';

const SearchBar = ({ onSearch }) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [query, setQuery] = useState('');
  const [field, setField] = useState('all');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [documentType, setDocumentType] = useState('');

const handleSearch = () => {
  // Nếu tất cả các trường đều trống thì không làm gì cả (tránh gửi truy vấn vô nghĩa)
  if (!query && !fromDate && !toDate && !documentType && field === 'all') {
    alert('Vui lòng nhập từ khóa hoặc chọn bộ lọc để tìm kiếm.');
    return;
  }

  onSearch({ query, field, fromDate, toDate, documentType });
};


console.log('Gửi truy vấn:', { query, field, fromDate, toDate, documentType });


  const toggleAdvancedOptions = () => {
    setIsAdvancedOpen(!isAdvancedOpen);
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

        <button
          onClick={toggleAdvancedOptions}
          className="flex items-center px-4 py-3 rounded-xl shadow-sm text-sm hover:bg-gray-100 transition"
        >
          Lọc
          <FaAngleDown className={`ml-2 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
        </button>

        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow"
        >
          Tìm kiếm
        </button>
      </div>

      {isAdvancedOpen && (
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <select
            value={field}
            onChange={(e) => setField(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="title">Tên file</option>
            <option value="content">Nội dung</option>
          </select>
          <div className="flex gap-2 flex-wrap items-center">
            <p>Ngày ban hành:</p>
            
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-xl text-sm"
              placeholder="Từ ngày"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-xl text-sm"
              placeholder="Đến ngày"
            />
          </div>

          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả loại văn bản</option>
            <option value="Công văn">Công văn</option>
            <option value="Thông tư">Thông tư</option>
            <option value="Quyết định">Quyết định</option>
            <option value="Nghị định">Nghị định</option>
            <option value="Chỉ thị">Chỉ thị</option>
            <option value="Tờ trình">Tờ trình</option>
            <option value="Báo cáo">Báo cáo</option>
            <option value="Giấy mời">Giấy mời</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default SearchBar;