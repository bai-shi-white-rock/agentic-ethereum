import { z } from "zod";
import { customActionProvider, EvmWalletProvider } from "@coinbase/agentkit";
import { investment_asset_list } from "../../constant/investment_asset_list";
import { mnemonicToAccount } from "viem/accounts";
import { createWalletClient, createPublicClient } from "viem";
import { baseSepolia } from "viem/chains";
import { http } from "viem";
import { erc20abi } from "./erc20abi";
import { abi as exchangeAbi } from "./abi";

const EXCHANGE_CONTRACT_ADDRESS = "0xbc4AA9cE14769bA3e52fe38a4E369DF483169e99";
const USDC_CONTRACT_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

console.log(
  "investment_asset_list before pass to AI: ",
  investment_asset_list
    .map((asset) => asset.ticket)
    .join(", ")
);

const purchaseAssets = customActionProvider<EvmWalletProvider>({
  // wallet types specify which providers can use this action. It can be as generic as WalletProvider or as specipasic as CdpWalletProvider
  name: "purchase_assets",
  description: `Purchase assets using on chain using the Exchange contract;
  this tool can be use on 'base-sepolia' network
  You can only purchase assets in this smart contract address list: ${investment_asset_list
    .map((asset) => asset.ticket)
    .join(", ")}
  DO NOT change the smart contract address, just use the ones we give you. 
  Because we use the mock contract address, so you must remember that you must use the contract address that we give you, 
  even the Ethereum contract address, use the one we give you.
  `,
  schema: z.object({
    assets: z
      .array(
        z.object({
          asset_name: z.string().describe("The asset to purchase"),
          smartContractAddress: z
            .string()
            .describe("The smart contract address of the asset that we pass to you"),
          amount: z
            .string()
            .describe(
              "The amount to spend (in USDC / please give me the exact amount of what user inputed do not round it or calculate it)"
            ),
        })
      )
      .describe(
        "Assets to purchase, can be multiple assets at once (and we will purchase them all at once, no need to call this tool multiple times)"
      ),
    mnemonicPhrase: z.string().describe("The mnemonic phrase of the wallet"),
  }),
  invoke: async (_, args: any) => {
    try {
      const { assets, mnemonicPhrase } = args;

      console.log("assets", assets);

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

      const usdcToSpendAmount = assets.reduce((acc, asset) => {
        return acc + BigInt(Number(asset.amount) * 10 ** 6);
      }, BigInt(0));

      const convertToWei = (amount: string) => {
        return BigInt(Number(amount) * 10 ** 6);
      };

      const usdcBalance = await publicClient.readContract({
        address: USDC_CONTRACT_ADDRESS,
        abi: erc20abi,
        functionName: "balanceOf",
        args: [account.address],
      });

      console.log(
        "usdcToSpendAmount, usdcBalance",
        usdcToSpendAmount,
        usdcBalance
      );

      if (usdcBalance < usdcToSpendAmount) {
        return `Insufficient balance of USDC: ${usdcBalance}; You need to spend ${usdcToSpendAmount} USDC. Stop at once, no need to call this tool again ask user to send more USDC!`;
      }

      // Set allowance for the asset contract
      const allowanceHash = await client.writeContract({
        account,
        address: USDC_CONTRACT_ADDRESS,
        abi: erc20abi,
        functionName: "approve",
        args: [EXCHANGE_CONTRACT_ADDRESS, BigInt(usdcToSpendAmount)],
      });

      console.log("setting allowance for the asset contract...");

      await publicClient.waitForTransactionReceipt({
        hash: allowanceHash,
      });

      const swapHash = await client.writeContract({
        account,
        address: EXCHANGE_CONTRACT_ADDRESS,
        abi: exchangeAbi,
        functionName: "batchSwap",
        args: [
          assets.map((asset) => {
            console.log("asset", asset.smartContractAddress);
            return {
              tokenFrom: USDC_CONTRACT_ADDRESS,
              tokenTo: asset.smartContractAddress,
              amountFrom: convertToWei(asset.amount),
            };
          }),
        ],
      });

      console.log("swapping assets...");

      await publicClient.waitForTransactionReceipt({
        hash: swapHash,
      });

      return `Successfully purchased assets, Say congratulations to the user! also here is the transaction hash: ${swapHash}`;
    } catch (error) {
      console.error(error);
      return `Error: ${error}`;
    }
  },
});

export default purchaseAssets;
