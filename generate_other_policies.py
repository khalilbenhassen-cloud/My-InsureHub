import os
from fpdf import FPDF

os.makedirs('test_policies', exist_ok=True)

class PolicyPDF(FPDF):
    def header(self):
        self.set_font('helvetica', 'B', 16)
        self.cell(0, 10, self.company, 0, 1, 'R')
        self.set_font('helvetica', 'I', 11)
        self.cell(0, 5, self.domain, 0, 1, 'R')
        self.line(10, 30, 200, 30)
        self.ln(20)

    def chapter_title(self, title):
        self.set_font('helvetica', 'B', 12)
        self.set_fill_color(200, 220, 255)
        self.cell(0, 10, title, 0, 1, 'L', True)
        self.ln(4)

    def chapter_body(self, text):
        self.set_font('helvetica', '', 11)
        self.multi_cell(0, 6, text)
        self.ln(5)

def clean_text(text):
    return text.replace('€', 'EUR').replace('’', "'")

def create_policy(filename, company, domain, type_title, policy_number, premium, content_sections):
    pdf = PolicyPDF()
    pdf.company = company
    pdf.domain = domain
    pdf.add_page()
    
    pdf.set_font('helvetica', 'B', 18)
    pdf.cell(0, 10, clean_text(f"CONDITIONS PARTICULIERES - {type_title}"), 0, 1, 'C')
    pdf.ln(5)

    pdf.set_font('helvetica', 'B', 12)
    pdf.cell(0, 10, clean_text(f"Contrat N° : {policy_number}"), 0, 1, 'C')
    pdf.ln(10)
    
    for title, text in content_sections:
        pdf.chapter_title(title)
        pdf.chapter_body(clean_text(text))
        
    pdf.chapter_title("MONTANT DE LA PRIME")
    pdf.chapter_body(clean_text(f"Votre prime a ete calculee selon vos informations.\nPrime Totale Annuelle : {premium} EUR\nTotal a payer TTC : {premium} EUR"))
    
    filepath = os.path.join('test_policies', filename)
    pdf.output(filepath)
    print(f"Created {filename}")

# 1. AXA - Auto
create_policy(
    "7_AXA_Auto.pdf", "AXA France", "axa.fr", "ASSURANCE AUTO", "AX-AUTO-554433", "650.00",
    [
        ("1. VEHICULE ASSURE", "Marque: Renault\nModele: Clio V\nImmatriculation: AB-123-CD\nMise en circulation: 10/01/2023"),
        ("2. GARANTIES", "Responsabilite Civile\nDommages Tous Accidents\nVol, Incendie, Bris de glace")
    ]
)

# 2. Generali - Habitation (Home)
create_policy(
    "8_Generali_Habitation.pdf", "Generali", "generali.fr", "ASSURANCE HABITATION", "GEN-HAB-887766", "245.50",
    [
        ("1. LOGEMENT ASSURE", "Adresse: 15 Rue de la Paix, 75002 Paris\nType: Appartement 3 pieces\nSurface: 65 m2"),
        ("2. GARANTIES PRINCIPALES", "Incendie et risques annexes\nDegat des eaux\nVol et vandalisme\nResponsabilite civile privee")
    ]
)

# 3. Macif - Habitation (Home)
create_policy(
    "9_Macif_Habitation.pdf", "Macif", "macif.fr", "ASSURANCE HABITATION", "MAC-HAB-112233", "190.00",
    [
        ("1. LOGEMENT ASSURE", "Adresse: 42 Avenue des Fleurs, 69000 Lyon\nType: Maison Individuelle\nSurface: 110 m2"),
        ("2. GARANTIES PRINCIPALES", "Incendie\nCatastrophes naturelles\nVol, Bris de glace\nAssistance 24/7")
    ]
)

# 4. Allianz - Assurance Vie (Life)
create_policy(
    "10_Allianz_Vie.pdf", "Allianz France", "allianz.fr", "ASSURANCE VIE", "ALZ-VIE-998877", "1200.00",
    [
        ("1. ASSURE ET BENEFICIAIRES", "Assure: Jean Dupont\nBeneficiaire 1: Marie Dupont (Conjointe)\nBeneficiaire 2: Enfants nes ou a naitre"),
        ("2. GARANTIES DU CONTRAT", "Capital deces : 150 000 EUR\nInvalidite absolue et definitive (IAD) : 150 000 EUR\nVersement d'une rente en cas d'invalidite.")
    ]
)

# 5. Santevet - Assurance Animaux (Pet/Health)
create_policy(
    "11_Santevet_Animaux.pdf", "Santevet", "santevet.com", "ASSURANCE SANTE ANIMALE", "STV-PET-445566", "380.00",
    [
        ("1. ANIMAL ASSURE", "Nom: Rex\nEspece: Chien\nRace: Golden Retriever\nPuce: 250268712345678"),
        ("2. NIVEAU DE COUVERTURE", "Formule: Premium\nRemboursement frais veterinaires: 90%\nPlafond annuel: 2200 EUR\nFranchise annuelle: 50 EUR")
    ]
)

