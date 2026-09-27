import { Router } from "express";
import { activeCheck, createPost, getAllPost, softDelete, deletePost } from "../controllers/posts.controller.js";
import multer from "multer";

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    },
})

const upload = multer({ storage: storage });



router.route("/").get(activeCheck);
router.route("/create-post").post(upload.single("media"), createPost);
router.route("/posts").get(getAllPost);
router.route("/soft-delete").post(softDelete)
router.route("/delete").post(deletePost)
export default router;
