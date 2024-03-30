import { bucket } from "../config/firebaseConfig";
import { getErrorMessage } from "./express";

const deleteFileFirebase = async (folderName: string, fileUrl: string): Promise<void> => {
  try {
    const fileNameRegex = /([^/]+?)\?/; // * Regex to untuk ekstrak nama filenya
    const fileName = fileUrl.match(fileNameRegex)?.[1];

    if (!fileName) {
      throw new Error(`Invalid file URL: ${fileUrl}`);
    }

    const [files] = await bucket.getFiles({
      prefix: `${folderName}/${fileName}`,
    });

    const deletionPromise = files.map((file) => file.delete());

    await Promise.all(deletionPromise);
  } catch (error) {
    getErrorMessage(error);
  }
};

export default deleteFileFirebase;
