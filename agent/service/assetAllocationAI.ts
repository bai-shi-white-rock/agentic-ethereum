import { Request, Response } from "express";
import { investment_asset_list } from "../constant/investment_asset_list";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Annotation } from "@langchain/langgraph";
import { StateGraph } from "@langchain/langgraph";

export async function handleAssetAllocationRequest(
  req: Request,
  res: Response
) {
  try {
    const { data } = req.body;
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
      url: "http://localhost:8000", // In case running vector DB on Docker locally
      collectionMetadata: {
        "hnsw:space": "cosine",
      },
    });

    // ======= Create documents for loading into vector store ======
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

    await vectorStore.addDocuments(documents, { ids: indexArrayFromAssets });

    // ======= Create a custom prompt template =======
    const template = `You are an experienced fund manager who provides asset allocation advice based on Modern Portfolio Theory
    Provide an allocation using the assets that you can retrieve from the vector store that is provided in the context.
    The allocation percentages must sum to 100%. Return only a JSON object where Each key is an asset name and Each value is the percentage allocation (number between 0 and 100). No space or enter"
    Use the following pieces of context to answer the question at the end.
    Question: {question}    
    Context: {context}
    Answer: json object like this: {{"AAPL": "20", "US bonds": "30", "gold": "50"}}`;
    const promptTemplateCustom = ChatPromptTemplate.fromMessages([
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
      const messages = await promptTemplateCustom.invoke({
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
    const answerObj = JSON.parse(result["answer"]);
    res.json(answerObj);
  } catch (error) {
    console.error("Service error:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
}
