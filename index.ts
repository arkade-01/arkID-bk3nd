import express from "express";
import cors from "cors";
import { config } from "./config/config";
import { connectDB } from "./config/dbConfig";
import router from "./routes";

const app = express();

// CORS configuration for frontend integration
app.use(cors({
  origin: [
    'http://localhost:3001', // React dev server
    'http://localhost:3000', // Alternative React port
    config.FRONTEND_URL || 'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
