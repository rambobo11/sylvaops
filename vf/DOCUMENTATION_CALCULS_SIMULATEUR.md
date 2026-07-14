# Documentation du calculateur — Démonstrateur SylvaOps / GreenOps

Projet M1 MCSI · SylvaOps Consulting · Cas SNCF Connect & Tech
Document de référence méthodologique du simulateur FinOps & Green IT (`index.html`).
**Dernière mise à jour :** juillet 2026 — site déployé sur Vercel (`sylvaops.vercel.app`), ROI cible **18 mois**, bascule **FR/EN**, preset CDC au chargement.

---

## État du site — prêt pour la soutenance

| Critère | Statut |
|---------|--------|
| Vitrine complète (problématique, piliers, méthode, conformité, témoignages) | ✅ |
| Simulateur temps réel + traçabilité + fourchettes ± | ✅ |
| 4 presets (CDC, business, SNCF, réinitialiser à 0) | ✅ |
| Synthèse + impression PDF (1–2 pages) | ✅ |
| Modale contact + consentement RGPD | ✅ |
| Mode sombre + **bascule FR/EN** (persistance `localStorage`) | ✅ |
| Déploiement GitHub → Vercel (HTTPS) | ✅ |
| Documentation + PDFs d'architecture à jour | ✅ (ce dossier `vf/`) |

---

## 1. Objectif du calculateur

Le simulateur est un **outil d'aide à la décision** (preuve de concept) qui estime, à partir de paramètres d'infrastructure Cloud :

1. l'**économie financière** générée par une démarche GreenOps (€/mois et €/an) ;
2. l'**énergie économisée** (kWh/mois) et les **émissions de CO₂ évitées** (kg CO₂/mois), côté cloud **et** parc matériel sur site ;
3. le **retour sur investissement net** (ROI en mois) et la **VAN** (valeur actuelle nette sur 3 ans) ;
4. des **recommandations** et une **synthèse décisionnelle imprimable**.

Tous les résultats sont recalculés **en temps réel** à chaque modification d'un paramètre (événements `input` et `change` sur chaque champ). Aucune donnée n'est envoyée à un serveur : 100 % du calcul s'exécute dans le navigateur (application 100 % côté client).

> Ce document est la **documentation de référence complète** du site : glossaire (§10), technologies (§11), architecture (§12), fonctionnalités (§13), déploiement (§14) et préparation à la soutenance (§15) — en plus de la logique de calcul détaillée (§2 à §9).

---

## 2. Paramètres d'entrée

| # | Paramètre | Identifiant | Type | Unité | Plage | Valeur par défaut |
|---|-----------|-------------|------|-------|-------|-------------------|
| 1 | Budget Cloud mensuel global | `budget` | Nombre | € | ≥ 0 | 50 000 |
| 2 | Part environnements Hors-Production | `horsProd` | Slider | % | 0 – 100 | 40 |
| 3 | Nombre d'environnements non-prod | `envCount` | Slider | unité | 0 – 50 | 12 |
| 4 | Heures d'extinction / semaine | `extinction` | Slider | h | 0 – 168 | 84 |
| 5 | Rightsizing instances hors-prod | `rightsizing` | Slider | % | 0 – 50 | 0 |
| 6 | Optimisation stockage | `stockage` | Slider | % | 0 – 20 | 0 |
| 7 | Réduction logs & monitoring | `logs` | Slider | % | 0 – 15 | 0 |
| 8 | Part compute du budget *(avancé)* | `computePct` | Slider | % | 0 – 100 | 60 |
| 9 | Part stockage du budget *(avancé)* | `storagePct` | Slider | % | 0 – 100 | 30 |
| 10 | Localisation datacenter | `datacenter` | Liste | — | France / Europe / Monde | France |
| 11 | PUE du datacenter | `pue` | Slider | ratio | 1,0 – 2,0 (pas 0,1) | 1,2 |
| 12 | Électricité du site *(avancé)* | `siteLocation` | Liste | — | France / Europe / Monde | France |
| 13 | Investissement projet | `investissement` | Nombre | € | ≥ 0 | 0 |
| 14 | Coût récurrent mensuel *(avancé)* | `recurringCost` | Nombre | €/mois | ≥ 0 | 0 |

> **Décomposition du budget :** le budget cloud est réparti en **compute / stockage / réseau** (réseau = 100 − compute − stockage). Chaque levier agit sur son vrai sous-budget : l'extinction et le rightsizing sur le compute, le stockage sur la part stockage, les logs sur stockage + réseau. Cela remplace l'ancien « part compute planifiable » et corrige la surestimation des leviers appliqués au budget total.

> **Mode simple / détaillé :** les paramètres *(avancé)* (décomposition budget, électricité du site, coût récurrent) ne sont visibles qu'en **mode détaillé**.

> **Note technique :** le slider PUE stocke une valeur entière de 10 à 20 (÷ 10 → 1,0 à 2,0).

> **`envCount` est désormais utilisé** : il alimente l'indicateur « économie par environnement » (Éco_totale / envCount) affiché dans le détail et le rapport.

---

## 3. Constantes et sources

