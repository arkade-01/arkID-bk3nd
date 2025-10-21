import express from "express";
import cors from "cors";
import { config } from "./config/config";
import { connectDB } from "./config/dbConfig";
import router from "./routes";

const app = express();

// CORS configuration for frontend integration
const allowedOrigins = [
  ...config.CORS_ORIGINS
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
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
