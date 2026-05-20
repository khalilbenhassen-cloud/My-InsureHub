import os
from fpdf import FPDF

os.makedirs('test_policies', exist_ok=True)

class PolicyPDF(FPDF):
    def header(self):
        self.set_font('helvetica', 'B', 16)
        self.cell(0, 10, "Peugeot Assurance", 0, 1, 'R')
        self.set_font('helvetica', 'I', 11)
        self.cell(0, 5, "peugeot-assurance.fr", 0, 1, 'R')
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

pdf = PolicyPDF()

def clean_text(text):
    return text.replace('€', 'EUR').replace('’', "'")

pdf.add_page()

# Title
pdf.set_font('helvetica', 'B', 18)
pdf.cell(0, 10, clean_text("CONDITIONS PARTICULIERES - ASSURANCE AUTO"), 0, 1, 'C')
pdf.ln(5)

pdf.set_font('helvetica', 'B', 12)
pdf.cell(0, 10, clean_text("Contrat N° : PA-9098-AZ-2026"), 0, 1, 'C')
pdf.ln(10)

pdf.chapter_title("1. VEHICULE ASSURE")
pdf.chapter_body(clean_text("Marque: Peugeot\nModele: 3008 GT\nImmatriculation: XY-789-ZT\nMise en circulation: 15/05/2024"))

pdf.chapter_title("2. MONTANT DE LA PRIME")
pdf.chapter_body(clean_text("Votre prime a ete calculee selon vos informations.\nPrime Totale Annuelle : 840.50 EUR\nFrais de dossier : 20.00 EUR\nTotal a payer : 860.50 EUR"))

pdf.chapter_title("3. GARANTIES SOUSCRITES (FORMULE TOUS RISQUES)")
pdf.chapter_body(clean_text("- Responsabilite Civile : Illimitee\n- Dommages Tous Accidents : Franchise de 350 EUR\n- Vol et Incendie : Valeur a neuf (si vehicule de moins de 12 mois)\n- Bris de glace : Sans franchise pour reparation, 50 EUR pour remplacement\n- Assistance 0 km : Incluse (Depannage et remorquage)\n- Protection du conducteur : Jusqu'a 1 000 000 EUR"))

pdf.chapter_title("4. EXCLUSIONS DE GARANTIES")
pdf.chapter_body(clean_text("- Conduite sans permis valide ou sous l'emprise d'un etat alcoolique (taux > 0.5g/l) ou de stupefiants.\n- Dommages survenus lors de la participation a des epreuves, courses ou competitions sportives.\n- Usure normale du vehicule, defaut d'entretien ou vice de construction."))

pdf.chapter_title("5. DECLARATION DE SINISTRE")
pdf.chapter_body(clean_text("En cas d'accident, vous devez nous declarer le sinistre dans les 5 jours ouvres (2 jours en cas de vol). Contactez notre service d'assistance au 01 23 45 67 89."))

filepath = os.path.join('test_policies', "6_Peugeot_Assurance_Auto_Test.pdf")
pdf.output(filepath)

print("Created 6_Peugeot_Assurance_Auto_Test.pdf in test_policies folder!")
