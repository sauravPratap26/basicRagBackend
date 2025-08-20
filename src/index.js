// server.js
import "dotenv/config";
import express, { urlencoded } from "express";
import { geminiIndexing } from "./utility/geminiIndexing.js";
import {
  createCollection,
  deleteCollection,
} from "./utility/collectionUtility.js";
import { upload } from "./middlewares/multer.middleware.js";
import { checkCollection } from "./utility/checkCollections.js";
import { getAnswers } from "./utility/geminiRetrieval.js";
import { scrapeWebsite } from "./utility/scrapper.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(urlencoded({ extended: true }));

// Root route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// PDF Upload
app.post("/upload-pdf", upload.single("pdfFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Collection name required" });
    }

    const { exists } = await checkCollection(name);
    if (!exists) {
      return res.status(404).json({ error: "No such collection available" });
    }

    const result = await geminiIndexing(req.file.path, name, "pdf");

    return res.status(201).json({
      message: "PDF uploaded and indexed successfully",
      filePath: req.file.path,
      result,
    });
  } catch (err) {
    console.error("Error while indexing PDF:", err);
    return res.status(500).json({ error: "Failed to process PDF" });
  }
});

// Plain Text Upload
app.post("/upload-text", async (req, res) => {
  try {
    const { name, text } = req.body;
    if (!name || !text) {
      return res
        .status(400)
        .json({ error: "Collection name and text required" });
    }

    const { exists } = await checkCollection(name);
    if (!exists) {
      return res.status(404).json({ error: "No such collection available" });
    }

    const result = await geminiIndexing(text, name, "text");

    return res.status(201).json({
      message: "Text indexed successfully",
      result,
    });
  } catch (err) {
    console.error("Error while indexing text:", err);
    return res.status(500).json({ error: "Failed to process text" });
  }
});

// CSV Upload
app.post("/upload-csv", upload.single("csvFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Collection name required" });
    }

    const { exists } = await checkCollection(name);
    if (!exists) {
      return res.status(404).json({ error: "No such collection available" });
    }

    const result = await geminiIndexing(req.file.path, name, "csv");

    return res.status(201).json({
      message: "CSV uploaded and indexed successfully",
      filePath: req.file.path,
      result,
    });
  } catch (err) {
    console.error("Error while indexing CSV:", err);
    return res.status(500).json({ error: "Failed to process CSV" });
  }
});

// Create Collection
app.post("/create-collection", async (req, res) => {
  try {
    let result;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Collection name required" });
    }

    const { exists } = await checkCollection(name);
    if (!exists) {
      result = await createCollection(name);
    }
    res.json({ message: "Collection created", result, collectionName: name });
  } catch (err) {
    res.status(500).json({ error: "Failed to create collection" });
  }
});

// Delete Collection
app.delete("/collection/:name", async (req, res) => {
  try {
    const { name } = req.params;
    if (!name) {
      return res.status(400).json({ error: "Collection name required" });
    }

    await deleteCollection(name);

    return res.status(200).json({
      message: `Collection '${name}' deleted successfully`,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete collection" });
  }
});

app.post("/getAnswers", async (req, res) => {
  try {
    const { userQuery, name, previousChat } = req.body;

    if (!userQuery || !name) {
      return res.status(400).json({
        success: false,
        error: "Both 'userQuery' and 'name' are required",
      });
    }

    const answer = await getAnswers(userQuery, name, previousChat);

    res.status(200).json({
      success: true,
      query: userQuery,
      collection: name,
      answer,
    });
  } catch (err) {
    console.error("Error in QA route:", err);
    res.status(500).json({
      success: false,
      error: "Failed to get answer",
    });
  }
});

app.post("/upload-website", async (req, res) => {
  try {
    const { url, name } = req.body;
    if (!url || !name) {
      return res.status(400).json({ error: "url and name are required" });
    }

    let validUrl;
    try {
      validUrl = new URL(url);
    } catch {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    const content = await scrapeWebsite(validUrl.href);
    const result = await geminiIndexing(
      `Title:${content.title} \n \n Content: ${content.content}`,
      name,
      "website"
    );

    res.status(200).json({
      message: "Website scraped and indexed successfully",
      ...result,
    });
  } catch (err) {
    console.error("Error scraping/indexing:", err.message);
    res.status(500).json({ error: "Failed to scrape and index website" });
  }
});

//health route
app.post("/health", (req, res) => {
  res.json({ success: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at PORT: ${PORT}`);
});
