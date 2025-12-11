import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import {
  getCardByUsername,
  activateCard,
  updateCard,
  getUserCards
} from "../controllers/cardController";

const router = Router();

// Public routes
router.get("/:username", getCardByUsername);

// Protected routes
router.post("/activate", authMiddleware, activateCard);
router.patch("/update", authMiddleware, updateCard);
router.get("/user/cards", authMiddleware, getUserCards);

export default router;
