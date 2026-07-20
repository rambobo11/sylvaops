## 11.6. Logique de calcul du simulateur

Le simulateur SylvaOps est un outil d’aide à la décision. Il produit des **ordres de grandeur** à partir de paramètres renseignés par l’utilisateur, et non des mesures certifiées issues d’un inventaire cloud réel. Les calculs s’exécutent **localement dans le navigateur**, sans transmission des paramètres d’infrastructure vers un serveur.

### Principes retenus

- Le budget cloud est décomposé en **compute**, **stockage** et **réseau** ; chaque levier n’agit que sur son périmètre réel.
- L’extinction et le rightsizing ne concernent que le **hors-production** ; la production n’est jamais impactée.
- Le CO₂ cloud est estimé par la méthode des **vCPU-heures** (approche Cloud Carbon Footprint), et non par une conversion directe euros → énergie.
- L’empreinte évitée combine le **cloud** et le **parc matériel sur site** (usage + carbone de fabrication).
- Le ROI et la VAN sont calculés sur l’économie **nette** (après coût récurrent éventuel).
- Les résultats sont présentés avec des **fourchettes d’incertitude**.

### Chaîne de calcul

```
Paramètres d’entrée  →  Moteur de calcul  →  Indicateurs de sortie
(budget, leviers,     (étapes 1 à 6)       (€, kWh, CO₂, ROI, VAN)
PUE, parc, invest.)
```

### Étapes principales

**1. Décomposition du budget**

Le budget mensuel `B` est réparti selon les parts compute (`%C`) et stockage (`%S`) ; le réseau représente le reste :

```
Budget_compute = B × (%C / 100)
Budget_storage = B × (%S / 100)
Budget_network = B × ((100 − %C − %S) / 100)
```

**2. Économies financières**

```
Facteur_extinction = Heures_extinction / 168
Éco_extinction     = Budget_compute × (%hors-prod / 100) × Facteur_extinction
Éco_rightsizing    = (Budget_compute_HP − Éco_extinction) × (%rightsizing / 100)
Éco_stockage       = Budget_storage × (%stockage / 100)
Éco_logs           = (Budget_storage + Budget_network) × (%logs / 100)
Éco_totale         = Éco_extinction + Éco_rightsizing + Éco_stockage + Éco_logs
```

**3. Énergie et CO₂ cloud**

Seules les économies de compute génèrent de l’énergie évitée :

```
vCPU-heures évitées = Éco_compute / 0,045 €
Énergie (kWh/mois)  = vCPU-heures × 12 W / 1000
CO₂ (kg/mois)       = Énergie × PUE × Facteur_émission
```

Les facteurs d’émission retenus sont : France 0,05 · Europe 0,23 · Monde 0,35 kg CO₂/kWh (RTE/ADEME/AIE). Le PUE par défaut est 1,2 (Uptime Institute).

**4. Parc matériel sur site**

Le module intègre l’énergie évitée (veille, consolidation) et le **carbone de fabrication** évité grâce à l’allongement de la durée de vie des équipements. L’empreinte totale évitée est la somme du CO₂ cloud et du CO₂ parc.

**5. Rentabilité**

```
Éco_nette = Éco_totale − Coût_récurrent
ROI (mois) = Investissement / Éco_nette
VAN 3 ans  = −Investissement + somme actualisée des économies nettes sur 36 mois (taux 8 %/an)
```

**6. Fourchettes d’incertitude**

| Indicateur | Marge |
|------------|-------|
| Économie financière | ± 15 % |
| CO₂ cloud | ± 50 % |
| CO₂ parc matériel | ± 25 % |

### Limite méthodologique

Ces résultats constituent une **estimation paramétrable** destinée à l’avant-vente et à la sensibilisation. Un audit réel, fondé sur les données d’infrastructure du client, reste nécessaire pour un chiffrage définitif.
