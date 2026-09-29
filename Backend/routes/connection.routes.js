import { Router } from "express";
import {
  sendConnectionRequest,
  getMyConnectionRequest,
  whatAreMyConnection,
  acceptConnectionRequest,
} from "../controllers/connection.controller.js";
import protect from "../middlewares/authmiddleware.js";

const router = Router();

router.use(protect); // All connection routes require authentication

router.post("/send", sendConnectionRequest);
router.get("/sent", getMyConnectionRequest);
router.get("/received", whatAreMyConnection);
router.post("/respond", acceptConnectionRequest);

export default router;
