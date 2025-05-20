import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

// Component giao diện đăng nhập/đăng ký
const AuthPage = ({ isLogin }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLogin = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await fetch("http://localhost:3001/checkAuth", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ token }),
          });
          console.log("Response:", res);
          if (res.ok) {
            navigate("/home");
          }
        } catch (error) {
          console.error("Lỗi kiểm tra token:", error);
        }
      }
    };
    checkLogin();
  }, []);

  // Hàm xử lý nút quay lại
  const handleGoBack = () => {
    navigate(-1);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Tên người dùng là bắt buộc";
    }

    if (!isLogin) {
      if (!formData.email?.trim()) {
        newErrors.email = "Email là bắt buộc";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email không hợp lệ";
      }
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Thêm đường dẫn đầy đủ của API server
    const baseUrl = "http://localhost:3001"; // hoặc URL của server backend
    const url = baseUrl + (isLogin ? "/auth/login" : "/auth/register");

    const payload = isLogin
      ? {
          username: formData.username,
          password: formData.password,
        }
      : {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await res.json();
      } catch (error) {
        const text = await res.text();
        throw new Error(`Lỗi không phải JSON: ${text}`);
      }

      if (res.ok && data.success) {
        // Sửa: Lấy token từ data thay vì response không tồn tại
        const token = data.token;
        console.log("Token:", token);
        localStorage.setItem("token", token);
        navigate("/home");
      } else {
        setErrors({
          server: data.message || "Đăng nhập/Đăng ký thất bại!",
        });
      }
    } catch (err) {
      console.error("Lỗi:", err);
      setErrors({
        server: "Không thể kết nối server!",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            {isLogin ? "Đăng nhập vào tài khoản" : "Tạo tài khoản mới"}
          </h2>
          <p className="text-sm text-gray-600">
            {isLogin
              ? "Đăng nhập để tiếp tục sử dụng ứng dụng"
              : "Vui lòng điền đầy đủ thông tin bên dưới"}
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-lg p-8">
          {errors.server && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    width="16"
                    height="16"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-600">{errors.server}</p>
                </div>
              </div>
            </div>
          )}

          <form
            className="space-y-6"
            onSubmit={handleSubmit}
            display="center"
            border="1.5px"
            fontSize="16px"
          >
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Tên người dùng
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    width="16"
                    height="16"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Nhập tên người dùng"
                />
              </div>
              {errors.username && (
                <p className="mt-2 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            {!isLogin && (
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      width="16"
                      height="16"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="example@gmail.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Mật khẩu
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    width="16"
                    height="16"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {!isLogin && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Xác nhận mật khẩu
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      width="16"
                      height="16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Nhớ đăng nhập
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Quên mật khẩu?
                  </a>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isSubmitting
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {isLogin ? "Đang đăng nhập..." : "Đang đăng ký..."}
                  </div>
                ) : isLogin ? (
                  "Đăng nhập"
                ) : (
                  "Đăng ký"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Hoặc tiếp tục với
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div>
                <a
                  href="#"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <svg
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              </div>

              <div>
                <a
                  href="#"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                  >
                    <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 14-7.503 14-14 0-.21-.015-.42-.034-.63.961-.689 1.8-1.56 2.46-2.548l-.047-.02z" />
                  </svg>
                </a>
              </div>

              <div>
                <a
                  href="#"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                  >
                    <path d="M11.9905 1.78746C5.9935 1.78746 1.11328 6.66767 1.11328 12.6646C1.11328 17.4511 4.23573 21.4638 8.57149 22.9894C9.08462 23.0894 9.28222 22.7717 9.28222 22.4932C9.28222 22.2414 9.26962 21.298 9.26372 20.3581C6.21886 21.0447 5.57403 19.0018 5.57403 19.0018C5.07683 17.702 4.34585 17.3865 4.34585 17.3865C3.34988 16.6913 4.42015 16.7047 4.42015 16.7047C5.5212 16.7803 6.09758 17.8257 6.09758 17.8257C7.07643 19.5316 8.63817 19.0522 9.30142 18.7828C9.39592 18.0816 9.67647 17.6022 9.98808 17.3324C7.54271 17.0605 4.96822 16.1168 4.96822 11.9126C4.96822 10.6652 5.39264 9.64468 6.11891 8.84461C6.01082 8.5783 5.63883 7.48354 6.22259 5.97044C6.22259 5.97044 7.14713 5.68743 9.25097 7.02479C10.1258 6.7833 11.0573 6.66256 11.9905 6.66039C12.9229 6.66256 13.8544 6.7833 14.7317 7.02479C16.8332 5.68743 17.7568 5.97044 17.7568 5.97044C18.3421 7.48354 17.9701 8.5783 17.862 8.84461C18.5891 9.64468 19.0112 10.6652 19.0112 11.9126C19.0112 16.1272 16.4326 17.0582 13.9804 17.3241C14.3694 17.6566 14.7208 18.3154 14.7208 19.3181C14.7208 20.7616 14.7063 22.1421 14.7063 22.4932C14.7063 22.7738 14.8992 23.0941 15.4209 22.9885C19.7545 21.4609 22.8734 17.4503 22.8734 12.6646C22.8734 6.66767 17.9941 1.78746 11.9905 1.78746Z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
            <Link
              to={isLogin ? "/auth/register" : "/auth/login"}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
