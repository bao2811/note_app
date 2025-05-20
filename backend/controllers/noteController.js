import * as noteService from "../services/noteService.js";
import db from "../config/db.js";
import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";

// Hàm tạo token
const generateToken = (user) => {
  const token = jwt.sign(
    { username: user.username, email: user.email }, // Payload (Thông tin người dùng)
    "SECRET_KEY", // Secret key để ký token
    { expiresIn: "1h" } // Token hết hạn sau 1 giờ
  );

  return token;
};

export const home = async (req, res) => {
  const username = req.user.username; // Lấy tên người dùng từ token đã giải mã
  const [notes] = await db.query("SELECT * FROM notes WHERE username = ?", [
    username,
  ]);
  res.json(notes); // Trả về danh sách ghi chú của người dùng
};

// Thêm hàm lấy danh sách ghi chú
export const getNotes = async (req, res) => {
  try {
    const username = req.user.username; // Lấy tên người dùng từ token đã giải mã
    const [notes] = await db.query(
      "SELECT * FROM notes WHERE username = ? AND is_deleted = 1",
      [username]
    );

    res.json(notes); // Trả về danh sách ghi chú của người dùng
  } catch (err) {
    console.error("Lỗi khi lấy danh sách ghi chú:", err);
    res.status(500).json({ message: "Lỗi khi lấy danh sách ghi chú" });
  }
};

export const updateNote = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const username = req.user.username; // Lấy tên người dùng từ token đã giải mã
  const { createDay } = req.body; // Lấy ngày tạo ghi chú từ body
  const createD = new Date(createDay);
  if (isNaN(createD.getTime())) {
    createD = new Date(); // Nếu không hợp lệ, sử dụng ngày hiện tại
  }
  createD.toISOString().slice(0, 19).replace("T", " ");
  console.log("Ngày tạo ghi chú:", createD);

  try {
    db.query("UPDATE notes SET is_deleted = 0 WHERE id = ? AND username = ?", [
      id,
      username,
    ]);

    const [note] = await db.query(
      "INSERT INTO notes (username, title, content, created_at, is_deleted) VALUES (?, ?, ?, ?, 1)",
      [username, title, content, createD]
    );
    if (note.affectedRows === 0) {
      return res.status(404).json({ message: "Ghi chú không tồn tại" });
    }
    return res
      .status(200)
      .json({ message: "Ghi chú đã được cập nhật", note: note });
  } catch (err) {
    console.error("Lỗi khi cập nhật ghi chú:", err);
    return res.status(500).json({ message: "Lỗi khi cập nhật ghi chú" });
  }
};

export const createNote = async (req, res) => {
  const { title, content } = req.body;
  const username = req.user.username; // Lấy tên người dùng từ token đã giải mã

  try {
    const newNote = await db.query(
      "INSERT INTO notes (username, title, content, is_deleted) VALUES (?, ?, ?, 1)",
      [username, title, content]
    );
    res.status(201).json({
      success: true,
      message: "Ghi chú đã được tạo",
      note: {
        id: newNote.insertId,
        title: title,
        content: content,
        username: username,
      },
    });
  } catch (err) {
    console.error("Lỗi khi tạo ghi chú:", err);
    res.status(500).json({ message: "Lỗi khi tạo ghi chú" });
  }
};

