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

export const getAnswers = async (query, name, previousChat) => {
  const client = new OpenAI();
  const previousChatResponse = await client.chat.completions.create({
    model: "gpt-5-nano",
    messages: [
      {
        role: "system",
        content:
          "You will receive a collection of chat from previous times you need to do a quick summary of it and provide it because it would be further sent for other chat agent as a summary of what the user had previously done, so make it clear and concise of what questions were asked by user earlier on, if there is no chat then simply return no coversation yet, return only string and no JSON strucuture eg: Previous Chat queries/summaries of users are : content",
      },
      { role: "developer", content: previousChat },
    ],
  });

  const previousChatSummary = previousChatResponse.choices[0].message.content;

  const relevantChunk = await geminiRetrieval(query, name);
  const prompt = SYSTEM_PROMPT(relevantChunk);

  const response = await client.chat.completions.create({
    model: "gpt-5-mini",
    messages: [
      { role: "system", content: prompt },
      { role: "developer", content: previousChatSummary },
      { role: "user", content: query },
    ],
  });
  console.log(`> ${response.choices[0].message.content}`);

  return response.choices[0].message.content;
};
