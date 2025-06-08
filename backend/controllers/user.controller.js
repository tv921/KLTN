const User = require('../models/user.model');

// Lấy danh sách tất cả người dùng (chỉ admin mới dùng)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password -otpCode -otpExpires'); // ẩn trường nhạy cảm
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// Xóa người dùng
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: 'Đã xoá tài khoản người dùng' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xoá', error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, verified, isActive, avatarUrl } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (role) updates.role = role;
    if (typeof verified === 'boolean') updates.verified = verified;
    if (typeof isActive === 'boolean') updates.isActive = isActive;
    if (avatarUrl) updates.avatarUrl = avatarUrl;

    const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select('-password -otpCode -otpExpires');
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    res.json({ message: 'Cập nhật thành công', user });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};