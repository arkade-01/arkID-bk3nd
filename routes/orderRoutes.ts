import { Router } from "express";
import { createOrder } from "../controller/orderController";

const router = Router();

// Create a new order
router.post("/", createOrder);

export default router;

