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
| 8 | Part compute planifiable *(avancé)* | `computeShare` | Slider | % | 0 – 100 | 100 |
| 9 | Localisation datacenter | `datacenter` | Liste | — | France / Europe / Monde | France |
| 10 | PUE du datacenter | `pue` | Slider | ratio | 1,0 – 2,0 (pas 0,1) | 1,2 |
| 11 | Coût énergétique (proxy) | `energyCost` | Slider | €/kWh | 0,05 – 0,30 | 0,15 |
| 12 | Électricité du site *(avancé)* | `siteLocation` | Liste | — | France / Europe / Monde | France |
| 13 | Investissement projet | `investissement` | Nombre | € | ≥ 0 | 0 |

> **Mode simple / détaillé :** un bouton bascule l'affichage. Les paramètres marqués *(avancé)* (part compute planifiable, électricité du site) ne sont visibles qu'en **mode détaillé**, pour ne pas surcharger la démonstration. Leurs valeurs par défaut (100 % compute, France) sont neutres et préservent les valeurs canoniques.

> **Note technique :** dans le code, le slider PUE stocke une valeur entière de 10 à 20 (divisée par 10 → 1,0 à 2,0). Le slider coût énergétique stocke 5 à 30 (divisé par 100 → 0,05 à 0,30 €).

