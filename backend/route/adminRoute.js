import express from "express";
import { Router } from "express";
import { adminStats, adminDelete } from "../controller/adminController.js"; 
const router = express.Router();
router.get("/stats" , adminStats);
router.delete("/delete" , adminDelete);

export default router
