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

router.post("/activate", authMiddleware, activateCard);
router.patch("/update", authMiddleware, uploadMiddleware.single("profile_photo"), updateCard);
router.get("/user/cards", authMiddleware, getUserCards);
router.get("/:username", getCardByUsername);

export default router;
