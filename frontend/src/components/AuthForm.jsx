import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthForm = ({ isLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.includes('@')) {
      setError('Email không hợp lệ');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await axios.post(`http://localhost:5000${endpoint}`, {
        email,
        password
      });

      if (isLogin) {
        localStorage.setItem('token', res.data.accessToken);
        localStorage.setItem('role', res.data.user.role);
        navigate(res.data.user.role === 'admin' ? '/search' : '/upload');
      } else {
        setSuccess('Đăng ký thành công! Vui lòng kiểm tra email và nhập mã OTP để xác minh.');
        setShowOtpForm(true); // Hiển thị form OTP
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
  setError('');
  try {
    const res = await axios.post('http://localhost:5000/api/auth/verify-otp', {
      email,
      otp
    });
    setSuccess(res.data.message || 'Xác minh thành công!');
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  } catch (err) {
    setError(err.response?.data?.message || 'Xác minh thất bại');
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold text-center">{isLogin ? 'Đăng nhập' : 'Đăng ký'}</h2>
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Mật khẩu"
          className="w-full p-3 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {!isLogin && (
          <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            className="w-full p-3 border rounded"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full p-3 rounded text-white ${loading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Đang xử lý...' : isLogin ? 'Đăng nhập' : 'Đăng ký'}
        </button>

        {showOtpForm && (
        <div className="space-y-3">
        <input
        type="text"
        placeholder="Nhập mã OTP"
        className="w-full p-3 border rounded"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        />
        <button
          type="button"
          onClick={handleVerifyOTP}
          className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700"
        >
          Xác minh OTP
        </button>
        </div>
        )}

      </form>
    </div>
  );
};

export default AuthForm;
