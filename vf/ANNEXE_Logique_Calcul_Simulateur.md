# Annexe — Logique de calcul du simulateur SylvaOps

**Rapport de Projet Annuel · SylvaOps Consulting · FinOps & Green IT**  
**Référence :** démonstrateur web `index.html` — déployé sur `sylvaops.vercel.app`  
**Version :** juillet 2026

---

## A. Objet de ce document

La présente annexe documente la **logique de calcul** du simulateur FinOps & Green IT développé par SylvaOps Consulting. Elle est destinée au jury, aux relecteurs techniques et au client, pour **vérifier, comprendre et défendre** les résultats affichés par l'outil.

Le simulateur est un **outil d'aide à la décision** (preuve de concept) : il produit des **ordres de grandeur** à partir d'hypothèses paramétrables, et non des mesures certifiées issues d'un inventaire cloud réel.

> Les calculs s'exécutent **entièrement dans le navigateur** de l'utilisateur. Aucun paramètre d'infrastructure n'est transmis à un serveur distant.

---

## B. Périmètre et principes directeurs

| Principe | Application |
|----------|-------------|
| **Décomposition du budget** | La facture cloud est répartie en compute / stockage / réseau. Chaque levier n'agit que sur son sous-budget réel. |
| **Production préservée** | L'extinction et le rightsizing ne concernent que le **compute hors-production** (dev, test, recette). |
| **Carbone cloud conservateur** | Le CO₂ cloud est estimé par la méthode **vCPU-heures** (Cloud Carbon Footprint), et non par une conversion directe € → kWh. |
| **Double périmètre carbone** | Cloud opérationnel (compute évité) **+** parc matériel sur site (usage + carbone de fabrication). |
| **Rentabilité nette** | Le ROI et la VAN sont calculés sur l'économie **nette**, après déduction d'un coût récurrent éventuel. |
| **Incertitude assumée** | Les KPI sont présentés avec des **fourchettes ±** différenciées selon la fiabilité de la donnée. |

---

## C. Notations

| Symbole | Signification |
|---------|---------------|
| `B` | Budget cloud mensuel global (€) |
| `%HP` | Part des environnements hors-production (%) |
| `H` | Heures d'extinction planifiées par semaine |
| `%RS`, `%ST`, `%LG` | Taux de rightsizing, optimisation stockage, réduction logs (%) |
| `%C`, `%S` | Parts compute et stockage du budget (%) |
| `PUE` | Power Usage Effectiveness du datacenter |
| `Fg` | Facteur d'émission du mix électrique (kg CO₂/kWh) |
| `I` | Investissement projet (€) |
| `Cr` | Coût récurrent mensuel (€/mois) |

---

## D. Paramètres d'entrée

### D.1. Infrastructure cloud

| Paramètre | Unité | Plage | Rôle |
|-----------|-------|-------|------|
| Budget cloud mensuel | € | ≥ 0 | Base de la décomposition et des leviers financiers |
| Part hors-production | % | 0 – 100 | Fraction du compute concernée par extinction/rightsizing |
| Nombre d'environnements non-prod | unité | 0 – 50 | Calcul de l'économie par environnement |
| Heures d'extinction / semaine | h | 0 – 168 | Proportion de temps d'arrêt du compute HP |
| Rightsizing hors-prod | % | 0 – 50 | Réduction du compute HP restant allumé |
| Optimisation stockage | % | 0 – 20 | Réduction sur la part stockage |
| Réduction logs & monitoring | % | 0 – 15 | Réduction sur stockage + réseau |
| Part compute *(avancé)* | % | 0 – 100 | Décomposition du budget — défaut 60 % |
| Part stockage *(avancé)* | % | 0 – 100 | Décomposition du budget — défaut 30 % |
| Localisation datacenter | — | France / Europe / Monde | Facteur d'émission `Fg` |
| PUE datacenter | ratio | 1,0 – 2,0 | Efficacité énergétique du data center |
| Investissement projet | € | ≥ 0 | Base du calcul ROI / VAN |
| Coût récurrent *(avancé)* | €/mois | ≥ 0 | Déduit pour le ROI net et la VAN |

