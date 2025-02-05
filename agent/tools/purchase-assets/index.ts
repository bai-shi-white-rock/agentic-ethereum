import { z } from "zod";
import { customActionProvider, EvmWalletProvider } from "@coinbase/agentkit";
import { encodeFunctionData } from "viem";
import { abi } from "./abi";

const purchaseAssets = customActionProvider<EvmWalletProvider>({ // wallet types specify which providers can use this action. It can be as generic as WalletProvider or as specific as CdpWalletProvider
  name: "purchase_assets",
  description: "Purchase assets using on chain using the Exchange contract; this tool can be use on any network",
  schema: z.object({
    asset: z.string().describe("The asset to purchase"),
    amount: z.string().describe("The amount of the asset to purchase (wei)"),
  }),
  invoke: async (walletProvider, args: any) => {
    try {
      const { asset, amount } = args;
      const contractAddress = "0xcBA9F8FE21C39880535D5E359eDc0A785Dce8851";
      
      /*
      -- READ STATE --
  
      const count = await walletProvider.readContract({
        address: contractAddress,
        abi,
        functionName: "getCount",
        args: [],
      });
      */
  
      const hash = await walletProvider.sendTransaction({
        to: contractAddress,
        data: encodeFunctionData({
          abi,
          functionName: "increment",
          args: [],
        }),
      });
  
      await walletProvider.waitForTransactionReceipt(hash);
      
      return `Successfully incremented counter. New count: ${hash}. Asset: ${asset}, Amount: ${amount}`;
    } catch (error) {
      console.error(error);
      return `Error: ${error}`;
    }
  },
});

export default purchaseAssets;