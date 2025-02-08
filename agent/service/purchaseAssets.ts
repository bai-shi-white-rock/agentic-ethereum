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
    const { walletAddress, purchaseOrder, totalAmount } = req.body;

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

    console.log("purchaseOrder", purchaseOrder);

    // Convert purchase order object to text format
    let purchaseOrderText = '';
    for (const [asset, details] of Object.entries(purchaseOrder)) {
      const allocation = (details as any).allocation;
      const smartContractAddress = (details as any).smart_contract_address;
      const symbol = asset.match(/\((.*?)\)/)?.[1] || asset;
      purchaseOrderText += `${(allocation * totalAmount).toFixed(2)} ${symbol} with address ${smartContractAddress}\n`;
    }

    console.log("Purchase order in text format: \n", purchaseOrderText);
    
    const result = await agent.invoke(
      {
        messages: [
          new HumanMessage(
            `You'll use purchase_assets tool to purchase assets. Here is the list of purchase orders:
            '''
            ${purchaseOrderText}
            '''
            please pack all the assets into one call of purchase_assets tool, and only once, no need to call it multiple times, and no need to call it again if it fails, just stop the tool and say that you failed to purchase the assets, and ask user to send more USDC.
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
