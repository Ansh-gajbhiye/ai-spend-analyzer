import { Router } from "express";
import { upload } from "../middleware/multerConfig.js";
import { handleUpload } from "../controllers/uploadController.js";

const router = Router();

router.post ('/', upload.single('file'), handleUpload);
export default Router;