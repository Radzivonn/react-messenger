import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { rm, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { v4 } from 'uuid';

const storage = multer.diskStorage({
  async destination(req, file, callback) {
    const { id } = req.params;
    const userDir = 'src/users-avatars/' + id;

    if (existsSync(userDir)) await rm(userDir, { recursive: true, force: true });
    await mkdir(userDir);

    callback(null, userDir);
  },
  filename(req, file, callback) {
    callback(null, v4() + '_' + file.originalname);
  },
});

const imageTypes = ['image/png', 'image/jpeg', 'image/jpg'];

const fileFilter = (req: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
  if (imageTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

const uploadFileMiddleware = multer({ storage, fileFilter });
export default uploadFileMiddleware;
