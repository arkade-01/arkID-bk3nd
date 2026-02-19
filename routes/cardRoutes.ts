import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import {
  getCardByUsername,
  activateCard,
  updateCard,
  getUserCards
} from "../controllers/cardController";

const router = Router();

// Protected routes (must be before /:username to avoid wildcard conflict)
router.post("/activate", authMiddleware, activateCard);
router.patch("/update", authMiddleware, updateCard);
router.get("/user/cards", authMiddleware, getUserCards);

// Public routes
router.get("/:username", getCardByUsername);

export default router;
