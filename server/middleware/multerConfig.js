import multer from "multer";

const storage = multer.diskStorage({
    destination: (res, file, cb)=>{
        cb(null, 'uploads/');
    },
    filename:(res, file, cb )=>{
        cb(null, file.originalname);
    
    }
});
export const upload = multer({storage});