import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { uploadMiddleware } from "../middlewares/upload";
import {
  getCardByUsername,
  activateCard,
  updateCard,
  getUserCards,
  migrateCards,
  getCardStatus
} from "../controllers/cardController";

const router = Router();

router.post("/activate", authMiddleware, activateCard);
router.get("/:username/status", getCardStatus);
router.patch("/update", authMiddleware, uploadMiddleware.single("image"), updateCard);
router.get("/user/cards", authMiddleware, getUserCards);
router.get("/:username", getCardByUsername);
router.post("/migrate", migrateCards);

export default router;
