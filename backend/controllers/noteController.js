import * as noteService from "../services/noteService.js";
import db from "../config/db.js";
import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";

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
    const [notes] = await db.query("SELECT * FROM notes WHERE username = ?", [
      username,
    ]);
    res.json(notes); // Trả về danh sách ghi chú của người dùng
  } catch (err) {
    console.error("Lỗi khi lấy danh sách ghi chú:", err);
    res.status(500).json({ message: "Lỗi khi lấy danh sách ghi chú" });
  }
};

export const createNote = async (req, res) => {
  const { title, content } = req.body;
  try {
    const newNote = await noteService.createNote(title, content);
    res.status(201).json(newNote);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi tạo ghi chú" });
  }
};

export const deleteNote = async (req, res) => {
  const { id } = req.params;
  try {
    await noteService.deleteNote(id);
    res.json({ message: "Đã xoá ghi chú" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xoá ghi chú" });
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
