import client from "../config/imagekitClient";

export const uploadPfp = async (file: Express.Multer.File): Promise<string> => {
  const result = await client.files.upload({
    file: file.buffer.toString("base64"),
    fileName: file.originalname,
    folder: "/profile-photos",
    useUniqueFileName: true,
  });

  if (!result.url) {
    throw new Error("Upload succeeded but no URL was returned");
  }

  return result.url;
};