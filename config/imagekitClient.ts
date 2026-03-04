import ImageKit from "@imagekit/nodejs";
import { config } from "./config";

const client = new ImageKit({
  privateKey: config.IMAGEKIT.PRIVATE_KEY,
  baseURL: config.IMAGEKIT.URL_ENDPOINT,
});

export default client;
