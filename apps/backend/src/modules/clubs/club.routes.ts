import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware.js";
import { registerClub } from "./club.controller.js";

const router = Router();

router.post(
  "/",
  authenticate,
  registerClub
);

export default router;