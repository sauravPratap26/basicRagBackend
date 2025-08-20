# PDF RAG Backend

Kamisama (also knows as God who knows everything) is a backend for a **PDF-based Retrieval-Augmented Generation (RAG)** system using Node.js, LangChain JS, and Qdrant. It loads PDFs, splits them into pages or paragraphs, creates embeddings via Google Gemini, and stores them in a Qdrant vector database for semantic search.

---

## Features

- Load PDF files locally
- Split PDFs into **pages** or **paragraphs**
- Generate embeddings with **Google Gemini**
- Store embeddings in **Qdrant** vector database
- Easy retrieval for RAG applications

---

---

## Prerequisites

- Node.js v18+
- Qdrant (local or cloud)
- Google Gemini API key
- OpenAi key (optional)

---

## Installation

1. Clone the repository:

```bash
git clone <https://github.com/sauravPratap26/basicRagBackend.git>
cd "RAG Backend"
```

2. Install dependencies:

```bash
npm install
```

3. Create a .env file in the project root:

```bash
GEMINI_API_KEY=your_gemini_api_key
QDRANT_URL=http://localhost:6333 # or your Qdrant Cloud URL
QDRANT_API_KEY=your_qdrant_api_key # optional if using cloud
OPENAI_API_KEY= your_api_key #optional
```