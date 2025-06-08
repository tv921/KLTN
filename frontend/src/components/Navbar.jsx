import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Trang Tìm Kiếm</Link>
        <div className="flex gap-4">
          {role === 'admin' && (
          <>
          <Link to="/upload" className="hover:text-blue-200">Thêm tài liệu</Link>
          <Link to="/admin/documents" className="hover:text-blue-200">Quản lý tài liệu</Link>
          <Link to="/admin/users" className="hover:text-blue-200">Quản lý tài khoản</Link>
          <Link to="/admin/search-history" className="hover:text-blue-200">Lịch sử tìm kiếm</Link>
          </>
          )}
          {token ? (
            <button onClick={handleLogout} className="hover:text-red-200">Đăng xuất</button>
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

