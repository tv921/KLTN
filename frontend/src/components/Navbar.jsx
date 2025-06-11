import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBookOpen, FaUser, FaUpload, FaSignOutAlt, FaHistory } from 'react-icons/fa';

const Navbar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-700 text-white py-4 shadow-md">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
          <FaBookOpen className="text-white" />
          <span>Tra cứu tài liệu</span>
        </Link>

        <div className="flex items-center gap-5 text-sm">
          {role === 'admin' && (
            <>
              <Link to="/upload" className="hover:text-blue-200 flex items-center gap-1">
                <FaUpload /> Thêm tài liệu
              </Link>
              <Link to="/admin/documents" className="hover:text-blue-200 flex items-center gap-1">
                <FaBookOpen /> Quản lý tài liệu
              </Link>
              <Link to="/admin/users" className="hover:text-blue-200 flex items-center gap-1">
                <FaUser /> Tài khoản
              </Link>
              <Link to="/admin/search-history" className="hover:text-blue-200 flex items-center gap-1">
                <FaHistory /> Lịch sử tìm kiếm
              </Link>
            </>
          )}
          {token ? (
            <button onClick={handleLogout} className="hover:text-red-200 flex items-center gap-1">
              <FaSignOutAlt /> Đăng xuất
            </button>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-200">Đăng nhập</Link>
              <Link to="/register" className="hover:text-blue-200">Đăng ký</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
