import express from "express";
import * as noteController from "../controllers/noteController.js";
import { authMiddleware } from "../middlewares/errorHandler.js";

const router = express.Router();

router.use("/home", authMiddleware, noteController.home); // ✅ Đúng hàm
router.get("/note", authMiddleware, noteController.getNotes); // Thêm route để lấy danh sách ghi chú
router.post("/note", authMiddleware, noteController.createNote);
router.delete("/:id", authMiddleware, noteController.deleteNote);
router.post("/auth/register", noteController.register);
router.post("/auth/login", noteController.login); // ✅ Đúng hàm

export default router;
