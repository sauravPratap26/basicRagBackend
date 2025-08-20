import "dotenv/config";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

export const geminiIndexing = async (content, name, type = "text") => {
  let docs = [];

  if (type === "pdf") {
    const pdfLoader = new PDFLoader(content);
    docs = await pdfLoader.load();
  } else if (type === "csv") {
    const csvLoader = new CSVLoader(content);
    docs = await csvLoader.load();
  } else {
    docs = [new Document({ pageContent: content })];
  }

  docs = docs.map((doc) => {
    return new Document({
      pageContent: doc.pageContent,
      metadata: {
        ...doc.metadata,
        sourceType: type,
      },
    });
  });

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
    separators: type === "pdf" ? ["\n\n"] : ["\n"],
  });

  const splitDocs = await splitter.splitDocuments(docs);

  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "models/embedding-001",
    apiKey: process.env.GEMINI_API_KEY,
  });

  await QdrantVectorStore.fromDocuments(splitDocs, embeddings, {
    url: process.env.QDRANT_URL,
    collectionName: name,
  });

  console.log(`Indexed ${splitDocs.length} chunks into collection '${name}'`);
  return { success: true, chunks: splitDocs.length };
};
