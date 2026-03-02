import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { uploadMiddleware } from "../middlewares/upload";
import {
  getCardByUsername,
  activateCard,
  updateCard,
  getUserCards
} from "../controllers/cardController";

const router = Router();

router.get("/:username", getCardByUsername);
router.post("/activate", authMiddleware, activateCard);
router.patch("/update", authMiddleware, uploadMiddleware.single("profile_photo"), updateCard);
router.get("/user/cards", authMiddleware, getUserCards);

export default router;