> **Réseau** = 100 % − %compute − %stockage. Les paramètres marqués *(avancé)* ne sont visibles qu'en mode détaillé du simulateur.

### D.2. Parc matériel sur site

| Paramètre | Unité | Défaut indicatif |
|-----------|-------|------------------|
| Nombre de postes de travail | unité | 1 200 |
| Consommation par poste | kWh/an | 120 |
| Réduction usage postes (veille) | % | 20 |
| Nombre de serveurs on-premise | unité | 50 |
| Consommation par serveur | kWh/an | 4 000 |
| Réduction usage serveurs | % | 15 |
| Empreinte fabrication / poste | kg CO₂e | 200 |
| Empreinte fabrication / serveur | kg CO₂e | 1 500 |
| Durée de vie actuelle / cible | ans | 4 → 6 |
| Lieu des équipements *(avancé)* | — | France / Europe / Monde |

---

## E. Constantes et sources

| Constante | Valeur | Source / justification |
|-----------|--------|--------------------------|
| Facteur d'émission — France | 0,05 kg CO₂/kWh | Mix décarboné — RTE / ADEME |
| Facteur d'émission — Europe | 0,23 kg CO₂/kWh | Moyenne européenne — ADEME / AIE |
| Facteur d'émission — Monde | 0,35 kg CO₂/kWh | Moyenne mondiale — AIE |
| PUE (défaut) | 1,2 | Data center efficient — Uptime Institute (1,1 – 1,3) |
| Prix moyen vCPU-heure | 0,045 € | Grilles on-demand AWS / Azure / GCP |
| Puissance par vCPU | 12 W (IT) | Cloud Carbon Footprint / Boavizta |
| Taux d'actualisation (VAN) | 8 %/an | Hypothèse financière standard |
| Heures par semaine | 168 h | 24 × 7 — base du facteur d'extinction |

---

## F. Chaîne de calcul — vue d'ensemble

```
ENTRÉES                    MOTEUR DE CALCUL                         SORTIES
┌─────────────────┐   ┌──────────────────────────────┐   ┌──────────────────────┐
│ Budget, %HP, H  │   │ 1. Décomposition budget       │   │ Économie €/mois, €/an │
│ Leviers RS/ST/LG│──▶│ 2. Leviers financiers (cascade)│──▶│ Énergie kWh/mois      │
│ PUE, Fg, parc   │   │ 3. vCPU-heures → énergie → CO₂│   │ CO₂ cloud kg/mois     │
│ Invest., Cr     │   │ 4. Parc : usage + fabrication │   │ CO₂ parc kg/an        │
└─────────────────┘   │ 5. ROI net + VAN 3 ans        │   │ ROI, VAN, fourchettes │
                      │ 6. Marges d'incertitude ±     │   │ Recommandations       │
                      └──────────────────────────────┘   └──────────────────────┘
```

Le recalcul est **instantané** à chaque modification d'un paramètre (fonction `calculate()` dans le code source).

---

## G. Formules — module cloud (ordre d'exécution)

### Étape 1 — Décomposition du budget

```
Budget_compute = B × (%C / 100)
Budget_storage = B × (%S / 100)
Budget_network = B × ((100 − %C − %S) / 100)
```

### Étape 2 — Facteur d'extinction

```
Facteur_extinction = H / 168
```

168 = nombre d'heures dans une semaine. Proportion du temps où le compute hors-prod est arrêté.

### Étape 3 — Économie liée à l'extinction

```
Budget_compute_HP = Budget_compute × (%HP / 100)
Éco_extinction    = Budget_compute_HP × Facteur_extinction
```