| Constante | Valeur | Source / justification |
|-----------|--------|------------------------|
| Facteur d'émission — **France** | 0,05 kg CO₂/kWh | Mix électrique décarboné (nucléaire + renouvelables) — RTE / ADEME |
| Facteur d'émission — **Europe** | 0,23 kg CO₂/kWh | Moyenne du mix électrique européen — ADEME / AIE |
| Facteur d'émission — **Monde** | 0,35 kg CO₂/kWh | Moyenne mondiale, mix plus carboné — AIE |
| **PUE** (défaut) | 1,2 | Power Usage Effectiveness d'un data center efficient — Uptime Institute (fourchette 1,1 – 1,3) |
| **Prix moyen vCPU-heure** | 0,045 € | Prix on-demand moyen (usage général) — grilles AWS/Azure/GCP. Sert à convertir les € compute en vCPU-heures. |
| **Puissance par vCPU** | 12 W IT | Puissance serveur moyenne rapportée à une vCPU (hors PUE) — méthode Cloud Carbon Footprint / Boavizta. |
| **Taux d'actualisation** | 8 %/an | Hypothèse financière pour la VAN (valeur actuelle nette) sur 3 ans. |
| Croissance des coûts Cloud | +15 à 20 %/an | Flexera — State of the Cloud Report 2024 |
| Empreinte numérique mondiale | ~4 % des GES | Contexte général (ADEME, The Shift Project) |

---

## 4. Formules détaillées (dans l'ordre du calcul)

Notations : `B` = budget, `%HP` = part hors-prod, `H` = heures d'extinction, `%RS/%ST/%LG` = pourcentages rightsizing/stockage/logs, `PUE`, `Cₑ` = coût énergétique, `Fg` = facteur grid, `I` = investissement.

### Étape 1 — Décomposition du budget
```
Budget_compute = B × (%compute / 100)
Budget_storage = B × (%stockage / 100)
Budget_network = B × ((100 − %compute − %stockage) / 100)
```
La facture est répartie par type de ressource. Seul le compute est éteignable.

### Étape 2 — Facteur d'extinction
```
Facteur_extinction = H / 168
```
168 = heures dans une semaine (24 × 7). Proportion de temps où le compute hors-prod est éteint.

### Étape 3 — Économie liée à l'extinction automatique
```
Budget_compute_HP = Budget_compute × (%HP / 100)
Éco_extinction    = Budget_compute_HP × Facteur_extinction
```
L'extinction n'agit que sur le **compute hors-production** : le stockage, les IP, les licences restent facturés même éteints.

### Étape 4 — Économie liée au rightsizing
```
Budget_compute_HP_restant = Budget_compute_HP − Éco_extinction
Éco_rightsizing           = Budget_compute_HP_restant × (%RS / 100)
```
Appliqué en cascade sur le compute resté allumé.

### Étape 5 — Économies stockage et logs (sur leurs sous-budgets)
```
Éco_stockage = Budget_storage × (%ST / 100)
Éco_logs     = (Budget_storage + Budget_network) × (%LG / 100)
```
Chaque levier agit sur son périmètre réel, plus sur le budget total (correctif de réalisme).

### Étape 6 — Économie totale et économie par environnement
```
Éco_optimisation = Éco_rightsizing + Éco_stockage + Éco_logs
Éco_totale        = Éco_extinction + Éco_optimisation      (€/mois)
Éco_par_env       = Éco_totale / envCount
```

### Étape 7 — Énergie via les vCPU-heures (méthode Cloud Carbon Footprint)
```
Éco_compute     = Éco_extinction + Éco_rightsizing
vCPU-heures     = Éco_compute / Prix_vCPU_h        (Prix_vCPU_h = 0,045 €)
Énergie (kWh)   = vCPU-heures × W_vCPU / 1000       (W_vCPU = 12 W)
```
Le carbone cloud n'est **plus dérivé des euros** (ancien proxy €→kWh) mais de l'usage compute réel. Seules les économies compute génèrent de l'énergie évitée (le stockage/logs économisent de l'argent, peu d'énergie opérationnelle).

### Étape 8 — Émissions de CO₂ évitées (norme SCI)
```
CO₂ = Énergie × PUE × Fg         (kg CO₂/mois)
```
SCI (Software Carbon Intensity) / ISO 21031 : énergie × PUE × facteur d'émission réseau.

### Étape 9 — Économie annuelle et taux de réduction
```
Éco_annuelle       = Éco_totale × 12            (€/an)
Réduction_facture  = Éco_totale / Budget × 100  (%)
```

### Étape 10 — ROI net et VAN (valeur actuelle nette)
```
Éco_nette = Éco_totale − Coût_récurrent
ROI (mois) = I / Éco_nette                       (si I > 0 et Éco_nette > 0, sinon « Instantané » / « Non rentable »)
r_mensuel  = (1 + 8 %)^(1/12) − 1
VAN 3 ans  = −I + Σ (t=1..36) Éco_nette / (1 + r_mensuel)^t
```
Le ROI est calculé sur l'économie **nette** (après coûts récurrents d'outillage/licences), et la VAN actualise les flux sur 3 ans.

---

## 4 bis. Module « Parc matériel sur site & durée de vie » (extension Green IT)

Ce module élargit l'analyse au-delà du Cloud pour intégrer les **équipements physiques** (postes de travail, serveurs on-premise) et surtout le **carbone de fabrication** (embodied carbon), souvent le poste dominant de l'empreinte IT. Il dépasse le périmètre strict du CDC (Cloud) et relève d'une approche Green IT globale — à assumer comme une perspective d'élargissement.

### Paramètres additionnels

