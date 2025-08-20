import { QdrantClient } from "@qdrant/js-client-rest";

export const checkCollection = async (collectionName) => {
  const client = new QdrantClient({
    url: process.env.QDRANT_URL,
  });

  try {
    const response = await client.getCollection(collectionName);
    console.log(`Collection '${collectionName}' exists`);
    return { exists: true, details: response };
  } catch (err) {
    if (err.status === 404 || err.response?.status === 404) {
      console.log(`Collection '${collectionName}' does not exist`);
      return { exists: false };
    }

    // other unexpected errors
    console.error("Error checking collection:", err.message);
    throw err;
  }
};