> Le stockage, les adresses IP et les licences restent facturés même lorsque les machines sont éteintes.

### Étape 4 — Économie liée au rightsizing

```
Budget_compute_HP_restant = Budget_compute_HP − Éco_extinction
Éco_rightsizing           = Budget_compute_HP_restant × (%RS / 100)
```

### Étape 5 — Économies stockage et logs

```
Éco_stockage = Budget_storage × (%ST / 100)
Éco_logs     = (Budget_storage + Budget_network) × (%LG / 100)
```

### Étape 6 — Économie totale

```
Éco_optimisation = Éco_rightsizing + Éco_stockage + Éco_logs
Éco_totale        = Éco_extinction + Éco_optimisation          (€/mois)
Éco_par_env       = Éco_totale / Nombre_environnements
Éco_annuelle      = Éco_totale × 12                           (€/an)
Réduction_facture = (Éco_totale / B) × 100                     (%)
```

### Étape 7 — Énergie via vCPU-heures (méthode Cloud Carbon Footprint)

```
Éco_compute       = Éco_extinction + Éco_rightsizing
vCPU-heures       = Éco_compute / 0,045
Énergie (kWh/mois)= vCPU-heures × 12 / 1000
```

Seules les économies **compute** génèrent de l'énergie évité. Les gains stockage/logs sont surtout financiers.

### Étape 8 — Émissions CO₂ cloud (norme SCI / ISO 21031)

```
CO₂_cloud (kg/mois) = Énergie × PUE × Fg
CO₂_cloud (kg/an)   = CO₂_cloud (kg/mois) × 12
```

### Étape 9 — ROI net

```
Éco_nette = Éco_totale − Cr

Si I > 0 et Éco_nette > 0 :
    ROI (mois) = I / Éco_nette
Sinon si I > 0 :
    ROI = « Non rentable »
Sinon :
    ROI = « Instantané »
```

### Étape 10 — VAN sur 3 ans

```
r_mensuel = (1 + 8 %)^(1/12) − 1

VAN = −I + Σ (t = 1 à 36)  Éco_nette / (1 + r_mensuel)^t
```

La VAN actualise les flux mensuels sur 36 mois au taux de 8 % par an.

---

## H. Formules — module parc matériel sur site

Ce module étend l'analyse au-delà du cloud pour intégrer le **carbone de fabrication** (*embodied carbon*), souvent dominant dans l'empreinte IT globale.

### H.1. Énergie du parc évitée (phase d'usage)

```
Énergie_postes   = Nb_postes × Conso_poste × (%réduction_postes / 100)
Énergie_serveurs = Nb_serveurs × Conso_serveur × (%réduction_serveurs / 100)
Énergie_parc     = Énergie_postes + Énergie_serveurs                    (kWh/an)
```

### H.2. CO₂ lié à l'usage du parc

`Fg_site` = facteur d'émission du lieu des équipements (paramètre `siteLocation`, indépendant de la région cloud).

```
CO₂_postes   = Énergie_postes × Fg_site
CO₂_serveurs = Énergie_serveurs × PUE × Fg_site
CO₂_parc_usage = CO₂_postes + CO₂_serveurs                              (kg CO₂/an)
```

> Les postes de travail ne sont pas hébergés en data center : le PUE ne s'applique pas. Les serveurs on-premise, eux, sont soumis au PUE de la salle.

### H.3. CO₂ de fabrication évité (levier durée de vie)

```
Δ_amortissement = (1 / Durée_actuelle) − (1 / Durée_cible)    [si Durée_cible > Durée_actuelle, sinon 0]

CO₂_fabrication = (Nb_postes × Empreinte_poste + Nb_serveurs × Empreinte_serveur)
                  × Δ_amortissement                                      (kg CO₂/an)
```

**Principe :** le carbone de fabrication est amorti sur la durée de vie de l'équipement. Allonger la durée (ex. 4 → 6 ans) réduit la part annualisée : `(1/4 − 1/6) = 0,0833` par unité d'empreinte.

