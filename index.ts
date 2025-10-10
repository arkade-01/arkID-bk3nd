import express from "express";
import { config } from "./config/config";
import { connectDB } from "./config/dbConfig";
import router from "./routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.get("/health", (req, res) => {
      res.json({ status: "OK" });
});

app.use("/api", router);

const startServer = async () => {
      await connectDB();
      
      app.listen(config.PORT, () => {
            console.log(`🚀 Server running on port ${config.PORT}`);
      });
};

startServer();

export default app;