export const deleteNote = async (req, res) => {
  const { id } = req.params;
  try {
    const username = req.user.username; // Lấy tên người dùng từ token đã giải mã
    const [result] = await db.query(
      "UPDATE notes SET is_deleted = 0 WHERE id = ? AND username = ?",
      [id, username]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Ghi chú không tồn tại" });
    }
    res.json({ message: "Ghi chú đã được xoá" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xoá ghi chú" });
  }
};

export const checkAuth = async (req, res) => {
  const token = req.body.token; // Lấy token từ body
  const decoded = jwt.verify(token, "SECRET_KEY");
  console.log("Giải mã token:", decoded);
  if (!token) {
    return res.status(401).json({ message: "Không có token" });
  }

  try {
    const user = jwtDecode(token);
    console.log("Người dùng từ token:", user);
    const check = await noteService.login(user.username, user.password);
    if (!check) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }
    // Nếu token hợp lệ, trả về thông tin người dùng
    res.json({
      success: true,
      message: "Token hợp lệ",
      user: {
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Lỗi khi xác thực:", err);
    res.status(500).json({ message: "Lỗi khi xác thực" });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Kiểm tra dữ liệu đầu vào
    if (!username || !password) {
      return res.status(400).json({ message: "Vui lòng điền đủ thông tin" });
    }
    // Gọi hàm login từ service
    const user = await noteService.login(username, password);
    console.log("Người dùng:", user);
    const token = generateToken(user); // Tạo token cho người dùng

    // Trả về thông tin người dùng nếu đăng nhập thành công
    res.json({
      success: true,
      message: "Đăng nhập thành công",
      token: token,
    });
  } catch (err) {
    // Trường hợp lỗi (sai tên đăng nhập hoặc mật khẩu)
    if (
      err.message === "Sai tên đăng nhập hoặc mật khẩu" ||
      err.message === "Sai mật khẩu"
    ) {
      return res.status(401).json({ message: err.message });
    }
    // Các lỗi khác (Lỗi hệ thống, lỗi cơ sở dữ liệu)
    res.status(500).json({ message: "Lỗi khi đăng nhập" });
  }
};

export const register = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "Vui lòng điền đủ thông tin" });
  }

  try {
    console.log("Đã vào hàm đăng ký", req.body);
    // Kiểm tra xem tên đăng nhập hoặc email đã tồn tại chưa
    const existingUser = await db.query(
      "SELECT * FROM accounts WHERE username = ? OR email = ?",
      [username, email]
    );
    if (existingUser[0].length > 0) {
      console.log(existingUser.length);
      console.log(existingUser);
      return res.status(400).json({
        message: "Tên đăng nhập hoặc email đã tồn tại",
      });
    }
    // Băm mật khẩu trước khi lưu vào cơ sở dữ liệu
    const hashedPassword = await bcrypt.hash(password, 10);
    // Lưu thông tin người dùng vào cơ sở dữ liệu
    const newUser = await db.query(
      "INSERT INTO accounts (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );
    // Trả về thông tin người dùng đã đăng ký thành công
    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      user: {
        id: newUser.insertId,
        username: username,
        email: email,
      },
    });
  } catch (err) {
    // Trường hợp lỗi (lỗi hệ thống, lỗi cơ sở dữ liệu)
    console.error("Lỗi khi đăng ký:", err);
    if (err.message === "Lỗi khi kiểm tra user") {
      return res.status(500).json({ message: "Lỗi khi kiểm tra user" });
    } else if (err.message === "Lỗi khi băm mật khẩu") {
      return res.status(500).json({ message: "Lỗi khi băm mật khẩu" });
    } else if (err.message === "Lỗi khi đăng ký người dùng") {
      return res.status(500).json({ message: "Lỗi khi đăng ký người dùng" });
    } else if (err.message === "Tên đăng nhập hoặc email đã tồn tại") {
      return res
        .status(400)
        .json({ message: "Tên đăng nhập hoặc email đã tồn tại" });
    }
    res.status(500).json({ message: "Lỗi khi đăng ký" });
  }
};

// Commented out sections remain the same
// // exports.register = async (req, res) => {
// //   console.log(req.body); // In ra thông tin đăng ký
// //   res.status(200).json({ success: true, message: "Đăng ký thành công" });
// //   //   // hoặc nếu lỗi:
// // };

// // exports.register = async (req, res) => {
// //   const { username, email, password } = req.body;

// //   if (!username || !email || !password) {
// //     return res.status(400).json({ message: "Vui lòng điền đủ thông tin" });
// //   }

// //   noteService.register(username, email, password, (err, result) => {
// //     if (err) {
// //       console.error("Lỗi khi đăng ký:", err);
// //       return res
// //         .status(500)
// //         .json({ message: err.message || "Lỗi khi đăng ký" });
// //     }

// //     res.status(201).json(result); // Trả về kết quả đăng ký thành công
// //   });
// // };

// // exports.register = async (req, res) => {
// //   const { username, email, password } = req.body;
// //   try {
// //     if (!username || !email || !password) {
// //       return res.status(400).json({ message: "Vui lòng điền đủ thông tin" });
// //     }
// //     const newUser = await noteService.register(username, email, password);
// //     res.status(201).json(newUser);
// //   } catch (err) {
// //     if (
// //       err.message === "Tên đăng nhập hoặc email đã tồn tại" ||
// //       err.message === "Lỗi khi đăng ký người dùng" ||
// //       err.message === "Lỗi khi băm mật khẩu"
// //     ) {
// //       return res.status(400).json({ message: "Người dùng đã tồn tại" });
// //     }
// //     res.status(500).json({ success: true, message: "Lỗi khi đăng ký" });
// //   }
// // };
