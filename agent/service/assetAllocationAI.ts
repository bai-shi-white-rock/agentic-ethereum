import { Request, Response } from "express";

export function handleAssetAllocationRequest(req: Request, res: Response) {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ error: "Missing data in request body" });
    }
    console.log(data);

    // ... existing code ...
    res.json({ status: "ok" });
  } catch (error) {
    console.error("Service error:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
}
