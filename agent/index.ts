import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import { handleAssetAllocationRequest } from "./service/assetAllocationAI";

dotenv.config({ path: ".env.local" });

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Get current asset allocation
app.post("/asset-allocation", (req: express.Request, res: express.Response) => {
  handleAssetAllocationRequest(req, res);
});

// Execute asset purchase
app.post("/buy-asset");

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Server error:", err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
);

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`Agent server running on port ${PORT}`);
});
