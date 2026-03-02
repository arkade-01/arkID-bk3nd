import ImageKit from "@imagekit/nodejs";
import { config } from "./config";

const client = new ImageKit({
  publicKey: config.IMAGEKIT.PUBLIC_KEY,
  privateKey: config.IMAGEKIT.PRIVATE_KEY,
  urlEndpoint: config.IMAGEKIT.URL_ENDPOINT,
});

export default client;
