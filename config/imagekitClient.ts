import ImageKit from "@imagekit/nodejs";
import { config } from "./config";

const client = new ImageKit({
  privateKey: config.IMAGEKIT.PRIVATE_KEY,
});

export default client;
