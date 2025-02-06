import { Request, Response } from "express";
import { CdpWalletProvider } from "@coinbase/agentkit";
import { english, generateMnemonic } from "viem/accounts";
import Airtable from "airtable";

export async function handleCreateAIWalletRequest(req: Request, res: Response) {
  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASE_ID!
  );
  const USERS_TABLE = "users";

  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res
        .status(400)
        .json({ error: "Missing `walletAddress` in request body" });
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

    if (userRecords[0].fields.agentWalletAddress) {
      return res.status(200).json({
        agentWalletAddress: userRecords[0].fields.agentWalletAddress
      });
    }

    const userRecordId = userRecords[0].id;

    const mnemonic = generateMnemonic(english);

    // Configure CDP Wallet Provider
    const config = {
      apiKeyName: process.env.CDP_API_KEY_NAME,
      apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(
        /\\n/g,
        "\n"
      ),
      mnemonicPhrase: mnemonic,
      networkId: process.env.NETWORK_ID || "base-sepolia",
    };

    const walletProvider = await CdpWalletProvider.configureWithWallet(config);
    const exportedWallet = await walletProvider.exportWallet();

    // Save to DB
    const record = await base(USERS_TABLE).update([
      {
        id: userRecordId,
        fields: {
          walletAddress: walletAddress,
          cdpMnemonicPhrase: mnemonic,
          agentWalletAddress: walletProvider.getAddress(),
        },
      },
    ]);

    if (!record || record.length === 0) {
      throw new Error("Failed to create record in Airtable");
    }

    res.json({ agentWalletAddress: walletProvider.getAddress() });
  } catch (error) {
    console.error("Service error:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
}
