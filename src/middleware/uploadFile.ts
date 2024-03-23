import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { bucket } from "../config/firebaseConfig";

interface UploadOptions {
  fieldname: string;
  type?: "single" | "array";
  required?: boolean;
  maxFileCount?: number;
}

const uploadTofirebase = ({
  fieldname,
  type = "single",
  required = false,
  maxFileCount,
}: UploadOptions) => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
  });

  const uploadSingle = upload.single(fieldname);
  const uploadArray = upload.array(fieldname, maxFileCount && maxFileCount);

  if (type === "single" || type === undefined) {
    return async (req: Request, res: Response, next: NextFunction) => {
      uploadSingle(req, res, async (error) => {
        if (error) return res.status(400).json({ message: error.message });

        const file = req.file;

        if (required && !file) return res.status(400).json({ message: "File is required" });

        if (!file) return next();

        await handleUpload(file, next);
      });
    };
  } else {
    return async (req: Request, res: Response, next: NextFunction) => {
      uploadArray(req, res, async (error) => {
        if (error) return res.status(400).json({ message: error.message });

        const files = req.files;

        if (required && (!files || files.length === 0)) {
          return res.status(400).json({ message: "At least one file is required" });
        }

        if (!files || !Array.isArray(files)) return next();

        await Promise.all(files.map((file) => handleUpload(file, next)));
      });
    };
  }
};

const getFolderNameFromMimeType = (mimeType: string): string => {
  const type = mimeType.split("/");
  const folderName = type[0] + "s" || "others";
  return folderName;
};

const createFolderIfNotExists = async (folderName: string) => {
  const [exists] = await bucket.getFiles({ prefix: folderName, delimiter: "/" }).then();
  if (!exists.length) {
    await bucket.file(`${folderName}/`).save(" ");
  }
};

const handleUpload = async (file: Express.Multer.File, next: NextFunction) => {
  const mimeType = file.mimetype;
  const folderName = getFolderNameFromMimeType(mimeType);

  await createFolderIfNotExists(folderName);

  const fileName = `${Date.now()}_${file.originalname}`;
  const fileUpload = bucket.file(fileName);

  const blobStream = fileUpload.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  const streamEnded = new Promise<void>((resolve, reject) => {
    blobStream.on("error", reject);
    blobStream.on("finish", () => {
      // @ts-ignore
      file.firebaseUrl = `https://firebasestorage.googleapis.com/v0/b/${
        bucket.name
      }/o/${encodeURIComponent(fileName)}?alt=media`;
      resolve();
    });
  });

  blobStream.end(file.buffer);

  await streamEnded;
  next();
};

export default uploadTofirebase;
