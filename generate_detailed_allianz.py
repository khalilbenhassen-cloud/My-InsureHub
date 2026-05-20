import os
from fpdf import FPDF

os.makedirs('test_policies', exist_ok=True)

class PolicyPDF(FPDF):
    def header(self):
        self.set_font('helvetica', 'B', 16)
        self.set_text_color(0, 50, 150)
        self.cell(0, 10, "Allianz France", 0, 1, 'R')
        self.set_font('helvetica', 'I', 11)
        self.set_text_color(100, 100, 100)
        self.cell(0, 5, "allianz.fr", 0, 1, 'R')
        self.set_draw_color(0, 50, 150)
        self.line(10, 30, 200, 30)
        self.ln(15)

    def chapter_title(self, title):
        self.set_font('helvetica', 'B', 12)
        self.set_fill_color(220, 235, 255)
        self.set_text_color(0, 0, 0)
        self.cell(0, 10, title, 0, 1, 'L', True)
        self.ln(4)

    def chapter_body(self, text):
        self.set_font('helvetica', '', 11)
        self.set_text_color(40, 40, 40)
        self.multi_cell(0, 6, text)
        self.ln(5)

def clean_text(text):
    return text.replace('€', 'EUR').replace('’', "'")

pdf = PolicyPDF()
pdf.add_page()

pdf.set_font('helvetica', 'B', 18)
pdf.set_text_color(0, 0, 0)
pdf.cell(0, 10, clean_text("CONDITIONS PARTICULIERES - ASSURANCE VIE PREVOYANCE"), 0, 1, 'C')
pdf.ln(5)

pdf.set_font('helvetica', 'B', 12)
pdf.cell(0, 10, clean_text("Contrat N° : ALZ-VIE-PREV-8833990"), 0, 1, 'C')
pdf.ln(10)

pdf.chapter_title("1. IDENTITE DE L'ASSURE ET DES SOUSCRIPTEURS")
pdf.chapter_body(clean_text("Souscripteur et Assure Principal : M. Jean-Baptiste DUPONT\nDate de naissance : 12/04/1980\nAdresse : 45 Boulevard des Capucines, 75002 Paris, France\nProfession : Cadre Superieur\n\nBeneficiaire en cas de deces (1er rang) : Mme Marie DUPONT, nee MARTIN (Conjointe)\nBeneficiaire en cas de deces (2e rang) : Les enfants de l'assure, nes ou a naitre, par parts egales."))

pdf.chapter_title("2. DETAILS DES GARANTIES ET CAPITAUX ASSURES")
pdf.chapter_body(clean_text("Le present contrat garantit le versement d'un capital ou d'une rente selon les conditions suivantes :\n\n- Garantie Deces Toutes Causes : Versement d'un capital fixe de 250 000 EUR aux beneficiaires designes.\n- Garantie Perte d'Autonomie (PTIA) : Versement anticipe de 250 000 EUR si l'assure est reconnu en etat de Perte Totale et Irreversible d'Autonomie avant l'age de 65 ans.\n- Garantie Doublement Accident : En cas de deces suite a un accident de la circulation, le capital verse est double, soit 500 000 EUR.\n- Garantie Rente Education : Versement d'une rente annuelle de 6 000 EUR pour chaque enfant a charge jusqu'a leur 25eme anniversaire en cas de poursuite d'etudes superieures."))

pdf.chapter_title("3. MONTANT DE LA PRIME ET FRAIS")
pdf.chapter_body(clean_text("Le paiement de la prime est exigible a chaque date anniversaire du contrat.\n\nPrime pure de risque : 1 150.00 EUR\nFrais de gestion annuels : 50.00 EUR\nTaxes (Taxe sur les conventions d'assurance) : 103.50 EUR\n\nPrime Totale Annuelle (TTC) : 1303.50 EUR\nPeriodicite des paiements : Prelevement mensuel (108.62 EUR / mois)\nCompte debite : IBAN FR76 3000 1234 5678 9012 3456 789"))

pdf.chapter_title("4. EXCLUSIONS DE GARANTIES ET LIMITATIONS")
pdf.chapter_body(clean_text("Sont formellement exclus de toute couverture et ne donneront lieu a aucune indemnisation :\n\n- Le suicide de l'assure s'il survient au cours de la premiere annee de souscription du contrat (article L. 132-7 du Code des assurances).\n- Les consequences de faits intentionnels de l'assure ou du beneficiaire (par exemple, meurtre de l'assure par le beneficiaire).\n- Les deces survenus lors de la pratique de sports extremes non declares (parachutisme, plongee sous-marine au-dela de 40 metres, alpinisme de haute montagne).\n- Les consequences de l'usage de stupefiants ou d'alcool (taux superieur au seuil legal pour la conduite) entrainant un accident mortel.\n- La participation a des emeutes, mouvements populaires, actes de terrorisme si l'assure y prend une part active.\n- Les maladies non declarees dans le questionnaire medical de souscription initial (fausse declaration intentionnelle)."))

pdf.chapter_title("5. RISQUES ET AVERTISSEMENTS (CLAUSES IMPORTANTES)")
pdf.chapter_body(clean_text("ATTENTION : Toute fausse declaration intentionnelle ou omission lors du remplissage du questionnaire medical entraine la nullite absolue du contrat selon l'article L.113-8 du Code des Assurances. Les primes versees seront conservees par l'assureur a titre de dommages et interets.\n\nDELAI DE CARENCE : Une periode de carence de 3 mois s'applique pour la garantie PTIA (Perte Totale et Irreversible d'Autonomie) en cas de maladie. Aucun delai de carence ne s'applique en cas d'accident.\n\nMISE A JOUR DES DONNEES : Vous etes tenu de nous informer de tout changement de profession, de pratique sportive dangereuse, ou de modification de votre etat civil sous 30 jours."))

pdf.add_page()
pdf.chapter_title("6. PROCEDURE EN CAS DE SINISTRE")
pdf.chapter_body(clean_text("En cas de deces de l'assure, les beneficiaires doivent notifier l'assureur dans un delai de 15 jours ouvrables. Les pieces justificatives suivantes devront etre fournies :\n- Un acte de deces officiel en original\n- Un certificat medical precisant la cause du deces (hors cas de suicide ou exclusion)\n- Les pieces d'identite des beneficiaires\n- Un RIB pour le versement des fonds\n\nEn cas de PTIA, l'assure doit fournir un certificat medical detaille de son medecin traitant ainsi que la decision du Medecin Conseil de la Securite Sociale attestant de son invalidite de 3eme categorie."))

pdf.chapter_title("7. RESILIATION ET REVALORISATION")
pdf.chapter_body(clean_text("L'assure a la possibilite de resilier ce contrat a chaque echeance annuelle moyennant un preavis de deux mois (Loi Chatel). Les garanties et les primes pourront etre revalorisees chaque annee en fonction de l'evolution de l'indice des prix a la consommation declare par l'INSEE."))

filepath = os.path.join('test_policies', "12_Allianz_Vie_Detailed.pdf")
pdf.output(filepath)
print("Created 12_Allianz_Vie_Detailed.pdf!")
