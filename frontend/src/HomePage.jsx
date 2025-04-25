// components/HomePage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function HomePage() {
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy thông tin người dùng từ localStorage
    const userToken = localStorage.getItem("token");
    try {
      const decoded = jwtDecode(userToken); // giải mã token
      setUser(decoded); // lưu thông tin người dùng
    } catch (err) {
      console.error("Token không hợp lệ:", err);
    }
    if (!userToken) {
      navigate("/auth/login");
      return;
    }

    // Lấy danh sách ghi chú
    fetch("http://localhost:3001/note", {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server responded with status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Notes data:", data);
        setNotes(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Lỗi khi tải ghi chú:", err));
  }, [navigate]);

  const handleAddNote = async () => {
    if (!noteText) return;
    try {
      const userToken = localStorage.getItem("token");
      const res = await fetch("http://localhost:3001/note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ content: noteText }),
      });

      if (!res.ok) {
        throw new Error(`Server trả về lỗi: ${res.status}`);
      }

      const newNote = await res.json();
      setNotes([...notes, newNote]);
      setNoteText("");
    } catch (err) {
      console.error("Lỗi khi thêm ghi chú:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const userToken = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3001/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Server trả về lỗi: ${res.status}`);
      }

      setNotes(notes.filter((note) => note.id !== id));
    } catch (err) {
      console.error("Lỗi khi xóa ghi chú:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navbar */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-indigo-600">NotePro</h1>

          {/* User profile dropdown */}
          <div className="relative">
            <div className="flex items-center space-x-2 cursor-pointer focus:outline-none group">
              <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-lg">
                {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
              </div>
              <span className="font-medium text-gray-700">
                {user?.username || "User"}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>

              {/* Dropdown menu */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.username || "User"}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
                <a
                  href="#profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Thông tin tài khoản
                </a>
                <a
                  href="#settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Cài đặt
                </a>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-start md:gap-6">
          {/* Sidebar/Dashboard */}
          <div className="md:w-64 flex-shrink-0 mb-6 md:mb-0">
            <div className="bg-white rounded-lg shadow p-5 mb-4">
              <h2 className="font-medium text-lg mb-3 text-gray-800">
                Dashboard
              </h2>
              <div className="space-y-3">
                <p className="flex justify-between text-sm">
                  <span className="text-gray-500">Tổng số ghi chú:</span>
                  <span className="font-medium">{notes.length}</span>
                </p>
                <p className="flex justify-between text-sm">
                  <span className="text-gray-500">Đã tạo:</span>
                  <span className="font-medium">
                    {new Date().toLocaleDateString("vi-VN")}
                  </span>
                </p>
                <div className="pt-3 mt-3 border-t">
                  <p className="text-sm text-gray-500">
                    Trạng thái: <span className="text-green-600">Online</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-5">
              <h3 className="font-medium mb-3 text-gray-800">Người dùng</h3>
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium text-xl">
                  {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {user?.username || "User"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {user?.email || "user@example.com"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full py-2 px-3 bg-red-50 text-red-600 rounded-md text-sm font-medium hover:bg-red-100 transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>

          {/* Notes Section */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Danh sách ghi chú
                </h2>
                <div className="flex mb-4">
                  <input
                    type="text"
                    className="flex-1 p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Nhập ghi chú..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddNote()}
                  />
                  <button
                    className="bg-indigo-600 text-white px-4 py-2 rounded-r hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={handleAddNote}
                  >
                    Thêm
                  </button>
                </div>
              </div>

              <div className="px-6 py-4">
                {notes.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="mt-2">
                      Chưa có ghi chú nào. Hãy thêm ghi chú mới!
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {notes.map((note) => (
                      <li
                        key={note.id}
                        className="flex justify-between items-center py-3"
                      >
                        <span className="text-gray-800">{note.content}</span>
                        <div className="flex space-x-2">
                          <button
                            className="text-gray-400 hover:text-indigo-600 focus:outline-none"
                            title="Chỉnh sửa"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            className="text-gray-400 hover:text-red-600 focus:outline-none"
                            onClick={() => handleDelete(note.id)}
                            title="Xóa"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            © {new Date().getFullYear()} NotePro. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
