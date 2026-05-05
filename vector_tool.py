import sys
import os
import chromadb

def get_db():
    client = chromadb.PersistentClient(path="./chroma_db")
    collection = client.get_or_create_collection(name="notes")
    return collection

def index_notes():
    print("Initializing Vector DB Indexing...")
    collection = get_db()
    notes_dir = "note"
    if not os.path.exists(notes_dir):
        print("No notes found in 'note' directory.")
        return

    docs = []
    metadatas = []
    ids = []
    
    for file in os.listdir(notes_dir):
        if file.endswith(".md"):
            with open(os.path.join(notes_dir, file), 'r', encoding='utf-8') as f:
                content = f.read()
                docs.append(content)
                metadatas.append({"filename": file})
                ids.append(file)
    
    if docs:
        collection.upsert(documents=docs, metadatas=metadatas, ids=ids)
        print(f"Successfully indexed {len(docs)} notes into the Vector DB.")
    else:
        print("No markdown files found to index.")

def query_db(query_text, n=3):
    collection = get_db()
    results = collection.query(query_texts=[query_text], n_results=n)
    
    print(f"\n--- Top {n} Results for: '{query_text}' ---")
    if not results['ids'][0]:
        print("No results found.")
        return

    for i in range(len(results['ids'][0])):
        file_id = results['ids'][0][i]
        distance = results['distances'][0][i]
        snippet = results['documents'][0][i][:150].replace('\n', ' ')
        print(f"\n[{i+1}] File: {file_id}")
        print(f"    Distance: {distance:.4f}")
        print(f"    Snippet: {snippet}...")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python vector_tool.py [index|query] [query_string]")
        sys.exit(1)
    
    action = sys.argv[1]
    if action == "index":
        index_notes()
    elif action == "query":
        query_text = " ".join(sys.argv[2:])
        query_db(query_text)
