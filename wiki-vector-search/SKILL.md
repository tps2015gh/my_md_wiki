---
name: wiki-vector-search
description: Queries the local vector database of Markdown notes. Use this when you need to answer questions about the user's notes or find specific content in the wiki knowledge base using semantic search.
---
# Wiki Vector Search

This skill enables you to search the project's local Chroma vector database to find relevant Markdown notes based on semantic similarity.

## Commands for AI Agent
When the user asks a question about their notes or knowledge base, use these commands:

1.  **Semantic Search:**
    ```bash
    python vector_tool.py query "SEARCH_TERM"
    ```
    *Use this to find the most relevant notes for any topic.*

2.  **Update Database:**
    ```bash
    python vector_tool.py index
    ```
    *Use this if the user has recently added new .md files to the 'note' folder.*

## Workflow
1.  **Query the Database:** Execute the query command above with the user's core question.
2.  **Read Files:** Based on the 'File' name returned (e.g., `Note 1.md`), use `read_file` to get the full content of those specific notes.
3.  **Synthesize Answer:** Provide a comprehensive answer to the user based on the retrieved note content.
