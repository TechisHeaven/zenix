import express from "express";
import auth from "./auth";
import users from "./users";
import videos from "./videos";
import premium from "./premium";
import playlist from "./playlist";

const router = express.Router();

router.use("/auth", auth);
router.use("/users", users);
router.use("/videos", videos);
router.use("/premium", premium);
router.use("/playlist", playlist);

export default router;
