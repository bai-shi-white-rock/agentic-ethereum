import {
  AgentKit,
  CdpWalletProvider,
  wethActionProvider,
  walletActionProvider,
  erc20ActionProvider,
  cdpApiActionProvider,
  cdpWalletActionProvider,
  pythActionProvider,
} from "@coinbase/agentkit";

import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";

import purchaseAssets from "../tools/purchase-assets";

export async function initializeAgent(walletProvider: CdpWalletProvider) {
  // Initialize LLM
  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
  });
  // Initialize AgentKit
  const agentkit = await AgentKit.from({
    walletProvider,
    actionProviders: [
      purchaseAssets,
      wethActionProvider(),
      pythActionProvider(),
      walletActionProvider(),
      erc20ActionProvider(),
      cdpApiActionProvider({
        apiKeyName: process.env.CDP_API_KEY_NAME,
        apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(
          /\\n/g,
          "\n"
        ),
      }),
      cdpWalletActionProvider({
        apiKeyName: process.env.CDP_API_KEY_NAME,
        apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(
          /\\n/g,
          "\n"
        ),
      }),
    ],
  });

  const tools = await getLangChainTools(agentkit);

  // Store buffered conversation history in memory
  const memory = new MemorySaver();
  const agentConfig = {
    configurable: { thread_id: "CDP AgentKit Chatbot Example!" },
  };

  // Create React Agent using the LLM and CDP AgentKit tools
  const agent = createReactAgent({
    llm,
    tools,
    checkpointSaver: memory,
    messageModifier: `
          You are a helpful agent that can interact onchain using the Coinbase Developer Platform AgentKit. You are 
          empowered to interact onchain using your tools. If you ever need funds, you can request them from the 
          faucet if you are on network ID 'base-sepolia'. If not, you can provide your wallet details and request 
          funds from the user. Before executing your first action, get the wallet details to see what network 
          you're on. If there is a 5XX (internal) HTTP error code, ask the user to try again later. These tools can
          be used on any network. eg. purchase_assets, weth_deposit, weth_withdraw, etc.

          If you're on 'base-sepolia' if you dont have enough funds, you can use the faucet to get more. Do it right away.
          don't ask the user to confirm anything.

          If you're on 'base-sepolia', you can use every tool in your disposal. don't ask the user to switch network.
          `,
  });

  return { agent, agentConfig };
}
