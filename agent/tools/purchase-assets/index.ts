import { z } from "zod";
import { customActionProvider, EvmWalletProvider } from "@coinbase/agentkit";
import { investment_assets } from "./investment_asset_list";
import { mnemonicToAccount } from "viem/accounts";
import { createWalletClient, createPublicClient } from "viem";
import { baseSepolia } from "viem/chains";
import { http } from "viem";
import { erc20abi } from "./erc20abi";
import { abi as exchangeAbi } from "./abi";

const EXCHANGE_CONTRACT_ADDRESS = "0x1936e0493A8EBE16dAbb27C2612581B832Cf94EE";
const USDC_CONTRACT_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

const purchaseAssets = customActionProvider<EvmWalletProvider>({
  // wallet types specify which providers can use this action. It can be as generic as WalletProvider or as specific as CdpWalletProvider
  name: "purchase_assets",
  description: `Purchase assets using on chain using the Exchange contract;
  this tool can be use on 'sepolia-base' network
  You can only purchase assets in this list: HYS, USB;
  if user need to purchase other assets, tell them to purchase from the exchange website.
  `,
  schema: z.object({
    asset: z.string().describe("The asset to purchase"),
    amount: z.string().describe("The amount to spend (wei)"),
    mnemonicPhrase: z.string().describe("The mnemonic phrase of the wallet"),
  }),
  invoke: async (_, args: any) => {
    try {
      const { asset, amount, mnemonicPhrase } = args;

      // Get the smart contract address of the asset
      const ASSET_CONTRACT_ADDRESS = investment_assets.find(
        (_asset) => _asset.ticket === asset
      )?.smart_contract_address;

      if (!ASSET_CONTRACT_ADDRESS) {
        return `Asset not found or not supported: ${asset}`;
      }

      // somehow CdpWalletProvider is not working, so we need to use viem to do this ;-;
      const account = mnemonicToAccount(mnemonicPhrase);
      const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http(),
      });
      const client = createWalletClient({
        account,
        chain: baseSepolia,
        transport: http(),
      });

      // Get exchange rate
      let exchangeRate = await publicClient.readContract({
        address: EXCHANGE_CONTRACT_ADDRESS,
        abi: exchangeAbi,
        functionName: "getExchangeAmount",
        args: [
          USDC_CONTRACT_ADDRESS,
          ASSET_CONTRACT_ADDRESS as `0x${string}`,
          BigInt(1),
        ],
      });

      // calculate the amount of USDC to spend
      const usdcToSpendAmount = (BigInt(amount) * exchangeRate);

      // Get the balance of the user
      const balance = await publicClient.readContract({
        address: USDC_CONTRACT_ADDRESS,
        abi: erc20abi,
        functionName: "balanceOf",
        args: [account.address],
      });

      if (balance < usdcToSpendAmount) {
        return `Insufficient balance of USDC: ${balance}; You need to spend ${usdcToSpendAmount} USDC to purchase ${amount} ${asset} tokens. Stop at once!`;
      }

      // Set allowance for the asset contract
      const allowanceHash = await client.writeContract({
        account,
        address: USDC_CONTRACT_ADDRESS,
        abi: erc20abi,
        functionName: "approve",
        args: [
          EXCHANGE_CONTRACT_ADDRESS,
          BigInt("1000000000000000000"),
        ],
      });

      await publicClient.waitForTransactionReceipt({
        hash: allowanceHash,
      });

      const swapHash = await client.writeContract({
        account,
        address: EXCHANGE_CONTRACT_ADDRESS,
        abi: exchangeAbi,
        functionName: "swap",
        args: [
          USDC_CONTRACT_ADDRESS,
          ASSET_CONTRACT_ADDRESS as `0x${string}`,
          usdcToSpendAmount,
        ],
      });
      

      await publicClient.waitForTransactionReceipt({
        hash: swapHash,
      });

      return `Successfully purchased asset: ${asset}, Amount: ${amount};`; // Transaction hash: ${swapHash}`;
    } catch (error) {
      console.error(error);
      return `Error: ${error}`;
    }
  },
});

export default purchaseAssets;
