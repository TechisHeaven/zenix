import express from "express";
import auth from "./auth";
import users from "./users";
import videos from "./videos";

const router = express.Router();

router.use("/auth", auth);
router.use("/users", users);
router.use("/videos", videos);

export default router;
