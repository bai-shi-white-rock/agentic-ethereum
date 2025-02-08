import Airtable from "airtable";
import { Request, Response } from "express";
import { CdpWalletProvider } from "@coinbase/agentkit";
import { initializeAgent } from "../utils/initializedAgent";
import { HumanMessage } from "@langchain/core/messages";

export async function handlePurchaseAssetsRequest(req: Request, res: Response) {
  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASE_ID!
  );
  const USERS_TABLE = "users";

  try {
    const { walletAddress, purchaseOrder } = req.body;

    if (!walletAddress || !purchaseOrder) {
      return res.status(400).json({
        error: "Missing `walletAddress` or `purchaseOrder` in request body",
      });
    }

    // First, find the user record ID by wallet address
    const userRecords = await base(USERS_TABLE)
      .select({
        filterByFormula: `{walletAddress} = '${walletAddress}'`,
        maxRecords: 1,
      })
      .firstPage();

    if (!userRecords || userRecords.length === 0) {
      return res.status(404).json({
        error: "User not found with the provided wallet address",
      });
    }

    const cdpMnemonicPhrase = userRecords[0].fields.cdpMnemonicPhrase as string;
    
    // Configure CDP Wallet Provider
    const config = {
      apiKeyName: process.env.CDP_API_KEY_NAME,
      apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(
        /\\n/g,
        "\n"
      ),
      mnemonicPhrase: cdpMnemonicPhrase,
      networkId: process.env.NETWORK_ID || "base-sepolia",
    };

    const walletProvider = await CdpWalletProvider.configureWithWallet(config);
    const { agent, agentConfig } = await initializeAgent(walletProvider);

    const result = await agent.invoke(
      {
        messages: [
          new HumanMessage(
            `You'll use purchase_assets tool to purchase assets. Here is the list of purchase orders: ${purchaseOrder}
            and this is the mnemonic phrase of the wallet: ${cdpMnemonicPhrase}`
          ),
        ],
      },
      agentConfig
    );

    res.json({ status: "ok" , result });
  } catch (error) {
    console.error("Service error:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
}
