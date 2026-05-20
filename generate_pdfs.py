import os
from fpdf import FPDF

# Create directory
os.makedirs('test_policies', exist_ok=True)

class PolicyPDF(FPDF):
    def header(self):
        self.set_font('helvetica', 'B', 15)
        self.cell(0, 10, self.company_name, 0, 1, 'R')
        self.set_font('helvetica', 'I', 10)
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
        self.ln()

policies = [
    {
        "filename": "1_AXA_Assurance_Auto.pdf",
        "company": "AXA France",
        "domain": "axa.fr",
        "title": "CONDITIONS PARTICULIERES - ASSURANCE AUTO",
        "summary": "Ce document atteste que le véhicule Renault Clio (Immatriculation AB-123-CD) est assuré avec une formule Tous Risques.",
        "premium": "Prime annuelle TTC : 650.00 EUR",
        "coverages": "Garanties souscrites :\n- Responsabilité Civile : Illimitée\n- Dommages Tous Accidents : 50 000 EUR\n- Vol et Incendie : Valeur à dire d'expert\n- Bris de glace : Sans franchise\n- Assistance 0 km : Incluse",
        "exclusions": "Exclusions principales :\n- Conduite en état d'ivresse (taux d'alcoolémie > limite légale).\n- Utilisation du véhicule sur circuit pour des compétitions.\n- Dommages causés intentionnellement par l'assuré.",
        "warnings": "Attention : Toute modification des caractéristiques du véhicule (tuning, moteur) doit être déclarée sous peine de nullité du contrat."
    },
    {
        "filename": "2_MACIF_Assurance_Habitation.pdf",
        "company": "MACIF",
        "domain": "macif.fr",
        "title": "CONTRAT MULTIRISQUE HABITATION",
        "summary": "Cette police d'assurance couvre votre résidence principale située au 12 Rue de la Paix, 75002 Paris contre les risques locatifs et les dommages aux biens.",
        "premium": "Prime annuelle TTC : 285.50 EUR",
        "coverages": "Garanties souscrites :\n- Incendie et événements assimilés : Jusqu'à 1 000 000 EUR\n- Dégât des eaux : Jusqu'à 500 000 EUR\n- Vol et vandalisme : 25 000 EUR (franchise 150 EUR)\n- Responsabilité civile vie privée : Illimitée\n- Dommages électriques : 5 000 EUR",
        "exclusions": "Exclusions principales :\n- Objets de valeur non déclarés au-delà de 2 000 EUR.\n- Dommages résultant d'un défaut d'entretien caractérisé et connu de l'assuré.\n- Dégâts dus aux inondations non classées en catastrophe naturelle.",
        "warnings": "Important : En cas de vol, vous avez un délai maximum de 2 jours ouvrés pour porter plainte et nous le déclarer."
    },
    {
        "filename": "3_Allianz_Sante.pdf",
        "company": "Allianz",
        "domain": "allianz.fr",
        "title": "COMPLEMENTAIRE SANTE - FORMULE INTEGRALE",
        "summary": "Contrat de mutuelle santé individuelle visant à compléter les remboursements de la Sécurité Sociale (Régime Obligatoire) pour l'assuré et ses ayants droit.",
        "premium": "Prime annuelle TTC : 1 240.00 EUR",
        "coverages": "Garanties souscrites :\n- Soins courants et honoraires médicaux : 200% de la BRSS\n- Optique : Forfait de 350 EUR par an\n- Dentaire (prothèses) : 300% de la BRSS\n- Hospitalisation (Chambre particulière) : 80 EUR par jour\n- Médecine douce (Ostéopathie) : 4 séances de 40 EUR par an",
        "exclusions": "Exclusions principales :\n- Les chirurgies esthétiques non réparatrices et non prises en charge par la Sécurité Sociale.\n- Les cures thermales non prescrites médicalement.",
        "warnings": "À noter : Les garanties Optique et Dentaire sont soumises à un délai de carence de 3 mois à compter de la date de souscription."
    },
    {
        "filename": "4_SanteVet_Assurance_Animaux.pdf",
        "company": "SantéVet",
        "domain": "santevet.com",
        "title": "ASSURANCE SANTE ANIMALE - CHIEN",
        "summary": "Police d'assurance destinée à couvrir les frais vétérinaires de votre chien (Golden Retriever, pucé) en cas d'accident ou de maladie.",
        "premium": "Prime annuelle TTC : 420.00 EUR",
        "coverages": "Garanties souscrites :\n- Frais chirurgicaux (accident et maladie) : 100% (Plafond 2 000 EUR/an)\n- Frais médicaux courants : 80%\n- Pharmacie prescrite : 80%\n- Forfait Prévention (vaccins, vermifuges) : 50 EUR/an",
        "exclusions": "Exclusions principales :\n- Maladies héréditaires ou congénitales connues (ex: dysplasie de la hanche).\n- Frais liés à la gestation et à la mise bas.\n- Maladies survenues avant la fin du délai de carence (45 jours pour la maladie).",
        "warnings": "Attention : Une franchise annuelle de 50 EUR est appliquée lors de votre première demande de remboursement."
    },
    {
        "filename": "5_Generali_Assurance_Vie.pdf",
        "company": "Generali France",
        "domain": "generali.fr",
        "title": "CONTRAT ASSURANCE DECES ET PREVOYANCE",
        "summary": "Contrat de prévoyance individuelle garantissant le versement d'un capital aux bénéficiaires désignés en cas de décès de l'assuré ou d'une rente en cas d'invalidité absolue et définitive (IAD).",
        "premium": "Prime annuelle TTC : 510.00 EUR",
        "coverages": "Garanties souscrites :\n- Capital Décès toutes causes : 150 000 EUR\n- Perte Totale et Irréversible d'Autonomie (PTIA) : 150 000 EUR par anticipation\n- Doublement du capital si accident de la circulation : 300 000 EUR\n- Rente éducation pour les enfants à charge : 500 EUR/mois/enfant",
        "exclusions": "Exclusions principales :\n- Suicide au cours de la première année d'assurance.\n- Décès résultant de la pratique de sports extrêmes non déclarés (alpinisme de haut niveau, base jump).\n- Conséquences d'actes de terrorisme ou de guerre (sauf disposition légale contraire).",
        "warnings": "Avertissement : Le versement du capital est exonéré de droits de succession dans les limites prévues par la législation fiscale en vigueur."
    }
]

