# Fiche d'essai — Location de voitures (code d'essai PILOT-RC-01)
Lisez d'abord les [règles communes](_COMMON_fr.md). Application testée : version `781ab813`. Scénarios détaillés : docs/33 §4.
**Uniquement des véhicules, clients et documents fictifs (« SPECIMEN »). Jamais de vraie CIN ni de vrai permis.**

## A. À tester
| # | Action | Résultat attendu | ✅/❌/❓ |
|---|---|---|---|
| 1 | Un employé de l'agence A essaie de voir une voiture de l'agence B | refusé | |
| 2 | Réserver TEST-01-A du 10/12 10h au 13/12 10h, puis une 2e réservation à partir du 12/12 | la 1re dure 3 jours ; la 2e est refusée ; une réservation à partir du 13/12 10h est acceptée | |
| 3 | Départ : km 45 000, carburant 3/4, 4 photos ; retour avec km 44 900 | le kilométrage inférieur est refusé | |
| 4 | Location 3 × 400 = 1 200 DH ; caution 5 000 DH ; payer 700 puis 600 | le 2e paiement est refusé (dépassement) | |
| 5 | Rendre la caution : par un employé, puis par le gérant | refusé pour l'employé, accepté pour le gérant | |
| 6 | Retour avec 2 h de retard | l'employé enregistre le retour ; c'est le gérant qui décide des frais | |
| 7 | Lien d'accueil client : 5 codes faux, puis lien expiré | bloqué ; le lien expiré est refusé | |
| 8 | Lecture automatique (OCR) d'une carte SPECIMEN floue | message « reprendre la photo », sans valeur devinée | |
| 9 | Un employé essaie de valider un résultat OCR | refusé : seul le gérant valide | |
| 10 | Envoyer un fichier .jpg qui est en réalité un PDF, ou un fichier vide | refusé | |
| 11 | Utiliser toute l'application sur téléphone, en arabe puis en français | pas de défilement horizontal, textes compréhensibles | |

## B. Pas encore prêt
- Rembourser **une partie** d'une pénalité de retard déjà payée (ex. location 100 + pénalité 20, puis annulation de la pénalité) : correction en cours (#26).
- L'utilisation avec de vraies données : le serveur en ligne est **une démonstration** ; les vraies données sont prévues sur l'ordinateur de l'agence (décisions D-012 et D-030), après la sauvegarde vérifiée (#14) et l'audit (#22).

*Darija : الصفحة اللي عندك دابا غير للتجربة، ما تدخلش فيها معلومات الكليان الحقيقيين.*
