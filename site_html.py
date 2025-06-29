# site_html.py (Improved + Summarizer + Better Matching)

import os
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.document_loaders import UnstructuredHTMLLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.docstore.document import Document
from transformers import pipeline

# Directories
VECTOR_DIR = "vector_store/"
HTML_DIR = "data/temple_html/"

# Embeddings & Summarizer
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

# Step 1: Create FAISS vector store from HTML
def create_vectorstore():
    documents = []
    for filename in os.listdir(HTML_DIR):
        if filename.endswith(".html"):
            loader = UnstructuredHTMLLoader(os.path.join(HTML_DIR, filename))
            data = loader.load()
            splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
            chunks = splitter.split_documents(data)
            documents.extend(chunks)
    vectordb = FAISS.from_documents(documents, embedding_model)
    vectordb.save_local(VECTOR_DIR)

# Step 2: Load the vector store
def load_vectorstore():
    if not os.path.exists(os.path.join(VECTOR_DIR, "index.faiss")):
        create_vectorstore()
    vectordb = FAISS.load_local(VECTOR_DIR, embedding_model, allow_dangerous_deserialization=True)
    return vectordb

# Step 3: Main answer function
def get_answer_from_html(query):
    vectordb = load_vectorstore()

    # Better relevance using MMR
    docs = vectordb.max_marginal_relevance_search(query, k=5, fetch_k=10)

    # Filter docs that include at least the first word of query
    keyword = query.lower().split()[0]
    docs = [doc for doc in docs if keyword in doc.page_content.lower()]

    if not docs:
        return "❌ I couldn't find anything related to that temple."

    content = "\n".join([doc.page_content.strip() for doc in docs])
    lines = [line.strip() for line in content.splitlines() if len(line.strip()) > 40]
    unique_lines = list(dict.fromkeys(lines))
    top_text = " ".join(unique_lines[:5])

    if len(top_text) < 50:
        return "ℹ️ The content is too short to summarize. Here's what I found:\n" + top_text

    try:
        summary = summarizer(top_text, max_length=80, min_length=30, do_sample=False)[0]["summary_text"]
        return summary
    except Exception as e:
        print("⚠️ Summarization error:", e)
        return top_text[:250] + "..."
