import { Request, Response } from "express";
import { investment_asset_list } from "../constant/investment_asset_list";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { pull } from "langchain/hub";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Document } from "@langchain/core/documents";
import { Annotation } from "@langchain/langgraph";
import { concat } from "@langchain/core/utils/stream";
import { StateGraph } from "@langchain/langgraph";
import { OpenAI } from "openai";

export async function handleAssetAllocationRequest(
  req: Request,
  res: Response
) {
  try {
    const { data } = req.body;
    console.log("request data", data);
    if (!data) {
      return res.status(400).json({ error: "Missing data in request body" });
    }

    // ======= Create a LLM model =======
    const llm = new ChatOpenAI({
      model: "gpt-4o-mini",
      temperature: 0,
    });

    // ======= Create embedding model =======
    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large",
    });

    // ======= Create a vector store =======
    const vectorStore = new Chroma(embeddings, {
      collectionName: "a-test-collection",
      url: "http://localhost:8000", // Optional, will default to this value
      collectionMetadata: {
        "hnsw:space": "cosine",
      }, // Optional, can be used to specify the distance method of the embedding space https://docs.trychroma.com/usage-guide#changing-the-distance-function
    });

    // ======= Create documents for loading into vector store ======
    // Option 1: Not using document loader
    interface Document {
      pageContent: string;
      metadata: {
        source: string;
      };
    }
    // Create the documents array by mapping over investment_assets
    if (!investment_asset_list) {
      throw new Error(
        "investment_asset_list is undefined. Please verify the export in your asset list file and the import path."
      );
    }
    const documents: Document[] = investment_asset_list.map((asset) => {
      const assetData = {
        name: asset.name,
        category: asset.category,
        description: asset.description,
        marketCap: asset.marketCap,
        "12monthsChange": asset["12monthsChange"],
        country: asset.country,
      };

      return {
        pageContent: JSON.stringify(assetData), // pageContent is a JSON string of the asset details
        metadata: { source: "https://example.com" }, // replace with your actual source if needed
      };
    });
    const indexArrayFromAssets: string[] = investment_asset_list.map((asset) =>
      String(asset.index)
    );

    console.log(documents);
    await vectorStore.addDocuments(documents, { ids: indexArrayFromAssets });

    // Option 2: Using document Loader and Document Splitter
    // const loader = new JSONLoader("constant/investment_asset_list.json", [
    //   "/investment_asset_list",
    // ]);
    // const jsonDocs = await loader.load();
    // console.log("json docs loader", jsonDocs);
    // const textLoader = new TextLoader("constant/investment_asset_list.txt");
    // const textDocs = await textLoader.load();
    // console.log("text docs loader", textDocs);

    // // ======= Split the text docs into chunks =======
    // const splitter = new RecursiveCharacterTextSplitter({
    //   chunkSize: 1000,
    //   chunkOverlap: 200,
    // });
    // const allSplits = await splitter.splitDocuments(jsonDocs);
    // console.log(`Split blog post into ${allSplits.length} sub-documents.`); // run ได้ถึงตรงนี้แล้ว

    // // ======= Storing documents in vector store =======
    // await vectorStore.addDocuments(allSplits);

    // ======= Pull RAG chat prompt template =======
    // const promptTemplate = await pull<ChatPromptTemplate>("rlm/rag-prompt");
    // Example:
    // const prompt = await promptTemplate.invoke({
    //   context: `You are an experienced fund manager who provides asset allocation advice based on Modern Portfolio Theory.`,
    //   question: `Based on Modern Portfolio Theory, create an investment asset allocation that maximizes return within the investor's risk tolerance level. Use the following user preference data to inform your decision: ${JSON.stringify(
    //     data,
    //     null,
    //     2
    //   )} Provide an allocation using the assets that you can retrieve from the vector store that is provided in the context.
    //   The allocation percentages must sum to 100%. Return only a JSON object where: - Each key is an asset name - Each value is the percentage allocation (number between 0 and 100)
    //   Example format of the output is like this: {AAPL: 20, US bonds: 30, gold: 50}`,
    // });
    // const messages = prompt.messages;
    // console.log("messages", messages);
    // console.assert(messages.length === 1);
    // messages[0].content;

    // ======= Create a custom prompt template =======
    const template = `You are an experienced fund manager who provides asset allocation advice based on Modern Portfolio Theory
    Provide an allocation using the assets that you can retrieve from the vector store that is provided in the context.
    {context}
    Question: {question}
    The allocation percentages must sum to 100%. Return only a JSON object where Each key is an asset name and Each value is the percentage allocation (number between 0 and 100). No space or enter"
    Use the following pieces of context to answer the question at the end.
    
    Helpful Answer: json object like this: {{"AAPL": "20", "US bonds": "30", "gold": "50"}}`;
    const promptTemplate = ChatPromptTemplate.fromMessages([
      ["user", template],
    ]);

    // ======= Create a LangGraph agent =======
    // 1. Create state
    const InputStateAnnotation = Annotation.Root({
      question: Annotation<string>,
    });

    const StateAnnotation = Annotation.Root({
      question: Annotation<string>,
      context: Annotation<Document[]>,
      answer: Annotation<string>,
    });
    // 2. Create nodes
    // 2.1 Retrieve node
    const retrieve = async (state: typeof InputStateAnnotation.State) => {
      const retrievedDocs = await vectorStore.similaritySearch(state.question);
      return { context: retrievedDocs };
    };
    // 2.2 Generate node
    const generate = async (state: typeof StateAnnotation.State) => {
      const docsContent = state.context
        .map((doc) => doc.pageContent)
        .join("\n");
      const messages = await promptTemplate.invoke({
        question: state.question,
        context: docsContent,
      });
      const response = await llm.invoke(messages);

      return { answer: response.content };
    };
    // 3. Compile into the graph
    const graph = new StateGraph(StateAnnotation)
      .addNode("retrieve", retrieve)
      .addNode("generate", generate)
      .addEdge("__start__", "retrieve")
      .addEdge("retrieve", "generate")
      .addEdge("generate", "__end__")
      .compile();

    //======= Invoke the graph=======
    let inputs = {
      question: `Based on Modern Portfolio Theory, create an investment asset allocation that maximizes return within the investor's risk tolerance level. Use the following user preference data to inform your decision: ${JSON.stringify(
        data
      )} Provide an allocation using the assets that you can retrieve from the vector store that is provided in the context.
        The allocation percentages must sum to 100%. Return only a JSON object where: - Each key is an asset name - Each value is the percentage allocation (number between 0 and 100)
        Example format of the output is like this: {"AAPL":"20","US bonds":"30","gold":"50"}`,
    };
    const result = await graph.invoke(inputs);
    console.log(result.context.slice(0, 1));
    console.log(`\nAnswer: ${result["answer"]}`);
    // res.json(result["answer"]);

    // ===== Call AI to refine the answer into JSON format ===
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const prompt = `I want you to convert this result that is in the form of broken JSON format to JSON format:
        ${result["answer"]}. The current format is like this: "{\"Money Market Fund\":\"10\",\"Corporate AAA Bonds\":\"20\",\"Vanguard S&P 500 ETF\":\"40\",\"Fidelity Total Market Index Fund\":\"30\"}".
        But I want the end result to be like this: {"Money Market Fund":"10","Corporate AAA Bonds":"20","Vanguard S&P 500 ETF":"40","Fidelity Total Market Index Fund":"30"}`;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an experienced fund manager who provides asset allocation advice based on Modern Portfolio Theory.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const allocation = completion.choices[0].message.content;
    if (!allocation) {
      throw new Error("No content in response");
    }

    // Response
    res.json(allocation);
  } catch (error) {
    console.error("Service error:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
}

/// Normal API call version
// import { Request, Response } from "express";
// import { OpenAI } from "openai";
// import * as dotenv from "dotenv";

// dotenv.config({ path: ".env.local" });
// interface PairwiseResponse {
//   index: number;
//   choice_1: string;
//   choice_2: string;
//   answer: string;
// }

// interface RiskAssessmentData {
//   age: number;
//   investment_per_month: number;
//   time_horizon: number;
//   investment_goal: string;
//   risk_tolerance_level_1_to_7: number;
//   pairwise_responses: PairwiseResponse[];
// }

// // Define the expected response structure
// type AssetAllocation = Record<string, number>;
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// export async function handleAssetAllocationRequest(
//   req: Request,
//   res: Response
// ) {
//   try {
//     const { data } = req.body;
//     console.log("request data", data);
//     if (!data) {
//       return res.status(400).json({ error: "Missing data in request body" });
//     }

//     const prompt = `
//       Based on Modern Portfolio Theory, create an investment asset allocation that maximizes return within the investor's risk tolerance level.
//       Use the following user preference data to inform your decision:
//       ${JSON.stringify(data, null, 2)}

//       Provide an allocation using these possible assets provided in the object: TSLA, AAPL, GOOGL, AMZN, DJIA index, US bonds, cryptocurrencies, cash saving, gold.

//       The allocation percentages must sum to 100%.
//       Return only a JSON object where:
//       - Each key is an asset name
//       - Each value is the percentage allocation (number between 0 and 100)
//       Example format: {"AAPL": 20, "US bonds": 30, "gold": 50}
//     `;

//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         {
//           role: "system",
//           content:
//             "You are an experienced fund manager who provides asset allocation advice based on Modern Portfolio Theory.",
//         },
//         {
//           role: "user",
//           content: prompt,
//         },
//       ],
//       temperature: 0.7,
//       response_format: { type: "json_object" },
//       seed: 42, // Optional: for more consistent results
//     });

//     const allocation = completion.choices[0].message.content;
//     if (!allocation) {
//       throw new Error("No content in response");
//     }

//     // Validate the response is valid JSON and matches expected structure
//     try {
//       const parsedAllocation = JSON.parse(allocation) as AssetAllocation;

//       // Validate total percentage equals 100%
//       const total = Object.values(parsedAllocation).reduce(
//         (sum, value) => sum + value,
//         0
//       );
//       if (Math.abs(total - 100) > 0.1) {
//         // Allow small floating point differences
//         throw new Error("Asset allocation percentages must sum to 100%");
//       }

//       res.json({
//         status: "success",
//         allocation: parsedAllocation,
//       });
//     } catch (parseError) {
//       console.error("Invalid allocation format:", parseError);
//       res
//         .status(500)
//         .json({ error: "Failed to generate valid asset allocation" });
//     }
//   } catch (error) {
//     console.error("Service error:", error);
//     res.status(500).json({ error: "Failed to process request" });
//   }
// }
