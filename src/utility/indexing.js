import "dotenv/config";
import { OpenAIEmbeddings } from "@langchain/openai";

export const indexing = (pdfPath) => {
  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
  });
};
