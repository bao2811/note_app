import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import noteRoutes from "./routes/noteRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import db from "./config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ Cấu hình CORS đúng cách ở đây (trước mọi route)
app.use(
  cors({
    origin: "http://localhost:5173", // Địa chỉ frontend của bạn
    credentials: true, // Cho phép gửi cookie nếu cần
  })
);

// ✅ Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Static frontend (nếu có build)
app.use(express.static(path.join(__dirname, "../frontend/build")));

// ✅ Middleware xử lý lỗi
app.use(errorHandler);

// Thêm route catch-all cho SPA
// Điều hướng tất cả các request GET không xác định về index.html
app.get("/auth/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.get("/auth/register", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// app.get("/", (req, res) => {
//   const acceptHeader = req.headers.accept || "";
//   if (acceptHeader.includes("text/html")) {
//     res.sendFile(path.join(__dirname, "../frontend/index.html"));
//   } else {
//     res.status(404).json({ message: "API endpoint không tồn tại" });
//   }
// });

// ✅ Route API
app.use("/", noteRoutes);

// ✅ Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
