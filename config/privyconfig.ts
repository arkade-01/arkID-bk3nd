import { PrivyClient } from "@privy-io/server-auth";
import { config } from "./config";

const privyClient = new PrivyClient(
  config.PRIVY_APP_ID, 
  config.PRIVY_SECRET);

export default privyClient;