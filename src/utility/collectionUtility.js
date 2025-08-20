import { QdrantClient } from "@qdrant/js-client-rest";

export const createCollection = async (collectionName) => {
  try {
    const client = new QdrantClient({
      url: process.env.QDRANT_URL,
    });

    // Define collection schema
    const response = await client.createCollection(collectionName, {
      vectors: {
        size: 768,
        distance: "Cosine",
      },
    });

    console.log(`✅ Collection '${collectionName}' created successfully`);
    return response;
  } catch (err) {
    console.error("❌ Error creating collection:", err);
    throw err;
  }
};


export const deleteCollection = async (collectionName) => {
  try {
    const client = new QdrantClient({
      url: process.env.QDRANT_URL,
    });

    const response = await client.deleteCollection(collectionName);

    console.log(` Collection '${collectionName}' deleted successfully`);
    return { success: true, response };
  } catch (err) {
    console.error("❌ Error deleting collection:", err);
    throw err;
  }
};
