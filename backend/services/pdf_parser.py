import pypdf
from io import BytesIO

def extract_text(file_bytes: bytes) -> str:
    """
    Extract text from PDF file bytes using pypdf
    """
    pdf_file = BytesIO(file_bytes)
    pdf_reader = pypdf.PdfReader(pdf_file)

    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n"

    return text.strip()