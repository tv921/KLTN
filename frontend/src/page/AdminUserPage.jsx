import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import UserEditModal from '../components/UserEditModal'; // thêm dòng này

const AdminUserPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data);
      } catch (err) {
        console.error('Lỗi khi tải danh sách người dùng:', err);
      } finally {
        setLoading(false);
      }
    };
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
    } catch (err) {
      alert('Không thể xoá người dùng');
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


  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Quản lý tài khoản người dùng</h1>
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="space-y-4">
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
      </div>
    </>
  );
};




export default AdminUserPage;
