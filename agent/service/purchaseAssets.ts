import Airtable from "airtable";
import { Request, Response } from "express";
import { CdpWalletProvider } from "@coinbase/agentkit";
import { initializeAgent } from "../utils/initializedAgent";
import { HumanMessage } from "@langchain/core/messages";
import { mnemonicToAccount } from "viem/accounts";
import { createWalletClient } from "viem";
import { baseSepolia } from "viem/chains";
import { http } from "viem";
import { erc20abi } from "../tools/purchase-assets/erc20abi";

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

    // Approve USDC for the exchange contract
    // somehow CdpWalletProvider is not working, so we need to use viem to do this ;-;
    const account = mnemonicToAccount(cdpMnemonicPhrase);
    const client = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(),
    });

    const approveResult = await client.writeContract({
      account,
      address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      abi: erc20abi,
      functionName: "approve",
      args: [
        "0x1936e0493A8EBE16dAbb27C2612581B832Cf94EE",
        BigInt("1000000000000000000"),
      ],
    });

    console.log(approveResult);

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
            `You'll use purchase_assets tool to purchase assets. Here is the purchase order: ${purchaseOrder}`
          ),
        ],
      },
      agentConfig
    );

    res.json({ status: "ok", result });
  } catch (error) {
    console.error("Service error:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
}
