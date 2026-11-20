# Fiche d'essai — Boutique de vêtements (code d'essai PILOT-AM-01)
Lisez d'abord les [règles communes](_COMMON_fr.md). Application testée : AMANZINE, version `4ff08a99`.
**Livraison et paiement en mode test uniquement : aucune vraie commande, aucun vrai colis, aucun vrai paiement.**

## A. À tester
| # | Action | Résultat attendu | ✅/❌/❓ |
|---|---|---|---|
| 1 | Ajouter 5 vêtements fictifs avec photos, tailles et couleurs | produits visibles avec leurs photos | |
| 2 | Passer une commande et appuyer deux fois sur « Commander » | une seule commande | |
| 3 | 3 articles × 129,90 − bon de réduction de 10 % + livraison 35,00 | 385,73 DH partout (écran, commande, paiement) | |
| 4 | Commander sur téléphone, en darija puis en français | commande terminée ; textes clairs | |
| 5 | Suivre la commande avec le code de suivi | statut affiché, sans les commandes d'autres clients | |

## B. Pas encore prêt — à décider avant l'essai réel
- **Stock par taille et par couleur** (ex. T-shirt M noir = 3, L blanc = 0) : n'existe pas encore. Aujourd'hui, il y a un seul stock par produit.
- **Retours et échanges de taille** (avec remise en stock et remboursement) : non vérifiés, à considérer comme non disponibles.
- Deux commandes pour la dernière pièce, et l'annulation d'une commande déjà approuvée : risque d'erreur de stock à corriger (docs/33 AM-S04/S05).
- Paiement à la livraison et règlement du transporteur : non vérifiés.

*Darija : قبل ما تبيعي بصح، خاصنا نزيدو الستوك على حساب المقاس واللون، والرجوع ديال السلعة.*