for pol in policies:
    pdf = PolicyPDF()
    pdf.company_name = pol['company']
    pdf.domain = pol['domain']
    
    # Enable text wrapping to avoid decoding errors for special characters
    # Actually, latin-1 is standard for fpdf, so we'll replace typical smart quotes to regular quotes
    def clean_text(text):
        return text.replace('€', 'EUR').replace('’', "'")
    
    pdf.add_page()
    
    # Title
    pdf.set_font('helvetica', 'B', 16)
    pdf.cell(0, 10, clean_text(pol['title']), 0, 1, 'C')
    pdf.ln(10)
    
    # Summary
    pdf.chapter_title("1. RESUME DU CONTRAT")
    pdf.chapter_body(clean_text(pol['summary']))
    
    # Premium
    pdf.chapter_title("2. MONTANT DE LA PRIME")
    pdf.chapter_body(clean_text(pol['premium']))
    
    # Coverages
    pdf.chapter_title("3. GARANTIES SOUSCRITES")
    pdf.chapter_body(clean_text(pol['coverages']))
    
    # Exclusions
    pdf.chapter_title("4. EXCLUSIONS DE GARANTIES")
    pdf.chapter_body(clean_text(pol['exclusions']))
    
    # Warnings
    pdf.chapter_title("5. AVERTISSEMENTS ET CONDITIONS")
    pdf.chapter_body(clean_text(pol['warnings']))
    
    filepath = os.path.join('test_policies', pol['filename'])
    # Write using latin-1 encoding, replacing unknown chars to avoid errors
    pdf.output(filepath)

print("Created 5 PDF policies in test_policies folder!")
