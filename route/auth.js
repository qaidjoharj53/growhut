import { Router } from "express";
import { signup } from "../controller/auth.js";

const router = Router();

// Route for user signup
router.post("/signup", signup);

export default router;
