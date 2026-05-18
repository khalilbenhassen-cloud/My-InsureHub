import os
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.getenv("GROQ_API_KEY")
)

PERSIST_DIRECTORY = "./chroma_db"
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

def get_vector_store(policy_id: int) -> Chroma:
    """
    Retrieve the persistent vector store for a specific policy.
    """
    collection_name = f"policy_{policy_id}"
    return Chroma(
        persist_directory=PERSIST_DIRECTORY,
        embedding_function=embeddings,
        collection_name=collection_name
    )

def build_vector_store(text: str, policy_id: int) -> Chroma:
    """
    Build a persistent vector store from the base policy text.
    """
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    chunks = text_splitter.split_text(text)

    vectorstore = Chroma.from_texts(
        texts=chunks,
        embedding=embeddings,
        collection_name=f"policy_{policy_id}",
        persist_directory=PERSIST_DIRECTORY
    )
    
    # In newer Chroma/Langchain versions, persistence is automatic when directory is provided,
    # but we can call persist just to be safe if the method exists.
    if hasattr(vectorstore, 'persist'):
        vectorstore.persist()

    return vectorstore

def add_to_vector_store(text: str, policy_id: int) -> Chroma:
    """
    Add supplemental document text to an existing policy's vector store.
    """
    vectorstore = get_vector_store(policy_id)
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    chunks = text_splitter.split_text(text)
    
    vectorstore.add_texts(texts=chunks)
    
    if hasattr(vectorstore, 'persist'):
        vectorstore.persist()
        
    return vectorstore

def chat_with_policy(vectorstore: Chroma, question: str, language: str) -> str:
    """
    Chat with the policy using RAG.
    """
    docs = vectorstore.similarity_search(question, k=3)
    context = "\n\n".join([doc.page_content for doc in docs])

    prompt = f"""
You are an expert insurance analyst. Answer the user's question about their insurance policy based on the provided context.
The user's language is {language}. Respond in that language.

Context from the policy:
{context}

Question: {question}

Please provide a helpful, accurate answer based only on the context provided. If the context doesn't contain enough information to answer the question, say so clearly.
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You are an expert insurance analyst that answers questions based on policy context."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=1000
    )

    return response.choices[0].message.content.strip()