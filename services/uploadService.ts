import client from "../config/imagekitClient";

export const uploadPfp = async (file: Express.Multer.File): Promise<string> => {
  const result = await client.files.({
    file: file.buffer,
    fileName: file.originalname,
    folder: "/profile-photos",
    useUniqueFileName: true,
  });

  return result.url;
};