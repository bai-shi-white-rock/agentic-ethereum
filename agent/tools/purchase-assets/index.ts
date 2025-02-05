import { z } from "zod";
import { customActionProvider, EvmWalletProvider } from "@coinbase/agentkit";
import { investment_assets } from "./investment_asset_list";
import { encodeFunctionData } from "viem";
import { abi } from "./abi";
import { erc20abi } from "./erc20abi";

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
    amount: z.string().describe("The amount of the asset to purchase (wei)"),
  }),
  invoke: async (walletProvider, args: any) => {
    try {
      const { asset, amount } = args;
      // EXCHANGE CONTRACT ADDRESS
      const contractAddress = "0x1936e0493A8EBE16dAbb27C2612581B832Cf94EE";

      // USDC CONTRACT ADDRESS
      const usdcContractAddress = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

      // ASSET CONTRACT ADDRESS
      const assetContractAddress = investment_assets.find(
        (_asset) => _asset.ticket === asset
      )?.smart_contract_address;

      if (!assetContractAddress) {
        return `Asset not found or not supported: ${asset}`;
      }
  
      const usdcAllowance = await walletProvider.readContract({
        address: usdcContractAddress,
        abi: erc20abi,
        functionName: "allowance",
        args: [walletProvider.getAddress() as `0x${string}`, contractAddress as `0x${string}`],
      });

      console.log(`USDC allowance: ${usdcAllowance}`);

      /*
      console.log(`Approving asset... calling ${usdcContractAddress}: ${contractAddress} ${amount} for ${walletProvider.getAddress()}`);
      const approveHash = await walletProvider.sendTransaction({
        to: '0x55dbA6e86D5a96cDFAeD3d1a43D9435998006721',
        data: encodeFunctionData({
          abi: erc20abi,
          functionName: "approve",
          args: [
            '0x1936e0493A8EBE16dAbb27C2612581B832Cf94EE',
            BigInt(10000000),
          ],
        }),
      });

      await walletProvider.waitForTransactionReceipt(approveHash);
      */

      const hash = await walletProvider.sendTransaction({
        to: contractAddress, // Exchange contract address
        data: encodeFunctionData({
          abi,
          functionName: "swap",
          args: [
            "0x036cbd53842c5426634e7929541ec2318f3dcf7e", // USDC
            assetContractAddress as `0x${string}`,
            amount,
          ],
        }),
      });

      await walletProvider.waitForTransactionReceipt(hash);

      return `Successfully purchased asset: ${asset}, Amount: ${amount};`;
    } catch (error) {
      console.error(error);
      return `Error: ${error}`;
    }
  },
});

export default purchaseAssets;
