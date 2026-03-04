import { Router } from "express";
import { createOrder } from "../controller/orderController";

const router = Router();

router.post("/", createOrder);

export default router;
