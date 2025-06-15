import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import UserEditModal from '../components/UserEditModal';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const AdminUserPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchRole, setSearchRole] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchUsers = async () => {
  const token = localStorage.getItem('token');
  try {
    const params = new URLSearchParams();
    if (searchEmail) params.append('email', searchEmail);
    if (searchRole) params.append('role', searchRole);

    const res = await axios.get(`http://localhost:5000/api/admin/users?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setUsers(res.data);
  } catch (err) {
    console.error('Lỗi khi tải danh sách người dùng:', err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchUsers();
  }, []);

 const handleDelete = async (id) => {
  if (!window.confirm('Bạn có chắc chắn muốn xoá người dùng này?')) return;
  const token = localStorage.getItem('token');

  try {
    await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setUsers(users.filter(user => user._id !== id));
    toast.success('✅ Xoá người dùng thành công');
  } catch (err) {
    toast.error('❌ Không thể xoá người dùng');
  }
};



  const handleUpdate = async (updatedData) => {
  const token = localStorage.getItem('token');
  try {
    const res = await axios.put(`http://localhost:5000/api/admin/users/${updatedData._id}`, updatedData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Cập nhật danh sách
    setUsers(users.map(u => u._id === updatedData._id ? res.data.user : u));
    setEditingUser(null);
  } catch (err) {
    alert('Cập nhật thất bại');
  }
};

  const handleReset = () => {
  setSearchEmail('');
  setSearchRole('');
  fetchUsers();
};

  return (
   <>
  <Navbar />
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-6 text-gray-800">👥 Quản lý tài khoản người dùng</h1>

    {/* Thông báo */}
    {successMessage && <p className="text-green-600 mb-2">{successMessage}</p>}
    {errorMessage && <p className="text-red-600 mb-2">{errorMessage}</p>}

    {/* Bộ lọc */}
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="🔍 Tìm theo email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={searchRole}
          onChange={(e) => setSearchRole(e.target.value)}
          className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả vai trò</option>
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
        <button
          onClick={fetchUsers}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          Lọc
        </button>
        <button
          onClick={handleReset}
          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition"
        >
          🔄 Đặt lại
        </button>
      </div>
    </div>

    {/* Danh sách người dùng */}
    {loading ? (
      <p className="text-center text-gray-500 italic">⏳ Đang tải danh sách người dùng...</p>
    ) : users.length === 0 ? (
      <p className="text-center text-red-500 font-semibold">⚠️ Không tìm thấy người dùng nào.</p>
    ) : (
      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user._id}
            className="bg-white border border-gray-200 p-6 rounded-lg shadow hover:shadow-md transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Vai trò:</strong> {user.role}</p>
                <p><strong>Đã xác minh:</strong> {user.verified ? '✔️' : '❌'}</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleDelete(user._id)}
                  className="bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200 transition"
                >
                   Xoá
                </button>
                <button
                  onClick={() => setEditingUser(user)}
                  className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 transition"
                >
                  ✏️ Chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Modal chỉnh sửa */}
    {editingUser && (
      <UserEditModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleUpdate}
      />
    )}

    <ToastContainer position="top-right" autoClose={3000} />
  </div>
</>
  );
};




export default AdminUserPage;
