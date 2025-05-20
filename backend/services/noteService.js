import db from "../config/db.js";
import bcrypt from "bcrypt";

export const home = async () => {
  try {
    // Note: This function seems to have a circular dependency reference to itself
    // Changed from noteService.getAllNotes() to directly implement the logic
    const [notes] = await db.query("SELECT * FROM notes");
    return notes;
  } catch (error) {
    console.error("Error fetching notes:", error);
    throw error;
  }
};

export const createNote = async (title, content) => {
  // Kiểm tra dữ liệu đầu vào
  if (!title || !content) {
    throw new Error("Title và Content không thể trống");
  }

  try {
    const [result] = await db.query(
      "INSERT INTO notes (title, content) VALUES (?, ?)",
      [title, content]
    );

    return {
      id: result.insertId,
      title,
      content,
    };
  } catch (err) {
    console.error("Error creating note:", err);
    throw err;
  }
};

export const deleteNote = async (id) => {
  if (!id) {
    throw new Error("ID ghi chú không hợp lệ");
  }

  try {
    const [result] = await db.query("DELETE FROM notes WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      throw new Error("Không tìm thấy ghi chú để xoá");
    }
    return true;
  } catch (err) {
    console.error("Error deleting note:", err);
    throw err;
  }
};

export const login = async (username, password) => {
  try {
    // Tìm người dùng trong cơ sở dữ liệu
    const [users] = await db.query(
      "SELECT * FROM accounts WHERE username = ?",
      [username]
    );
    console.log(users);
    if (!users || users.length === 0) {
      throw new Error("Sai tên đăng nhập hoặc mật khẩu");
    }

    const user = users[0];

    // So sánh mật khẩu với mật khẩu đã băm trong cơ sở dữ liệu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Sai mật khẩu");
    }
    // Trả về thông tin người dùng nếu đăng nhập thành công
    return { id: user.id, username: user.username, email: user.email };
  } catch (err) {
    throw err;
  }
};

export const register = async (username, email, password) => {
  try {
    // Kiểm tra username/email tồn tại
    const [users] = await db.query(
      "SELECT * FROM accounts WHERE username = ? OR email = ?",
      [username, email]
    );

    if (users.length > 0) {
      throw new Error("Tên đăng nhập hoặc email đã tồn tại");
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Thêm người dùng vào cơ sở dữ liệu
    const [result] = await db.query(
      "INSERT INTO accounts (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    // Trả về kết quả thành công
    return {
      success: true,
      message: "Đăng ký thành công",
      userId: result.insertId,
    };
  } catch (err) {
    throw err;
  }
};
