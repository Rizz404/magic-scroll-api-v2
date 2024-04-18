import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { bucket } from "../config/firebaseConfig";
import { FileWithFirebase, FilesWithFirebase } from "../utils/express";

type FolderAvailable = "user" | "note" | "study";

interface UploadSingleToFirebase {
  fieldname: string;
  required?: boolean;
  uploadToFolder: FolderAvailable;
}

interface UploadArrayToFirebase extends UploadSingleToFirebase {
  maxFileCount?: number;
}

interface UploadFieldsToFirebase {
  fields: UploadArrayToFirebase[];
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const handleUpload = async (file: FileWithFirebase, uploadToFolder: FolderAvailable) => {
  // * Cuma masalah return next doang penyelesaian sampe berbulan-bulan
  const mimeType = file.mimetype;
  const folderName = getFolderNameFromMimeType(mimeType);

  const fileName = `${uploadToFolder}/${folderName}/${Date.now()}_${file.originalname}`;
  const fileUpload = bucket.file(fileName);

  const blobStream = fileUpload.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  const streamEnded = new Promise<void>((resolve, reject) => {
    blobStream.on("error", reject);
    blobStream.on("finish", () => {
      file.firebaseUrl = `https://firebasestorage.googleapis.com/v0/b/${
        bucket.name
      }/o/${encodeURIComponent(fileName)}?alt=media`;
      resolve();
    });
  });

  blobStream.end(file.buffer);

  await streamEnded;
};

const uploadSingleToFirebase = ({
  fieldname,
  required = false,
  uploadToFolder,
}: UploadSingleToFirebase) => {
  const uploadSingle = upload.single(fieldname);

  return async (req: Request, res: Response, next: NextFunction) => {
    uploadSingle(req, res, async (error) => {
      if (error) return res.status(400).json({ message: error.message });

      const file = req.file as FileWithFirebase;

      if (required && !file) return res.status(400).json({ message: "File is required" });

      if (!file) return next();

      await handleUpload(file, uploadToFolder);

      next();
    });
  };
};

const uploadArrayToFirebase = ({
  fieldname,
  required = false,
  uploadToFolder,
  maxFileCount = 10,
}: UploadArrayToFirebase) => {
  const uploadArray = upload.array(fieldname, maxFileCount);

  return async (req: Request, res: Response, next: NextFunction) => {
    uploadArray(req, res, async (error) => {
      if (error) return res.status(400).json({ message: error.message });

      const files = req.files as FileWithFirebase[];

      if (required && files.length === 0)
        return res.status(400).json({ message: "At least one file is required" });

      if (files.length === 0) return next();

      await Promise.all(files.map((file) => handleUpload(file, uploadToFolder)));

      next();
    });
  };
};

// todo: just let it go for a while
const uploadFieldsToFirebase = ({ fields }: UploadFieldsToFirebase) => {
  const uploadFields = upload.fields(
    fields.map(({ fieldname, maxFileCount }) => ({ name: fieldname, maxCount: maxFileCount }))
  );

  return async (req: Request, res: Response, next: NextFunction) => {
    uploadFields(req, res, async (error) => {
      if (error) return res.status(400).json({ message: error.message });

      await Promise.all(
        fields.map(async ({ fieldname, required, uploadToFolder }) => {
          // @ts-ignore
          const files = req.files[fieldname] as FileWithFirebase[];

          if (required && (!files || files.length === 0)) {
            throw new Error(`At least one file is required for field ${fieldname}`);
          }

          if (!files || files.length === 0) return next();

          await Promise.all(files.map((file) => handleUpload(file, uploadToFolder)));
        })
      );

      next();
    });
  };
};

const getFolderNameFromMimeType = (mimeType: string): string => {
  const [type] = mimeType.split("/");

  if (type === "image") {
    return "images";
  } else if (type === "video") {
    return "videos";
  } else if (type === "audio") {
    return "audios";
  }

  const folderName = getFolderNameFromMimeTypeList(mimeType);
  return folderName || "others";
};

const getFolderNameFromMimeTypeList = (mimeType: string): string | undefined => {
  const mimeTypeList: { [key: string]: string } = {
    "application/pdf": "documents",
    "application/msword": "documents",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "documents",
    "application/vnd.ms-excel": "documents",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "documents",
    "application/vnd.ms-powerpoint": "documents",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "documents",
    "text/plain": "documents",
    "application/zip": "archives",
    "application/x-rar-compressed": "archives",
    "application/x-7z-compressed": "archives",
  };

  return mimeTypeList[mimeType];
};

export { uploadSingleToFirebase, uploadArrayToFirebase, uploadFieldsToFirebase };