### H.4. Agrégation carbone totale

```
CO₂_parc_annuel          = CO₂_parc_usage + CO₂_fabrication
Empreinte_totale_évitée  = CO₂_cloud_annuel + CO₂_parc_annuel        (kg CO₂/an)
```

---

## I. Fourchettes d'incertitude

Pour éviter une fausse précision, chaque KPI est accompagné d'une plage min – max :

| KPI | Marge ± | Justification |
|-----|---------|---------------|
| Économie financière (€/mois, €/an) | **15 %** | Basée sur la facture cloud — donnée la plus fiable |
| Carbone cloud (kg CO₂) | **50 %** | Coefficients vCPU (prix, watts, Fg, PUE) incertains |
| Carbone parc sur site | **25 %** | Moyennes ADEME/Boavizta, pas l'inventaire réel |

```
Borne_basse = Valeur × (1 − marge)
Borne_haute = Valeur × (1 + marge)

ROI_min = I / (Éco_nette × 1,15)     ← économie optimiste
ROI_max = I / (Éco_nette × 0,85)     ← économie pessimiste
```

---

## J. Exemples chiffrés — préréglages du simulateur

### J.1. Cas référence (CDC)

| Paramètre | Valeur |
|-----------|--------|
| Budget | 50 000 €/mois |
| Décomposition | 60 % compute · 30 % stockage · 10 % réseau |
| Hors-prod | 40 % · Extinction 84 h/sem · Leviers RS/ST/LG = 0 |
| Localisation | France (Fg = 0,05) · PUE = 1,2 |
| Investissement | 108 000 € · Coût récurrent = 0 |

| Résultat | Valeur |
|----------|--------|
| Budget compute HP | 12 000 € |
| Éco extinction | 6 000 €/mois |
| **Éco totale** | **6 000 €/mois** (12 % du budget) |
| Éco annuelle | 72 000 €/an |
| vCPU-heures évitées | ≈ 133 333 h/mois |
| Énergie | ≈ 1 600 kWh/mois |
| **CO₂ cloud** | **≈ 96 kg/mois** (≈ 1 152 kg/an) |
| **ROI net** | **18 mois** |
| VAN 3 ans | ≈ +84 260 € |

### J.2. Cas business réaliste

| Paramètre | Valeur |
|-----------|--------|
| Budget | 50 000 €/mois · Hors-prod 40 % |
| Extinction 52 h · RS 10 % · ST 5 % · LG 3 % |
| Investissement | 91 700 € · Coût récurrent 800 €/mois |

| Résultat | Valeur |
|----------|--------|
| Éco extinction | ≈ 3 714 €/mois |
| Éco optimisation | ≈ 2 179 €/mois |
| **Éco totale** | **≈ 5 893 €/mois** (~11,8 %) |
| Éco nette | ≈ 5 093 €/mois |
| **CO₂ cloud** | **≈ 73 kg/mois** |
| **ROI net** | **≈ 18 mois** |
| VAN 3 ans | ≈ +71 500 € |

### J.3. Démo SNCF Connect & Tech *(scénario illustratif)*

> Budget cloud **non public** — posé en hypothèse à 200 000 €/mois pour refléter un grand compte. Ancrage public : bilan carbone 2023 ≈ 11 000 t CO₂e, dont cloud AWS ≈ 7–8 % (≈ 800 t/an).

| Paramètre | Valeur |
|-----------|--------|
| Budget | 200 000 €/mois (hypothèse) |
| Hors-prod 40 % · Extinction 60 h · RS 10 % · ST 3 % · LG 2 % |
| Datacenter Europe (Fg = 0,23) · PUE 1,2 |
| Investissement 398 000 € · Coût récurrent 1 500 €/mois |
| Parc : 1 200 postes · 15 serveurs · durée 4 → 6 ans |

