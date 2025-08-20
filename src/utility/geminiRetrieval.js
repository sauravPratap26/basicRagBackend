import "dotenv/config";

import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { SYSTEM_PROMPT } from "./Prompt.js";
import OpenAI from "openai";

export const geminiRetrieval = async (query, name) => {
  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "models/embedding-001",
    apiKey: process.env.GEMINI_API_KEY,
  });

  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: process.env.QDRANT_URL,
      collectionName: name,
    }
  );

  const vectorSearcher = vectorStore.asRetriever({
    k: 5,
  });

  const relevantChunk = await vectorSearcher.invoke(query);

  return relevantChunk;
};

export const getAnswers = async (query, name) => {
  const client = new OpenAI();
  const relevantChunk = await geminiRetrieval(query, name);
  const prompt = SYSTEM_PROMPT(relevantChunk);

  const response = await client.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: query },
    ],
  });
  console.log(`> ${response.choices[0].message.content}`);

  return response.choices[0].message.content;
};
