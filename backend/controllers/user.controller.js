const User = require('../models/user.model');

// Lấy danh sách tất cả người dùng (chỉ admin mới dùng)
exports.getAllUsers = async (req, res) => {
  try {
    // 1. Lấy các tham số từ query string với giá trị mặc định
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const email = req.query.email;
    const role = req.query.role;

    // 2. Xây dựng đối tượng query để lọc
    const filterQuery = {};
    if (email) {
      // Sử dụng regex để tìm kiếm email chứa chuỗi, không phân biệt hoa thường
      filterQuery.email = { $regex: email, $options: 'i' };
    }
    if (role) {
      filterQuery.role = role;
    }

    // 3. Đếm tổng số tài liệu khớp với bộ lọc
    const totalUsers = await User.countDocuments(filterQuery);

    // 4. Tính tổng số trang
    const totalPages = Math.ceil(totalUsers / limit);

    // 5. Lấy danh sách người dùng cho trang hiện tại, sắp xếp theo ngày tạo mới nhất
    const users = await User.find(filterQuery)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // 6. Trả về kết quả theo cấu trúc yêu cầu của frontend
    res.status(200).json({
      users,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
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


// Lấy thông tin profile của người dùng đang đăng nhập
exports.getUserProfile = async (req, res) => {
  try {
    // Thay req.user.id bằng req.user.sub (nếu sub là ID trong JWT payload)
    const user = await User.findById(req.user.sub).select('-password -otpCode -otpExpires');
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tìm thấy' });
    }
    res.json(user);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin profile người dùng:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Cập nhật thông tin profile của người dùng đang đăng nhập
exports.updateUserProfile = async (req, res) => {
  try {
    // req.user.id được thêm vào bởi auth.middleware (verifyToken)
    const userId = req.user.sub;
    const { name, avatarUrl } = req.body; //

    // Không cho phép người dùng tự cập nhật email, role, password, verified, isActive
    // Các trường này chỉ nên được admin quản lý hoặc thông qua các quy trình riêng biệt (ví dụ: đổi mật khẩu)
    const updates = {};
    if (name) updates.name = name;
    if (avatarUrl) updates.avatarUrl = avatarUrl;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Không có thông tin nào để cập nhật.' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true } // Trả về đối tượng sau khi cập nhật, chạy các validator
    ).select('-password -otpCode -otpExpires'); //

    if (!updatedUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng để cập nhật' });
    }

    res.json({ message: 'Cập nhật thông tin thành công', user: updatedUser });
  } catch (error) {
    console.error('Lỗi khi cập nhật profile người dùng:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};