import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env

# Initialize OpenAI client for Groq
client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.getenv("GROQ_API_KEY")
)

def analyze_policy(text: str, language: str) -> dict:
    """
    Analyze insurance policy text and return structured analysis.
    """
    # Truncate text to 12000 characters
    truncated_text = text[:12000]

    # Define the prompt for the AI
    prompt = f"""
You are an expert insurance analyst. Analyze the following insurance policy text and provide a structured analysis.
The user's language is {language}. Respond in that language.

Policy Text:
{truncated_text}

Please provide a JSON object with the following fields:
- company_name: string (name of the insurance company issuing the policy)
- company_domain: string (the official website domain of the insurance company, e.g., 'allianz.fr', 'axa.com'. If unknown, guess it based on the company name)
- policy_number: string (the official policy number or contract number, usually found near the top, e.g. "Contrat N°" or "Police numéro". If none found, return null)
- vehicle_marque: string (if it's an auto policy, extract the vehicle make/marque and model, e.g., 'Peugeot 3008'. If not an auto policy or not found, return null)
- vehicle_matricule: string (if it's an auto policy, extract the license plate/immatriculation, e.g., 'XY-789-ZT'. If not an auto policy or not found, return null)
- policy_type: string (type of insurance, e.g., 'auto', 'home', 'health')
- summary: string (plain-language summary of the policy)
- premium_amount: number (extract the exact annual premium/cost in euros. If not found or not explicitly stated in the document, return exactly 0.0)
- coverages: array of objects, each with 'item' (string) and 'amount' (string or number)
- exclusions: array of strings (what is not covered)
- warnings: array of strings (risk warnings or important notes)
- suggested_questions: array of strings (questions the user should ask their insurer)
- confidence_score: number between 0 and 1 (confidence in the analysis)

IMPORTANT: Return ONLY valid JSON. Do not wrap in markdown code fences or any extra text.
"""

    # Call the Groq API (via OpenAI compatible endpoint)
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You are an expert insurance analyst that returns only valid JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=2000
    )

    # Extract the response content
    content = response.choices[0].message.content.strip()

    # Remove any markdown code fences if present
    if content.startswith("```json"):
        content = content[7:]
    if content.endswith("```"):
        content = content[:-3]
    content = content.strip()

    # Parse JSON
    try:
        analysis = json.loads(content)
    except json.JSONDecodeError:
        # Fallback: if JSON parsing fails, return a default structure
        analysis = {
            "company_name": "Unknown Company",
            "company_domain": None,
            "policy_number": None,
            "vehicle_marque": None,
            "vehicle_matricule": None,
            "policy_type": "unknown",
            "summary": "Failed to parse analysis.",
            "premium_amount": 0.0,
            "coverages": [],
            "exclusions": [],
            "warnings": ["AI response was not valid JSON."],
            "suggested_questions": [],
            "confidence_score": 0.0
        }

    return analysis