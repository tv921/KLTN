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
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Quản lý tài khoản người dùng</h1>
        {successMessage && <p className="text-green-600">{successMessage}</p>}
        {errorMessage && <p className="text-red-600">{errorMessage}</p>}
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="space-y-4">
            <div className="mb-4 flex flex-col sm:flex-row gap-4 items-center">
              <input
                type="text"
                placeholder="Tìm theo email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="border px-3 py-2 rounded w-full sm:w-64"
              />
              <select
                value={searchRole}
                onChange={(e) => setSearchRole(e.target.value)}
                className="border px-3 py-2 rounded w-full sm:w-48"
              >
                <option value="">Tất cả vai trò</option>
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
              <button
                onClick={fetchUsers}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Lọc
              </button>

              <button
              onClick={handleReset}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Đặt lại
              </button>
            </div>

            {users.map((user) => (
              <div key={user._id} className="border p-4 rounded shadow flex justify-between items-center">
                <div>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Vai trò:</strong> {user.role}</p>
                  <p><strong>Đã xác minh:</strong> {user.verified ? '✔️' : '❌'}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="text-red-600 hover:underline"
                  >
                    Xoá
                  </button>
                  <button
                    onClick={() => setEditingUser(user)}
                    className="text-blue-600 hover:underline"
                  >
                    Chỉnh sửa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

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