| Paramètre | Identifiant | Unité | Défaut | Source |
|-----------|-------------|-------|--------|--------|
| Nombre de postes de travail | `nbPostes` | unité | 1 200 | Contexte client |
| Consommation par poste | `consoPoste` | kWh/an | 120 | ADEME (~120 fixe, ~40 portable) |
| Réduction usage postes (veille/extinction) | `reductionPostes` | % | 20 | Levier |
| Nombre de serveurs on-premise | `nbServeurs` | unité | 50 | Contexte client |
| Consommation par serveur | `consoServeur` | kWh/an | 4 000 | ~3 000–7 000 kWh/an |
| Réduction usage serveurs (consolidation) | `reductionServeurs` | % | 15 | Levier |
| Empreinte fabrication / poste | `empreintePoste` | kg CO₂e | 200 | ADEME (fabrication ≈ 75 %) |
| Empreinte fabrication / serveur | `empreinteServeur` | kg CO₂e | 1 500 | LCA constructeurs |
| Durée de vie actuelle | `dureeActuelle` | ans | 4 | Standard renouvellement |
| Durée de vie cible | `dureeCible` | ans | 6 | Levier d'allongement |

### Formules

**Énergie du parc évitée (phase d'usage)**
```
Énergie_postes_évitée   = Nb_postes × conso_poste × (%réduction_postes / 100)
Énergie_serveurs_évitée = Nb_serveurs × conso_serveur × (%réduction_serveurs / 100)
Énergie_parc_évitée     = Énergie_postes_évitée + Énergie_serveurs_évitée   (kWh/an)
```

**CO₂ usage évité** — `Fg_site` = facteur d'émission du **lieu des équipements** (paramètre `siteLocation`, indépendant de la région Cloud).
```
CO₂_postes   = Énergie_postes_évitée × Fg_site           (les postes ne sont pas en datacenter → pas de PUE)
CO₂_serveurs = Énergie_serveurs_évitée × PUE × Fg_site   (salle serveur → PUE appliqué)
CO₂_parc_usage = CO₂_postes + CO₂_serveurs               (kg CO₂/an)
```

**CO₂ de fabrication évité (levier durée de vie) — le cœur du module**
```
CO₂_fabrication = (Nb_postes × Empreinte_poste + Nb_serveurs × Empreinte_serveur)
                  × (1/durée_actuelle − 1/durée_cible)                          (kg CO₂/an)
```
Principe : le carbone de fabrication est **amorti** sur la durée de vie. Allonger la durée de vie diminue la part annualisée. Exemple : passer de 4 à 6 ans réduit l'amortissement annuel de `(1/4 − 1/6) = 0,0833` par unité d'empreinte.

**Agrégation**
```
CO₂_parc_annuel  = CO₂_parc_usage + CO₂_fabrication            (kg CO₂/an)
CO₂_cloud_annuel = CO₂_cloud_mensuel × 12                       (kg CO₂/an)
Empreinte_totale_évitée = CO₂_cloud_annuel + CO₂_parc_annuel    (kg CO₂/an)
```

### Exemple chiffré (valeurs par défaut)

| Étape | Calcul | Résultat |
|-------|--------|----------|
| Énergie postes évitée | 1 200 × 120 × 0,20 | 28 800 kWh/an |
| Énergie serveurs évitée | 50 × 4 000 × 0,15 | 30 000 kWh/an |
| **Énergie parc évitée** | | **58 800 kWh/an** |
| CO₂ postes usage | 28 800 × 0,05 | 1 440 kg |
| CO₂ serveurs usage | 30 000 × 1,2 × 0,05 | 1 800 kg |
| CO₂ usage évité | | 3 240 kg/an |
| CO₂ fabrication évité | (1 200×200 + 50×1 500) × (1/4 − 1/6) | **26 250 kg/an** |
| **Total parc évité** | 3 240 + 26 250 | **29 490 kg CO₂/an** |
| CO₂ Cloud annuel (preset CDC, méthode vCPU) | 96 × 12 | ≈ 1 152 kg/an |
| **Empreinte totale évitée** | 1 152 + 29 490 | **≈ 30 642 kg CO₂/an (~31 t)** |

> Enseignement clé (renforcé par la méthode vCPU) : le **carbone de fabrication (26 250 kg)** pèse **très largement** plus que l'usage cloud opérationnel (~1 152 kg). Autrement dit, pour ce client, l'impact carbone est dominé par le **matériel**, pas par le cloud — l'allongement de la durée de vie est le levier n°1 du Green IT.

---

## 5. Exemples chiffrés (les 2 presets de démonstration)

### Preset A — « Cas référence (CDC) »
Paramètres : B = 50 000 €, compute 60 % / stockage 30 % / réseau 10 %, %HP = 40 %, H = 84 h, %RS/%ST/%LG = 0, France (Fg = 0,05), PUE = 1,2, I = **108 000 €**, coût récurrent = 0.

| Étape | Calcul | Résultat |
|-------|--------|----------|
| Budget compute / stockage / réseau | 60/30/10 % | 30 000 / 15 000 / 5 000 € |
| Budget compute HP | 30 000 × 0,40 | 12 000 € |
| Éco_extinction | 12 000 × 0,50 | **6 000 €/mois** |
| **Éco_totale** | 6 000 + 0 | **6 000 €/mois** (12 % du budget) |
| Éco_annuelle | 6 000 × 12 | 72 000 €/an |
| vCPU-heures évitées | 6 000 / 0,045 | ≈ 133 333 h/mois |
| Énergie | 133 333 × 12 / 1000 | ≈ 1 600 kWh/mois |
| **CO₂ cloud** | 1 600 × 1,2 × 0,05 | **≈ 96 kg CO₂/mois** |
| ROI net | 108 000 / 6 000 | **18 mois** |
| VAN 3 ans | taux 8 %/an | ≈ **+84 260 €** |

### Preset B — « Cas business réaliste »
Paramètres : B = 50 000 €, compute 60 % / stockage 30 %, %HP = 40 %, H = 52 h, RS = 10 %, ST = 5 %, LG = 3 %, France, I = **91 700 €**, coût récurrent = 800 €/mois.

| Étape | Calcul | Résultat |
|-------|--------|----------|
| Budget compute HP | 30 000 × 0,40 | 12 000 € |
| Éco_extinction | 12 000 × (52/168) | ≈ 3 714 €/mois |
| Éco_optimisation | rightsizing + stockage + logs | ≈ 2 179 €/mois |
| **Éco_totale** | | **≈ 5 893 €/mois** (~11,8 % du budget) |
| Éco_annuelle | × 12 | **≈ 70 700 €/an** |
| **CO₂ cloud** | méthode vCPU | **≈ 73 kg CO₂/mois** |
| Éco nette | 5 893 − 800 | ≈ 5 093 €/mois |
| ROI net | 91 700 / 5 093 | **≈ 18 mois** |
| VAN 3 ans | taux 8 %/an | ≈ **+71 500 €** |

### Preset C — « Démo SNCF Connect & Tech » (données publiques)

Scénario **illustratif** à partir de données publiques (voir sources en fin de doc). Le budget cloud n'est **pas public** ; il est **posé en hypothèse** (~200 k€/mois) pour refléter la taille d'un grand compte cloud (×4 le cas CDC à 50 k€).

**Ancrage public :** bilan carbone 2023 ≈ **11 000 t CO₂e**, dont **cloud AWS ≈ 7–8 %** ≈ **800 t CO₂e/an**.

Paramètres : budget **200 000 €/mois** (hypothèse), compute 60 % / stockage 30 %, hors-prod 40 %, extinction 60 h/sem, rightsizing 10 %, stockage 3 %, logs 2 %, datacenter **Europe** (0,23), PUE 1,2, I = **398 000 €**, coût récurrent = 1 500 €/mois. Parc : 1 200 postes, 15 serveurs.

| Étape | Calcul | Résultat |
|-------|--------|----------|
| Budget compute HP | 120 000 × 0,40 | 48 000 € |
| Éco_extinction | 48 000 × (60/168) | ≈ 17 143 €/mois |
| Éco_optimisation | rightsizing + stockage + logs | ≈ 6 486 €/mois |
| **Éco_totale** | | **≈ 23 629 €/mois** (~11,8 % du budget) |
| Éco_annuelle | × 12 | **≈ 283 500 €/an** |
| **CO₂ cloud évité** | méthode vCPU (Europe 0,23) | **≈ 17,9 t CO₂e/an** |
| CO₂ parc évité | usage + fabrication amortie | ≈ 23,9 t CO₂e/an |
| **Empreinte totale évitée** | cloud + parc | **≈ 41,7 t CO₂e/an** |
| Éco nette | 23 629 − 1 500 | ≈ 22 129 €/mois |
| ROI net | 398 000 / 22 129 | **≈ 18 mois** |
| VAN 3 ans | taux 8 %/an | ≈ **+311 000 €** |

> **Carbone cloud volontairement conservateur :** la méthode vCPU-heures donne une empreinte opérationnelle évitée (~18 t/an) bien plus faible que l'ancien proxy. C'est une **fraction** des ~800 t publiées par AWS (périmètre plus large : mémoire, stockage, réseau, méthodologie AWS). On présente donc un chiffre défendable et prudent, pas un chiffre gonflé.

> **Posture démo :** SNCF Connect & Tech pratique **déjà** l'extinction des environnements de dev et dispose d'un tableau de bord FinOps + CO₂ (label Numérique Responsable niveau 2). SylvaOps se présente en **complément** : benchmark externe, gouvernance, extension du périmètre, objectivation de l'avant-vente — **jamais** comme si rien n'existait. Chiffres **à valider avec le client**.

---

## 6. Modalités de calcul et logique applicative

- **Temps réel :** chaque paramètre déclenche `calculate()` ; l'affichage des KPI est rafraîchi via `requestAnimationFrame` avec une transition d'opacité.
- **Détail de traçabilité :** un encart affiche chaque étape intermédiaire (Budget_HP, facteur, gains, total, énergie, CO₂) pour rendre le calcul vérifiable.
- **Recommandations dynamiques :** 4 cartes sont générées, une par levier (extinction, rightsizing, stockage, logs), avec le gain € associé. Les leviers à 0 apparaissent grisés.
- **Rapport de synthèse :** le bouton « Générer la synthèse » produit un paragraphe décisionnel reprenant tous les résultats et la localisation/PUE ; impression PDF possible.
- **Presets :** quatre boutons — **Cas référence (CDC)**, **Cas business réaliste**, **Démo SNCF**, **Réinitialiser** (remet **tous** les paramètres numériques à **0**). Le preset **CDC est appliqué automatiquement au chargement** de la page (ROI 18 mois affiché dès l'ouverture du simulateur).

---

## 7. Hypothèses et limites (à assumer en soutenance)

1. **Estimation, pas mesure.** Les résultats reposent sur des hypothèses paramétrables. Un audit réel des ressources (via CloudWatch, Azure Monitor, GCP Monitoring) est nécessaire pour un chiffrage définitif.
2. **Modèle linéaire.** Les gains sont modélisés linéairement ; en réalité, les rendements peuvent être dégressifs.
3. **Périmètre.** L'extinction ne concerne que les environnements Dev/Test ; la production reste disponible 24/7 (aucun impact sur la qualité de service).
4. **Facteurs d'émission moyens.** Les facteurs grid sont des moyennes ; un chiffrage précis utiliserait les données horaires réelles du mix électrique.
5. **Carbone cloud conservateur.** La méthode vCPU-heures ne couvre que l'usage compute évité ; le stockage/logs génèrent surtout des économies financières.

---

## 7 bis. Fourchettes d'incertitude sur les KPI

Pour éviter une **fausse impression de précision**, chaque KPI est affiché avec une **plage** (min – max) plutôt qu'un chiffre unique. Les marges sont **différenciées** selon la fiabilité de la donnée sous-jacente :

| KPI | Marge | Justification |
|-----|-------|---------------|
| Économie financière (€/mois, €/an) | **± 15 %** | Basée sur la facture cloud réelle → donnée la plus fiable |
| Carbone cloud (kg CO₂/mois) | **± 50 %** | Coefficients vCPU (prix €/vCPU-h, W/vCPU) incertains → marge élargie assumée |
| Carbone parc sur site | **± 25 %** | Données moyennes ADEME/Boavizta, pas l'inventaire réel |

```
Borne_basse = Valeur × (1 − marge)
Borne_haute = Valeur × (1 + marge)
ROI_fourchette : ROI_meilleur = I / (Éco_nette × 1,15) ; ROI_pire = I / (Éco_nette × 0,85)
CO₂_total_fourchette : somme des bornes cloud (± 50 %) et parc (± 25 %)
```

> Message de soutenance : « Nous affichons des fourchettes, pas des chiffres exacts, car un POC en avant-vente donne des **ordres de grandeur**. La marge la plus large est sur le carbone cloud (± 50 %), car les coefficients vCPU→énergie sont eux-mêmes incertains — c'est plus honnête qu'un chiffre unique. »

---

## 8. Correspondance avec le cahier des charges (CDC §9.6)

| Exigence fonctionnelle CDC | Couverture par le calculateur |
|----------------------------|-------------------------------|
| Simuler plusieurs scénarios d'optimisation | ✅ paramètres + presets |
| Estimer les économies financières | ✅ €/mois, €/an |
| Estimer les émissions de CO₂ évitées | ✅ kg CO₂/mois (norme SCI) |
| Calculer le ROI | ✅ mois |
| Générer des recommandations | ✅ 4 cartes dynamiques |
| Produire des KPI | ✅ KPI temps réel |
| Fournir un rapport décisionnel | ✅ synthèse imprimable |
| Transparence de la méthodologie | ✅ détail + note méthodologique + sources |

---

## 9. Sources (scénario SNCF Connect & Tech)

- **Le Monde Informatique** — *SNCF Connect & Tech tisse sa stratégie numérique responsable à l'heure du cloud et de l'IA* : bilan carbone 2023 ≈ 11 000 t CO₂e, cloud AWS ≈ 7–8 %, dashboard FinOps + CO₂.
  https://www.lemondeinformatique.fr/actualites/lireamp-sncf-connect-et-tech-tisse-sa-strategie-numerique-responsable-a-l-heure-du-cloud-et-de-l-ia-97522.html
- **Silicon.fr** — *SNCF Connect & Tech détaille sa recette d'écoconception web* : autoscaling, extinction automatique des environnements de dev hors heures de travail.
  https://www.silicon.fr/green-it-1374/sncf-connect-tech-ecoconception-224599
- **Futura Sciences** — *Numérique responsable : la voie tracée par SNCF Connect & Tech* : 27 M utilisateurs, label Numérique Responsable niveau 2, objectif RGESN.
  https://www.futura-sciences.com/tech/actualites/technologie-numerique-responsable-voie-tracee-sncf-connect-tech-126629/
- **groupe-sncf.com** — résultats financiers annuels 2024/2025 : CA ~43 Md€, 284 000 collaborateurs.
  https://www.groupe-sncf.com/medias-publics/2026-02/cp-resultats-financiers-annuels-2025-groupe-sncf.pdf

> ⚠️ Le budget cloud (~200 k€/mois) et le parc sur site sont des **hypothèses posées**, non des données publiées. À valider avec le client avant tout usage réel.

---

## 10. Glossaire des acronymes et termes clés

À connaître par cœur pour la soutenance.

### Domaines & concepts

| Terme | Signification | Explication simple |
|-------|---------------|--------------------|
| **FinOps** | *Financial Operations* | Discipline de gestion et d'optimisation **financière** du Cloud : rendre visible et maîtriser la dépense cloud, éliminer le gaspillage. |
| **Green IT** | *Green Information Technology* | Démarche visant à réduire l'**impact environnemental** du numérique (énergie, CO₂, matériel). |
| **GreenOps** | *Green Operations* | Fusion FinOps + Green IT : optimiser **coûts ET carbone** dans une même démarche opérationnelle. C'est le positionnement de SylvaOps. |
| **POC** | *Proof of Concept* (preuve de concept) | Prototype qui démontre la faisabilité et la valeur d'une idée, sans être un produit fini. Le simulateur en est un. |
| **KPI** | *Key Performance Indicator* | Indicateur clé de performance : un chiffre-repère (ex. €/mois économisés). |
| **ROI** | *Return On Investment* (retour sur investissement) | Temps nécessaire pour que les économies remboursent l'investissement initial. Ici en **mois**. |
| **VAN** | Valeur Actuelle Nette (*NPV* en anglais) | Somme des gains futurs **actualisés** (ramenés à leur valeur d'aujourd'hui) moins l'investissement. VAN > 0 = projet rentable. |
| **Hors-prod / Non-prod** | Environnements de non-production | Environnements de **développement, test, recette** — par opposition à la **production** (le service réellement utilisé par les clients). Ils peuvent être éteints la nuit/week-end. |
| **Rightsizing** | Dimensionnement juste | Ajuster la taille des ressources cloud à leur usage réel (arrêter de surpayer des machines surdimensionnées). |
| **Embodied carbon** | Carbone de fabrication (incorporé) | CO₂ émis pour **fabriquer** un équipement (extraction, production, transport), amorti sur sa durée de vie — indépendant de son usage. |

### Technique cloud & énergie

| Terme | Signification | Explication simple |
|-------|---------------|--------------------|
| **vCPU** | *virtual CPU* (processeur virtuel) | Unité de calcul cloud = une fraction d'un cœur physique louée à l'heure. |
| **vCPU-heure** | — | Une vCPU utilisée pendant une heure. Unité de base pour estimer énergie et coût du compute. |
| **Compute** | Ressources de calcul | La partie « processeur » de la facture cloud (machines/instances), par opposition au stockage et au réseau. |
| **PUE** | *Power Usage Effectiveness* | Efficacité énergétique d'un data center = énergie totale ÷ énergie IT utile. 1,0 = parfait ; 1,2 = efficient ; 2,0 = médiocre. |
| **Facteur d'émission (grid factor)** | — | Quantité de CO₂ émise par kWh d'électricité, selon le mix électrique du pays (France 0,05 · Europe 0,23 · Monde 0,35 kg CO₂/kWh). |
| **SCI** | *Software Carbon Intensity* (ISO 21031) | Norme de mesure de l'empreinte carbone d'un logiciel : énergie × PUE × facteur d'émission. |
| **Cloud Carbon Footprint** | — | Méthodologie/outil open source de référence pour estimer le carbone du cloud à partir de l'usage (vCPU, mémoire…). |
| **Boavizta** | — | Association fournissant des données ouvertes sur l'empreinte environnementale du matériel numérique. |

### Normes, réglementations & organismes

| Terme | Signification | Explication simple |
|-------|---------------|--------------------|
| **RGPD** | Règlement Général sur la Protection des Données | Loi européenne sur les données personnelles. Ici : consentement explicite avant tout contact. |
| **Loi REEN** | Réduction de l'Empreinte Environnementale du Numérique (2021) | Loi française poussant les organisations vers un numérique plus sobre. |
| **CSRD** | *Corporate Sustainability Reporting Directive* | Directive européenne imposant aux entreprises un **reporting extra-financier** (dont l'empreinte carbone). |
| **RGESN** | Référentiel Général d'Écoconception de Services Numériques | Référentiel officiel de bonnes pratiques d'écoconception web. |
| **ADEME** | Agence de la transition écologique | Source française des facteurs d'émission carbone. |
| **RTE** | Réseau de Transport d'Électricité | Gestionnaire du réseau électrique français (données sur le mix électrique). |
| **AIE** | Agence Internationale de l'Énergie | Source des moyennes d'émission mondiales. |
| **Numérique Responsable (niveau 2)** | Label — | Label attestant d'une démarche structurée de numérique responsable (obtenu par SNCF Connect & Tech). |
| **MCSI** | Master Conception et Sécurité des Infrastructures (contexte académique) | Le cadre du projet M1. |

---

## 11. Technologies utilisées et choix techniques

### Stack technique

| Techno | Rôle dans le projet | Pourquoi ce choix |
|--------|---------------------|-------------------|
| **HTML5** | Structure sémantique (`<header>`, `<section>`, `<nav>`, rôles ARIA). | Standard, accessible, référençable. |
| **CSS3** | Mise en forme, thème, animations, responsive, styles d'impression. | Puissant sans dépendance externe. |
| **JavaScript « vanilla » (ES5/ES6)** | Toute l'interactivité et les calculs. | **Aucun framework** : rien à installer, un seul fichier, chargement instantané, pérenne. |
| **Git + GitHub** | Versionnement du code et hébergement du dépôt. | Historique, collaboration, source de déploiement. |
| **Vercel** | Hébergement et déploiement continu du site. | Déploiement automatique à chaque `git push`, HTTPS, URL publique gratuite. |

### Points techniques CSS notables

- **Variables CSS (`:root`)** : toutes les couleurs/ombres sont centralisées. Le **mode sombre** ne fait que redéfinir ces variables via `[data-theme="dark"]` → une seule source de vérité.
- **Flexbox & CSS Grid** : mise en page des cartes, grilles de sections, disposition 2 colonnes du simulateur.
- **Media queries** : adaptation responsive (points de rupture 900 px et 640 px) → desktop 2 colonnes, mobile empilé, menu burger.
- **`@media print`** : feuille de style dédiée qui n'imprime que la synthèse (conteneur `#printArea`).
- **Transitions & `@keyframes`** : animations fluides (apparition, mise à jour des KPI).

### Points techniques JavaScript notables

- **Application 100 % côté client (SPA)** : une seule page HTML, navigation gérée en JS (affichage/masquage des « pages »). Aucun serveur, aucune fuite de données.
- **`localStorage`** : mémorise le thème (`sylvaops-theme`) et la langue (`sylvaops-lang`) entre les visites.
- **`window.matchMedia('(prefers-color-scheme: dark)')`** : respecte le thème système au premier chargement.
- **`requestAnimationFrame`** : met à jour les KPI en douceur (animation « updating »).
- **`Intl` via `currentLocale()`** : formatage des nombres en `fr-FR` ou `en-US` selon la langue active.
- **Moteur i18n** : `STR` + `I18N_EN`, attributs `data-i18n` / `data-i18n-node`, fonction `applyLang()` (FR ↔ EN).
- **Écoute d'événements `input`/`change`** sur chaque champ → recalcul temps réel.
- **`window.print()` + événement `afterprint`** : génération PDF navigateur puis nettoyage.

---

## 12. Architecture du site

Le site est une **Single-Page Application (SPA)** : un seul fichier `index.html` contenant deux « pages » virtuelles basculées en JavaScript, sans rechargement.

### Navigation

- Barre de navigation fixe (`header`) avec liens **Accueil** / **Simulateur**, bouton **FR/EN**, bouton **thème** (clair/sombre) et bouton **Audit gratuit**.
- Menu **burger** sur mobile.
- Le logo ramène à l'accueil.

### Page 1 — Vitrine (`#page-accueil`)

Enchaînement de sections (fond alterné blanc / gris clair) :

| Section | Contenu | Rôle |
|---------|---------|------|
| **Hero** | Titre d'accroche + 2 boutons d'appel à l'action + stats (−30 %, ROI **18 mois**, 4 % GES). | Capter l'attention, orienter vers le simulateur. |
| **Problématique** | 3 cartes : inflation des coûts cloud, environnements sous-utilisés, empreinte carbone. | Poser le problème. |
| **4 Piliers** | Performance économique, responsabilité environnementale, excellence opérationnelle, sécurité & conformité. | Structurer la promesse. |
| **À propos** | Présentation du cabinet + expertises (FinOps, Green IT/SCI, automatisation). | Crédibilité. |
| **Valeurs** | Performance mesurable, sobriété, transparence. | Positionnement. |
| **Méthode** | 4 étapes : audit, optimisation, automatisation, gouvernance. | Rassurer sur le « comment ». |
| **Roadmap** | Déroulé de mission progressif. | Concrétiser la mise en œuvre. |
| **Conformité** | Production préservée, RGPD, Loi REEN & CSRD, traçabilité. | Lever les objections. |
| **Secteurs** | Références sectorielles (clients fictifs : ENGIE, RATP, Capgemini). | Preuve sociale. |
| **Témoignages** | Avis clients **fictifs** (mention à assumer). | Preuve sociale. |
| **CTA final** | Bouton vers le simulateur. | Conversion. |

### Page 2 — Simulateur (`#page-simulateur`)

Disposition **2 colonnes** (desktop) :

- **Colonne gauche — Paramètres** : barre de presets, puis champs regroupés (Infrastructure cloud, Automatisation & extinction, Optimisations, Impact environnemental, Parc matériel sur site, Retour sur investissement).
- **Colonne droite — Résultats** : KPI temps réel avec fourchettes, blocs de détail (traçabilité), KPI carbone total (cloud + parc), recommandations dynamiques, boutons **Générer la synthèse** / **Imprimer PDF**, note méthodologique.

### Éléments transverses

- **Modale de contact** (formulaire audit gratuit) avec validation et **case de consentement RGPD**, puis écran de confirmation.
- **Pied de page** (footer).
- **Conteneur d'impression** `#printArea` (invisible à l'écran).

---

## 13. Fonctionnalités détaillées

| Fonctionnalité | Description | Comment ça marche |
|----------------|-------------|-------------------|
| **Navigation SPA** | Basculer Accueil ↔ Simulateur sans rechargement. | JS ajoute/retire la classe `page--active`, remonte en haut de page. |
| **Mode sombre** | Thème clair/sombre, mémorisé. | Bascule l'attribut `data-theme`, redéfinit les variables CSS, stocke le choix dans `localStorage`, échange les logos clairs/sombres. |
| **Calcul temps réel** | Chaque curseur/champ met à jour instantanément tous les résultats. | La fonction `calculate()` est appelée à chaque `input`/`change`. |
| **Curseurs remplis** | La partie « remplie » d'un slider suit sa valeur. | `updateSliderFill()` calcule un pourcentage et colore la piste. |
| **Presets** | 4 boutons : Cas référence (CDC), Cas business réaliste, Démo SNCF, Réinitialiser (tout à **0**). | `applyPreset()` injecte un jeu de valeurs puis recalcule. CDC appliqué au chargement. |
| **Internationalisation (FR/EN)** | Bascule de langue sur toute la vitrine, le simulateur, les KPI, recommandations et synthèse. | `applyLang()` + `localStorage` (`sylvaops-lang`). Formatage nombres/€ selon locale. |
| **Mode simple / détaillé** | Affiche ou masque les paramètres avancés. | Bascule la classe `visible` sur les `.advanced-params`. |
| **Fourchettes d'incertitude** | Chaque KPI affiche une plage ± au lieu d'un faux chiffre exact. | Financier ± 15 %, carbone cloud ± 50 %, carbone parc ± 25 %. |
| **Détail / traçabilité** | Bloc dépliant montrant chaque étape de calcul. | Chaque ligne est mise à jour dans `calculate()`. |
| **Recommandations dynamiques** | Cartes de leviers, activées/grisées selon les gains. | `renderReco()` génère les cartes selon les résultats. |
| **Synthèse décisionnelle** | Rapport texte récapitulatif prêt à présenter. | `genReport()` compose un HTML à partir du dernier résultat. |
| **Impression / PDF** | N'imprime **que** la synthèse (1–2 pages). | Copie la synthèse dans `#printArea`, ajoute la classe `printing`, `window.print()`, nettoyage sur `afterprint`. |
| **Formulaire de contact + RGPD** | Modale d'audit gratuit avec consentement obligatoire. | Validation côté client, écran de succès (aucune donnée envoyée). |
| **Responsive** | Adaptation desktop / tablette / mobile. | Media queries + menu burger. |
| **Accessibilité** | Rôles ARIA, labels, `aria-live` sur la synthèse, navigation clavier. | Attributs sémantiques dans le HTML. |
| **Note SNCF** | Encadré d'hypothèses affiché uniquement pour le preset SNCF. | Bascule l'attribut `hidden`. |

---

## 14. Déploiement (Git → GitHub → Vercel)

Chaîne de publication en continu :

1. **Développement local** : édition de `index.html`.
2. **Versionnement** : `git add` + `git commit` enregistrent chaque changement avec un message.
3. **Publication** : `git push origin main` envoie le code sur **GitHub** (dépôt `rambobo11/sylvaops`).
4. **Déploiement automatique** : **Vercel** est connecté au dépôt GitHub. À chaque `push`, il reconstruit et met en ligne le site sur une **URL publique HTTPS** en quelques secondes.

Avantages : historique complet, retour arrière possible, mise en ligne sans manipulation manuelle, lien partageable avec le jury/les collègues.

---

## 15. Préparation à la soutenance — questions probables & réponses

**Q : Pourquoi pas de framework (React, etc.) ?**
R : Le besoin est un POC léger et pérenne. Le HTML/CSS/JS vanilla en un seul fichier se charge instantanément, ne dépend d'aucune bibliothèque à maintenir, et reste 100 % côté client (aucune donnée envoyée). C'est un choix assumé de sobriété — cohérent avec le sujet Green IT.

**Q : D'où viennent vos chiffres / n'est-ce pas du « bullshit » ?**
R : Chaque résultat est **traçable** (bloc détail), les constantes sont **sourcées** (RTE/ADEME, Uptime Institute, Cloud Carbon Footprint, Boavizta, Flexera), et j'affiche des **fourchettes d'incertitude** plutôt qu'un faux chiffre exact. C'est un outil d'**ordre de grandeur** en avant-vente, pas un audit.

**Q : Pourquoi le carbone cloud est-il si faible face au matériel ?**
R : Parce que la méthode vCPU-heures est rigoureuse et conservatrice : l'usage cloud opérationnel consomme peu par euro. L'enseignement Green IT est justement là — **le carbone de fabrication du matériel domine**, d'où l'importance d'allonger la durée de vie des équipements.

**Q : Pourquoi ± 50 % sur le carbone cloud ?**
R : Il combine plusieurs coefficients incertains (prix €/vCPU-h, watts/vCPU, facteur d'émission, PUE). Multiplier des estimations propage l'erreur. ± 50 % est honnête ; un audit réel resserrerait la fourchette.

**Q : Le carbone affiché, c'est l'empreinte du client ?**
R : Non, c'est le carbone **évité** grâce aux optimisations, pas l'empreinte totale. Tout l'outil raisonne en gains.

**Q : Quelle différence entre FinOps et Green IT ?**
R : FinOps optimise les **coûts**, Green IT optimise l'**impact environnemental**. GreenOps les réunit : souvent, éteindre une ressource inutile fait gagner **argent ET CO₂** en même temps.

**Q : Comment garantissez-vous que la production n'est pas impactée ?**
R : L'extinction ne cible que le **hors-production** (dev/test). La prod reste disponible 24/7. Chaque action est journalisée et réversible.

**Q : Le cas SNCF est-il réel ?**
R : C'est un scénario **illustratif** appuyé sur des données publiques (bilan carbone, part cloud). Le budget cloud est une **hypothèse posée**, à valider avec le client. Les témoignages et clients affichés sont **fictifs**.

**Q : Pourquoi le preset SNCF affiche ~23 k€/mois et les autres ~6 k€ ?**
R : Parce que le budget cloud SNCF est posé à **200 k€/mois** (hypothèse grand compte), soit **×4** le cas CDC (50 k€). Le **taux de réduction** reste comparable (~12 %). Ce n'est pas le même modèle, c'est le **même modèle à plus grande échelle**.

**Q : Que fait le bouton Réinitialiser ?**
R : Il remet **tous les paramètres numériques à 0** (budget, leviers, parc, investissement). Les listes déroulantes (datacenter, site) restent sur France. Utile pour repartir d'une feuille blanche avant une démo personnalisée.

**Q : Que feriez-vous pour aller plus loin (perspectives) ?**
R : Brancher un inventaire réel (nombre de vCPU, instances), affiner les coefficients par région/fournisseur, connecter les APIs de facturation cloud (AWS Cost Explorer), et calculer l'empreinte **totale** (pas seulement évitée).
