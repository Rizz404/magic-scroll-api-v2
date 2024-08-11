import { bucket } from "../config/firebaseConfig";
import { getErrorMessage } from "./express";

type FolderAvailable = "user" | "note" | "study";

const deleteFileFirebase = async (
  folderName: FolderAvailable,
  fileUrl: string
): Promise<void> => {
  try {
    const fileNameRegex = /([^/]+?)\?/; // * Regex to untuk ekstrak nama filenya
    const fileName = fileUrl.match(fileNameRegex)?.[1];

    if (!fileName) {
      throw new Error(`Invalid file URL: ${fileUrl}`);
    }

    const extension = fileName.split(".").pop();
    const folderNameFromExtension = getFolderNameFromExtension(extension!);

    const [files] = await bucket.getFiles({
      prefix: `${folderName}/${folderNameFromExtension}/${fileName}`,
    });

    const deletionPromise = files.map((file) => file.delete());

    await Promise.all(deletionPromise);
  } catch (error) {
    getErrorMessage(error);
  }
};

export default deleteFileFirebase;

function getFolderNameFromExtension(extension: string): string {
  const extensionList: { [key: string]: string } = {
    jpg: "images",
    jpeg: "images",
    png: "images",
    gif: "images",
    bmp: "images",
    webp: "images",
    mp4: "videos",
    mov: "videos",
    avi: "videos",
    mkv: "videos",
    flv: "videos",
    mp3: "audios",
    wav: "audios",
    ogg: "audios",
    flac: "audios",
    pdf: "documents",
    doc: "documents",
    docx: "documents",
    xls: "documents",
    xlsx: "documents",
    ppt: "documents",
    pptx: "documents",
    txt: "documents",
    zip: "archives",
    rar: "archives",
    "7z": "archives",
  };

  return extensionList[extension] || "others";
}