> **Remarque :** le paramètre `envCount` (nombre d'environnements) n'entre **pas** dans la formule financière ; il sert uniquement à contextualiser la recommandation d'extinction. Ce choix est volontaire pour éviter tout coefficient non justifiable.

---

## 3. Constantes et sources

| Constante | Valeur | Source / justification |
|-----------|--------|------------------------|
| Facteur d'émission — **France** | 0,05 kg CO₂/kWh | Mix électrique décarboné (nucléaire + renouvelables) — RTE / ADEME |
| Facteur d'émission — **Europe** | 0,23 kg CO₂/kWh | Moyenne du mix électrique européen — ADEME / AIE |
| Facteur d'émission — **Monde** | 0,35 kg CO₂/kWh | Moyenne mondiale, mix plus carboné — AIE |
| **PUE** (défaut) | 1,2 | Power Usage Effectiveness d'un data center efficient — Uptime Institute (fourchette 1,1 – 1,3) |
| **Coût énergétique proxy** (défaut) | 0,15 €/kWh | Ratio moyen reliant la dépense Cloud à l'énergie consommée. **Ce n'est pas un relevé de compteur** mais une hypothèse FinOps paramétrable. |
| Croissance des coûts Cloud | +15 à 20 %/an | Flexera — State of the Cloud Report 2024 |
| Empreinte numérique mondiale | ~4 % des GES | Contexte général (ADEME, The Shift Project) |

---

## 4. Formules détaillées (dans l'ordre du calcul)

Notations : `B` = budget, `%HP` = part hors-prod, `H` = heures d'extinction, `%RS/%ST/%LG` = pourcentages rightsizing/stockage/logs, `PUE`, `Cₑ` = coût énergétique, `Fg` = facteur grid, `I` = investissement.

### Étape 1 — Budget des environnements hors-production
```
Budget_HP = B × (%HP / 100)
```
Isole la part du budget concernée par l'optimisation (Dev/Test), car la production n'est pas éteinte.

### Étape 2 — Facteur d'extinction
```
Facteur_extinction = H / 168
```
168 = nombre d'heures dans une semaine (24 × 7). Le facteur représente la proportion de temps où les environnements hors-prod sont éteints.

### Étape 3 — Économie liée à l'extinction automatique
```
Budget_compute = Budget_HP × (%compute_planifiable / 100)
Éco_extinction = Budget_compute × Facteur_extinction
```
**Correctif de réalisme :** seule la part **compute** d'un environnement s'arrête à l'extinction. Le stockage, les IP réservées, les licences et snapshots restent facturés. Le paramètre `computeShare` (part compute planifiable) borne donc l'économie. En pratique 50–70 % ; la valeur 100 % correspond à l'hypothèse théorique maximale (utilisée pour retrouver la valeur canonique de 10 000 €/mois du sujet).

### Étape 4 — Économie liée au rightsizing
```
Budget_compute_restant = Budget_compute − Éco_extinction
Éco_rightsizing        = Budget_compute_restant × (%RS / 100)
```
Le rightsizing s'applique sur le compute **resté allumé** (on ne rightsize pas une ressource déjà éteinte).

### Étape 5 — Économies stockage et logs
```
Éco_stockage = B × (%ST / 100)
Éco_logs     = B × (%LG / 100)
```
Ces postes concernent l'ensemble du parc (prod + hors-prod), d'où l'application sur le budget global.

### Étape 6 — Économie d'optimisation et économie totale
```
Éco_optimisation = Éco_rightsizing + Éco_stockage + Éco_logs
Éco_totale        = Éco_extinction + Éco_optimisation      (€/mois)
```

### Étape 7 — Énergie économisée (proxy)
```
Énergie = Éco_totale / Cₑ        (kWh/mois)
```
Conversion de l'économie financière en énergie via le coût énergétique proxy.

### Étape 8 — Émissions de CO₂ évitées (norme SCI)
```
CO₂ = Énergie × PUE × Fg         (kg CO₂/mois)
```
Méthodologie SCI (Software Carbon Intensity) / ISO 21031 : énergie × facteur d'infrastructure (PUE) × facteur d'émission du réseau électrique.

### Étape 9 — Économie annuelle et taux de réduction
```
Éco_annuelle       = Éco_totale × 12            (€/an)
Réduction_facture  = Éco_totale / Budget × 100  (%)
```

### Étape 10 — Retour sur investissement
```
Si I > 0 et Éco_totale > 0 :
    ROI (mois) = I / Éco_totale
Sinon :
    ROI = « Instantané »
```

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
| CO₂ Cloud annuel (preset CDC) | 4 000 × 12 | 48 000 kg/an |
| **Empreinte totale évitée** | 48 000 + 29 490 | **77 490 kg CO₂/an (~77 t)** |

> Enseignement clé : le **carbone de fabrication (26 250 kg)** pèse bien plus que l'usage (3 240 kg) sur le parc. C'est pourquoi l'allongement de la durée de vie est le levier n°1 du Green IT.

---

## 5. Exemples chiffrés (les 2 presets de démonstration)

### Preset A — « Cas référence (CDC) »
Paramètres : B = 50 000 €, %HP = 40 %, H = 84 h, %RS/%ST/%LG = 0, France (Fg = 0,05), PUE = 1,2, Cₑ = 0,15 €, I = 50 000 €.

| Étape | Calcul | Résultat |
|-------|--------|----------|
| Budget_HP | 50 000 × 0,40 | 20 000 € |
| Facteur_extinction | 84 / 168 | 0,50 |
| Éco_extinction | 20 000 × 0,50 | **10 000 €/mois** |
| Éco_optimisation | 0 | 0 € |
| **Éco_totale** | 10 000 + 0 | **10 000 €/mois** |
| Énergie | 10 000 / 0,15 | 66 667 kWh/mois |
| **CO₂** | 66 667 × 1,2 × 0,05 | **4 000 kg CO₂/mois** |
| Éco_annuelle | 10 000 × 12 | 120 000 €/an |
| ROI | 140 000 / 10 000 | **14 mois** |

### Preset B — « Cas business réaliste » (aligné sur le rapport)
Paramètres identiques sauf H = 52 h (extinction nocturne réaliste), optimisations = 0.

| Étape | Calcul | Résultat |
|-------|--------|----------|
| Budget_HP | 50 000 × 0,40 | 20 000 € |
| Facteur_extinction | 52 / 168 | 0,3095 |
| Éco_extinction | 20 000 × 0,3095 | **6 190 €/mois** |
| **Éco_totale** | | **≈ 6 190 €/mois** |
| Énergie | 6 190 / 0,15 | 41 270 kWh/mois |
| **CO₂** | 41 270 × 1,2 × 0,05 | **≈ 2 476 kg CO₂/mois** |
| Éco_annuelle | 6 190 × 12 | **≈ 74 286 €/an** |
| ROI | 86 700 / 6 190 | **≈ 14 mois** |

> Ce preset applique une hypothèse d'investissement projet réaliste (**86 700 €** : audit + outillage FinOps + automatisation + gouvernance + conduite du changement) → économie ~75 000 €/an → **ROI ≈ 14 mois**. Un retour plus prudent que 8 mois, jugé plus crédible en soutenance.

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
| Carbone cloud (kg CO₂/mois) | **± 35 %** | Dérivé du proxy coût→énergie → hypothèse la plus incertaine |
| Carbone parc sur site | **± 25 %** | Données moyennes ADEME/Boavizta, pas l'inventaire réel |

```
Borne_basse = Valeur × (1 − marge)
Borne_haute = Valeur × (1 + marge)
ROI_fourchette : ROI_meilleur = I / (Éco × 1,15) ; ROI_pire = I / (Éco × 0,85)
CO₂_total_fourchette : somme des bornes cloud (± 35 %) et parc (± 25 %)
```

> Message de soutenance : « Nous affichons des fourchettes, pas des chiffres exacts, car un POC en avant-vente donne des **ordres de grandeur**. La marge la plus large est sur le carbone cloud, ce qui reflète honnêtement la limite de notre proxy coût→énergie. »

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
