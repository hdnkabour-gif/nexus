# Fiche d'essai — Gestion pneus (code d'essai PILOT-PM-01)
Lisez d'abord les [règles communes](_COMMON_fr.md). Application testée : version `ea55329f`. Scénarios détaillés : docs/33 §3.

## A. À tester (données fictives)
| # | Action | Résultat attendu | ✅/❌/❓ |
|---|---|---|---|
| 1 | Se connecter avec chaque compte de test (propriétaire, responsable, vendeur, magasinier) | chaque compte voit seulement ses pages. Le propriétaire doit saisir un code à 6 chiffres | |
| 2 | Vendeur du Magasin 01 : essayer d'ouvrir le stock du Magasin 02 | accès refusé | |
| 3 | Dépôt : envoyer 8 pneus au Magasin 01 ; le Magasin 01 en reçoit 7 avec le motif « 1 endommagé » | dépôt −8, magasin +7, l'écart de 1 est noté avec son motif | |
| 4 | Vendre 4 pneus à 650 DH TTC, en espèces | total 2 600,00 DH (HT 2 166,67 + TVA 433,33), stock −4 au Magasin 01 seulement | |
| 5 | Remise de 7 % par un vendeur | une demande d'approbation part au propriétaire ; la vente attend sa décision | |
| 6 | Vente de 2 600 DH : 1 000 espèces + 600 carte + 400 chèque, reste 600 à crédit (plafond du client : 500) | crédit refusé sans l'accord du propriétaire | |
| 7 | Vendre 2 pièces à 120 DH, payer 100 DH, puis retourner 1 pièce | vente nette 120 DH ; caisse 100 DH ; le client doit encore 20 DH ; 1 seule pièce sortie du stock | |
| 8 | Vendre 4,5 L d'huile au fût avec une vidange | le fût diminue de 4,5 L ; une vente de bidon ne touche pas le fût | |
| 9 | Pneu d'occasion avec une hernie | bloqué à la vente | |
| 10 | Caisse : fond 500 + espèces 1 200 − dépense 150 | attendu 1 550,00 ; après clôture, la journée est verrouillée | |
| 11 | Essayer de modifier une facture validée | refusé : on corrige seulement par un avoir | |

## B. Pas encore prêt — ne pas tester comme résultat final
- Deux encaissements au même moment pendant la clôture de caisse, et deux ventes à crédit simultanées (corrections en cours : #17, #18, #19).
- Le format définitif du numéro de facture (à confirmer avec vous et votre comptable : #13).
- La mise en service avec vos vraies données (#14, #20) : **interdit pour l'instant**.

*Darija : هاد الحوايج مازال كنخدمو عليهم، ما تعتمدش عليهم دابا.*