| Résultat | Valeur |
|----------|--------|
| **Éco totale** | **≈ 23 629 €/mois** (~11,8 %) |
| Éco annuelle | ≈ 283 500 €/an |
| **CO₂ cloud évité** | **≈ 17,9 t CO₂e/an** |
| CO₂ parc évité | ≈ 23,9 t CO₂e/an |
| **Empreinte totale évitée** | **≈ 41,7 t CO₂e/an** |
| Éco nette | ≈ 22 129 €/mois |
| **ROI net** | **≈ 18 mois** |
| VAN 3 ans | ≈ +311 000 € |

> Le carbone cloud évité (~18 t/an) est volontairement **conservateur** : il ne couvre que le compute évité (méthode vCPU-heures) et représente une fraction des ~800 t publiées par AWS (périmètre et méthodologie plus larges).

---

## K. Hypothèses, limites et posture méthodologique

1. **Estimation, pas mesure.** Les résultats reposent sur des hypothèses paramétrables. Un audit réel (inventaire cloud, APIs de facturation) est nécessaire pour un chiffrage définitif.

2. **Modèle linéaire.** Les gains sont proportionnels aux paramètres ; pas d'effets de seuil, de saisonnalité ou de rendements dégressifs.

3. **Périmètre cloud partiel.** La méthode vCPU-heures ne couvre que l'usage compute évité ; mémoire, stockage et réseau ne génèrent pas d'énergie évité dans le modèle.

4. **Facteurs moyens.** Les facteurs d'émission et le prix vCPU-heure sont des moyennes ; un chiffrage précis utiliserait les données horaires du mix et les grilles tarifaires réelles du client.

5. **Parc matériel : données indicatives.** Les empreintes de fabrication et consommations sont des références ADEME/Boavizta, pas un inventaire LCA client.

6. **Posture SNCF.** SNCF Connect & Tech pratique déjà l'extinction et dispose d'un pilotage FinOps + CO₂. Le scénario SNCF est un **illustratif d'avant-vente**, pas un audit de l'existant.

---

## L. Correspondance avec les exigences du cahier des charges

| Exigence (chapitre 9) | Couverture |
|-----------------------|------------|
| Simuler plusieurs scénarios | Paramètres + 4 préréglages (CDC, business, SNCF, réinitialiser) |
| Estimer économies financières | €/mois, €/an, % de réduction |
| Estimer CO₂ évité | kg/mois (cloud) + kg/an (parc) — norme SCI |
| Calculer le ROI | Mois, sur économie nette |
| VAN | 3 ans, taux 8 %/an |
| Recommandations dynamiques | 6 cartes de leviers (activées/grisées selon gains) |
| Transparence méthodologique | Détail de calcul ligne à ligne dans l'interface |
| Rapport décisionnel | Synthèse + export PDF navigateur |

---

## M. Sources bibliographiques

| Source | Usage dans le modèle |
|--------|---------------------|
| RTE / ADEME | Facteurs d'émission électrique (France, Europe) |
| AIE | Facteur d'émission mondial |
| Uptime Institute | PUE data center |
| Cloud Carbon Footprint | Méthode vCPU-heures |
| Boavizta | Empreinte fabrication matériel |
| Flexera — State of the Cloud | Contexte gaspillage cloud (~30 %) |
| SNCF Connect & Tech (presse) | Ancrage carbone public — scénario SNCF |

**Références scénario SNCF :**
- Le Monde Informatique — bilan carbone 2023, part cloud AWS
- Silicon.fr — extinction automatique des environnements de dev
- Futura Sciences — label Numérique Responsable niveau 2

---

> **Vérification en direct :** l'ensemble de ces formules est implémenté dans le simulateur accessible sur `sylvaops.vercel.app`. Le bloc « Détail du calcul » affiche chaque étape intermédiaire en temps réel, conformément à la traçabilité décrite dans le chapitre 11 du rapport.
