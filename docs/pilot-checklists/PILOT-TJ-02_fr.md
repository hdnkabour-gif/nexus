# Fiche d'essai — Boucherie / grillades (code d'essai PILOT-TJ-02)
Lisez d'abord les [règles communes](_COMMON_fr.md). Application testée : TIJARA OS, version `e5e2b26d`. Scénarios détaillés : docs/33 §5.

## A. À tester
| # | Action | Résultat attendu | ✅/❌/❓ |
|---|---|---|---|
| 1 | Recevoir 10 kg de bœuf | stock 10,000 kg | |
| 2 | Vendre 1,47 kg de kefta à 130 DH/kg + cuisson 20 DH/kg | total 220,50 DH ; la viande sort une seule fois | |
| 3 | Préparer 5 kg de bœuf → 4,6 kg de kefta + 0,4 kg de perte, puis vendre 1,47 kg de kefta | bœuf −5 kg ; il reste 3,130 kg de kefta ; la perte n'est comptée qu'une fois | |
| 4 | Annuler une vente pendant la cuisson | la viande est comptée comme perte, elle ne revient pas en stock | |
| 5 | Client professionnel qui paie une partie de la facture, puis le reste plus tard | le reste dû est juste à chaque étape | |
| 6 | Deux caisses vendent les 2 derniers kg au même moment | une seule vente passe ; le stock n'est jamais négatif | |
| 7 | Appuyer deux fois sur « Payer » | un seul paiement est enregistré | |
| 8 | Utiliser l'application sur téléphone, en arabe | lisible, boutons faciles à toucher | |

## B. Pas encore disponible
- Ouverture et fermeture de caisse (session de caisse).
- Retour d'**une seule ligne** d'une facture (aujourd'hui, seule la facture entière peut être annulée).
- Conversion automatique grammes ↔ kilos.

*Darija : هادو مازال ما تصاوبوش، قول لينا واش محتاجهم بزاف.*
