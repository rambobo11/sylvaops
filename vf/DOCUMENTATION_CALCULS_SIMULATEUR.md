# Documentation du calculateur — Démonstrateur SylvaOps / GreenOps

Projet M1 MCSI · SylvaOps Consulting · Cas SNCF Connect & Tech
Document de référence méthodologique du simulateur FinOps & Green IT (`index.html`).

---

## 1. Objectif du calculateur

Le simulateur est un **outil d'aide à la décision** (preuve de concept) qui estime, à partir de paramètres d'infrastructure Cloud :

1. l'**économie financière** générée par une démarche GreenOps (€/mois et €/an) ;
2. l'**énergie économisée** (kWh/mois) ;
3. les **émissions de CO₂ évitées** (kg CO₂/mois) ;
4. le **retour sur investissement** (ROI, en mois).

Tous les résultats sont recalculés **en temps réel** à chaque modification d'un paramètre (événements `input` et `change` sur chaque champ). Aucune donnée n'est envoyée à un serveur : 100 % du calcul s'exécute dans le navigateur.

---

## 2. Paramètres d'entrée

| # | Paramètre | Identifiant | Type | Unité | Plage | Valeur par défaut |
|---|-----------|-------------|------|-------|-------|-------------------|
| 1 | Budget Cloud mensuel global | `budget` | Nombre | € | ≥ 0 | 50 000 |
| 2 | Part environnements Hors-Production | `horsProd` | Slider | % | 0 – 100 | 40 |
| 3 | Nombre d'environnements non-prod | `envCount` | Slider | unité | 1 – 50 | 12 |
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
Paramètres : B = 50 000 €, compute 60 % / stockage 30 % / réseau 10 %, %HP = 40 %, H = 84 h, %RS/%ST/%LG = 0, France (Fg = 0,05), PUE = 1,2, I = 84 000 €, coût récurrent = 0.

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
| ROI net | 84 000 / 6 000 | **14 mois** |
| VAN 3 ans | taux 8 %/an | ≈ +108 000 € |

### Preset B — « Cas business réaliste »
Paramètres : B = 50 000 €, compute 60 % / stockage 30 %, %HP = 40 %, H = 52 h, RS = 10 %, ST = 5 %, LG = 3 %, France, I = 71 300 €, coût récurrent = 800 €/mois.

| Étape | Calcul | Résultat |
|-------|--------|----------|
| Budget compute HP | 30 000 × 0,40 | 12 000 € |
| Éco_extinction | 12 000 × (52/168) | ≈ 3 714 €/mois |
| Éco_optimisation | rightsizing + stockage + logs | ≈ 2 179 €/mois |
| **Éco_totale** | | **≈ 5 893 €/mois** (~11,8 % du budget) |
| Éco_annuelle | × 12 | **≈ 70 700 €/an** |
| **CO₂ cloud** | méthode vCPU | **≈ 73 kg CO₂/mois** |
| Éco nette | 5 893 − 800 | ≈ 5 093 €/mois |
| ROI net | 71 300 / 5 093 | **≈ 14 mois** |
| VAN 3 ans | taux 8 %/an | ≈ +92 000 € |

### Preset C — « Démo SNCF Connect & Tech » (données publiques)

Scénario **illustratif** à partir de données publiques (voir sources en fin de doc). Le budget cloud n'est **pas public** ; il est **posé en hypothèse**.

**Ancrage public :** bilan carbone 2023 ≈ **11 000 t CO₂e**, dont **cloud AWS ≈ 7–8 %** ≈ **800 t CO₂e/an**.

Paramètres : budget **200 000 €/mois** (hypothèse), compute 60 % / stockage 30 %, hors-prod 40 %, extinction 60 h/sem, rightsizing 10 %, stockage 3 %, logs 2 %, datacenter **Europe** (0,23), PUE 1,2, I = 310 000 €, coût récurrent = 1 500 €/mois. Parc : 1 200 postes, 15 serveurs.

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
| ROI net | 310 000 / 22 129 | **≈ 14 mois** |

> **Carbone cloud volontairement conservateur :** la méthode vCPU-heures donne une empreinte opérationnelle évitée (~18 t/an) bien plus faible que l'ancien proxy. C'est une **fraction** des ~800 t publiées par AWS (périmètre plus large : mémoire, stockage, réseau, méthodologie AWS). On présente donc un chiffre défendable et prudent, pas un chiffre gonflé.

> **Posture démo :** SNCF Connect & Tech pratique **déjà** l'extinction des environnements de dev et dispose d'un tableau de bord FinOps + CO₂ (label Numérique Responsable niveau 2). SylvaOps se présente en **complément** : benchmark externe, gouvernance, extension du périmètre, objectivation de l'avant-vente — **jamais** comme si rien n'existait. Chiffres **à valider avec le client**.

---

## 6. Modalités de calcul et logique applicative

- **Temps réel :** chaque paramètre déclenche `calculate()` ; l'affichage des KPI est rafraîchi via `requestAnimationFrame` avec une transition d'opacité.
- **Détail de traçabilité :** un encart affiche chaque étape intermédiaire (Budget_HP, facteur, gains, total, énergie, CO₂) pour rendre le calcul vérifiable.
- **Recommandations dynamiques :** 4 cartes sont générées, une par levier (extinction, rightsizing, stockage, logs), avec le gain € associé. Les leviers à 0 apparaissent grisés.
- **Rapport de synthèse :** le bouton « Générer la synthèse » produit un paragraphe décisionnel reprenant tous les résultats et la localisation/PUE ; impression PDF possible.
- **Presets :** trois boutons (Cas CDC, Cas business, Réinitialiser) préremplissent l'ensemble des champs pour une démonstration reproductible.

---

## 7. Hypothèses et limites (à assumer en soutenance)

1. **Estimation, pas mesure.** Les résultats reposent sur des hypothèses paramétrables. Un audit réel des ressources (via CloudWatch, Azure Monitor, GCP Monitoring) est nécessaire pour un chiffrage définitif.
2. **Coût énergétique = proxy FinOps.** La conversion € → kWh utilise un ratio moyen, non un relevé de consommation réelle. Il est explicitement paramétrable et documenté.
3. **Linéarité.** Les gains sont modélisés linéairement ; en réalité, les rendements peuvent être dégressifs.
4. **Périmètre.** L'extinction ne concerne que les environnements Dev/Test ; la production reste disponible 24/7 (aucun impact sur la qualité de service).
5. **Facteurs d'émission moyens.** Les facteurs grid sont des moyennes ; un chiffrage précis utiliserait les données horaires réelles du mix électrique.

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
ROI_fourchette : ROI_meilleur = I / (Éco × 1,15) ; ROI_pire = I / (Éco × 0,85)
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

> ⚠️ Le budget cloud (~167 k€/mois) et le parc sur site sont des **hypothèses posées** par calibrage, non des données publiées. À valider avec le client avant tout usage réel.
