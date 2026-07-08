# Rapport — SylvaOps Consulting

Projet M1 MCSI · Démonstrateur FinOps & Green IT · Cas d'étude : SNCF Connect & Tech

---

# 11. Solution / Démarche SylvaOps

## 11.1 Vue d'ensemble de la solution

SylvaOps Consulting propose une solution d'aide à la décision destinée aux directions techniques et financières confrontées à l'inflation de leurs dépenses Cloud et à la maîtrise de leur empreinte numérique. Concrètement, la solution prend la forme d'une **application web (démonstrateur)** combinant deux volets complémentaires :

- une **vitrine commerciale** qui présente le cabinet, sa méthode et son positionnement ;
- un **simulateur interactif FinOps & Green IT** qui estime, en temps réel et à partir de paramètres d'infrastructure, les **économies financières**, l'**énergie économisée**, les **émissions de CO₂ évitées** et le **retour sur investissement** d'une démarche d'optimisation.

L'objectif de cet outil est double : **générer des leads qualifiés** (démontrer la valeur avant même l'audit) et **objectiver l'avant-vente** en donnant des ordres de grandeur crédibles, transparents et défendables, plutôt que des promesses commerciales invérifiables.

## 11.2 La démarche GreenOps : réconcilier coûts et carbone

La démarche SylvaOps repose sur un constat simple : dans le Cloud, **le gaspillage financier et le gaspillage énergétique sont deux facettes d'un même problème**. Une ressource inutilement allumée coûte de l'argent *et* émet du CO₂. En optimisant l'un, on optimise l'autre.

Cette double optique porte un nom : le **GreenOps**, à la croisée de deux disciplines :

- le **FinOps** (*Financial Operations*), qui vise la maîtrise et l'optimisation **financière** des dépenses Cloud ;
- le **Green IT**, qui vise la réduction de l'**impact environnemental** du numérique.

Là où beaucoup d'acteurs traitent ces sujets séparément, SylvaOps les unifie dans une seule démarche opérationnelle : **chaque euro économisé est aussi une quantité de CO₂ évitée**, et inversement. C'est le cœur de la proposition de valeur.

## 11.3 Les leviers d'optimisation actionnés

La solution s'appuie sur des leviers concrets, éprouvés et non intrusifs pour la production :

| Levier | Principe | Impact |
|--------|----------|--------|
| **Extinction automatique du hors-production** | Éteindre les environnements de développement, test et recette la nuit et le week-end (ils n'ont pas besoin de tourner 24/7). | Économie proportionnelle au temps d'extinction. |
| **Rightsizing** | Redimensionner les ressources surdimensionnées à leur usage réel. | Réduction du gaspillage de compute. |
| **Optimisation du stockage** | Politique de niveaux (tiering), nettoyage des données obsolètes. | Réduction du budget stockage. |
| **Rationalisation des logs & monitoring** | Politique de rétention adaptée. | Réduction des coûts d'observabilité. |
| **Allongement de la durée de vie du matériel** | Prolonger l'usage des postes et serveurs sur site. | Réduction du **carbone de fabrication** amorti chaque année (levier n°1 du Green IT). |

Un principe de sécurité guide l'ensemble : **la production n'est jamais impactée**. L'extinction ne concerne que le hors-production ; chaque action est journalisée et réversible.

## 11.4 La méthode d'accompagnement en quatre étapes

La démarche de mission proposée par SylvaOps se déroule de façon progressive, pour maîtriser le risque et démontrer la valeur rapidement :

1. **Audit & cartographie** — inventaire des ressources, identification des gisements d'économies et de sobriété.
2. **Optimisation** — mise en œuvre des premiers gains (« quick wins ») : rightsizing, nettoyage, calibrage.
3. **Automatisation** — industrialisation des leviers (extinction planifiée, règles automatiques).
4. **Gouvernance** — pilotage dans la durée via des indicateurs (coûts + CO₂), ancrage des bonnes pratiques et alimentation du reporting extra-financier (Loi REEN, CSRD).

## 11.5 Un positionnement fondé sur la transparence

Le parti pris de SylvaOps est de **ne pas survendre**. Cette exigence de crédibilité se traduit dans l'outil par plusieurs choix assumés :

- **Traçabilité totale** : chaque résultat peut être décomposé étape par étape ; aucune « boîte noire ».
- **Sources explicites** : les constantes utilisées (facteurs d'émission, PUE, coefficients énergétiques) sont documentées et référencées (RTE/ADEME, Uptime Institute, Cloud Carbon Footprint, Boavizta, Flexera).
- **Fourchettes d'incertitude** : les indicateurs sont présentés en plages (± %) plutôt qu'en faux chiffres exacts, pour refléter honnêtement le statut de **preuve de concept** et d'estimation en avant-vente.
- **Posture de complément** : sur un cas comme SNCF Connect & Tech, qui pratique déjà l'extinction et dispose d'un pilotage FinOps + CO₂, SylvaOps se présente comme un **complément** (benchmark, gouvernance, extension du périmètre), jamais comme une solution qui ignorerait l'existant.

En résumé, la solution répond à la problématique en **rendant visible, chiffrable et actionnable** le double enjeu coûts/carbone, tout en restant honnête sur ses limites — ce qui constitue justement un gage de sérieux.

---

# 12. Architecture et fonctionnement

## 12.1 Architecture générale

Le démonstrateur est une **application web monopage** (*Single-Page Application*, SPA) contenue dans un unique fichier `index.html`. Elle ne dépend d'aucun serveur applicatif : **100 % des traitements s'exécutent dans le navigateur** de l'utilisateur.

Ce choix architectural apporte trois avantages majeurs :

- **Simplicité et pérennité** : aucun composant à installer ou à maintenir, un seul fichier autoportant.
- **Performance** : chargement quasi instantané, réactivité immédiate des calculs.
- **Confidentialité** : aucune donnée saisie n'est transmise à un serveur ; rien ne quitte le poste de l'utilisateur — un choix cohérent avec la sobriété prônée par le projet.

## 12.2 Technologies retenues et justification

| Technologie | Rôle | Justification |
|-------------|------|---------------|
| **HTML5** | Structure sémantique et accessible. | Standard, référençable, compatible partout. |
| **CSS3** | Mise en forme, thème clair/sombre, animations, responsive, styles d'impression. | Puissant sans dépendance externe ; variables CSS pour centraliser le thème. |
| **JavaScript « vanilla »** | Interactivité et moteur de calcul. | Aucun framework à charger : léger, durable, cohérent avec la démarche Green IT. |
| **Git + GitHub** | Versionnement et hébergement du code source. | Historique, retour arrière, partage. |
| **Vercel** | Hébergement et déploiement continu. | Mise en ligne automatique à chaque publication, URL publique HTTPS. |

Le refus délibéré d'un framework lourd (type React) est un choix argumenté : pour un démonstrateur, la légèreté et l'absence de dépendances priment, et illustrent concrètement le principe de **sobriété numérique** défendu par SylvaOps.

## 12.3 Structure du site

Le site s'organise en deux « pages » virtuelles, basculées en JavaScript sans rechargement :

**La vitrine** enchaîne des sections argumentaires : accroche (hero), exposé de la **problématique** (coûts, sous-utilisation, empreinte carbone), les **quatre piliers** de la démarche, la présentation du cabinet, les valeurs, la **méthode en quatre étapes**, la roadmap de mission, la **conformité** (production préservée, RGPD, Loi REEN & CSRD, traçabilité), les références sectorielles et les témoignages, puis un appel à l'action vers le simulateur.

![Page d'accueil du site SylvaOps](screens/01-accueil-hero.png)
*Figure 1 — Page d'accueil : accroche, indicateurs clés et appels à l'action.*

**Le simulateur** est organisé en deux colonnes sur écran large : à gauche les **paramètres** (regroupés par thème), à droite les **résultats** (indicateurs, détail des calculs, recommandations, synthèse).

## 12.4 Fonctionnement du simulateur

Le simulateur suit un flux clair **entrées → moteur de calcul → sorties**, recalculé en temps réel à chaque modification d'un paramètre :

```
   PARAMÈTRES D'ENTRÉE                MOTEUR DE CALCUL                    SORTIES
 ┌────────────────────┐        ┌──────────────────────────┐      ┌────────────────────┐
 │ Budget Cloud        │        │ 1. Décomposition budget   │      │ KPI financiers      │
 │ Décomposition       │        │    (compute/stockage/rés.)│      │ (€/mois, €/an)      │
 │ % hors-prod         │        │ 2. Leviers d'économie     │      │ KPI énergie & CO₂   │
 │ Heures d'extinction │  ───▶  │ 3. Carbone (vCPU-heures)  │ ───▶ │ (kWh, kg CO₂)       │
 │ Rightsizing/stock.  │        │ 4. Parc matériel sur site │      │ ROI net + VAN       │
 │ Localisation, PUE   │        │ 5. ROI net + VAN          │      │ Recommandations     │
 │ Parc matériel       │        │ 6. Fourchettes ±          │      │ Synthèse imprimable │
 │ Investissement      │        └──────────────────────────┘      └────────────────────┘
 └────────────────────┘
```

Deux modes d'affichage sont proposés : un **mode simple** (paramètres essentiels) et un **mode détaillé** qui révèle les paramètres avancés (décomposition du budget, électricité du site, coût récurrent). Des **préréglages** (« presets ») permettent de charger d'un clic des scénarios cohérents : cas de référence, cas business réaliste, démonstration SNCF Connect & Tech.

![Simulateur avec le préréglage SNCF Connect & Tech](screens/02-simulateur-sncf.png)
*Figure 2 — Interface du simulateur : paramètres à gauche, résultats en temps réel à droite (préréglage SNCF Connect & Tech).*

## 12.5 Le moteur de calcul, étape par étape

Le calcul s'enchaîne de façon transparente et traçable :

1. **Décomposition du budget** — la facture Cloud est répartie en trois postes : *compute*, *stockage* et *réseau*. Chaque levier n'agit ainsi que sur son périmètre réel, ce qui évite de surestimer les gains.

2. **Leviers d'économie** — l'extinction et le rightsizing s'appliquent au **compute hors-production** ; l'optimisation du stockage à la part stockage ; les logs à la part stockage + réseau. La somme donne l'**économie totale mensuelle**.

3. **Estimation du carbone (méthode vCPU-heures)** — plutôt que de convertir directement les euros en énergie, l'outil estime l'énergie évitée à partir de l'**usage compute** : les économies de compute sont converties en **vCPU-heures** (via un prix moyen de la vCPU-heure), puis en **énergie** (via une puissance moyenne par vCPU), puis en **CO₂** (via le PUE du data center et le facteur d'émission du mix électrique). Cette approche, inspirée de la méthode *Cloud Carbon Footprint*, est plus rigoureuse et volontairement conservatrice.

4. **Parc matériel sur site** — l'outil intègre les équipements physiques (postes, serveurs) en distinguant le carbone d'**usage** (électricité consommée) et le carbone de **fabrication** (embodied carbon) amorti sur la durée de vie. Ce module illustre un enseignement clé du Green IT : **le matériel domine souvent l'empreinte carbone, devant le cloud opérationnel**.

5. **Rentabilité (ROI net + VAN)** — le retour sur investissement est calculé sur l'économie **nette** (après déduction d'un éventuel coût récurrent d'outillage), et complété par la **VAN** (valeur actuelle nette sur trois ans) qui actualise les gains futurs.

6. **Fourchettes d'incertitude** — chaque indicateur est présenté avec une marge : ± 15 % sur le financier (basé sur la facture réelle, fiable), ± 50 % sur le carbone cloud (coefficients d'estimation incertains), ± 25 % sur le carbone du parc.

Les résultats sont restitués sous forme d'**indicateurs synthétiques** (KPI), d'un **détail de calcul** ligne à ligne, de **recommandations** dynamiques et d'une **synthèse décisionnelle** imprimable en PDF.

## 12.6 Fonctionnalités transverses

- **Thème clair / sombre** mémorisé entre les visites et respectant la préférence du système.
- **Calcul en temps réel** à chaque interaction avec un paramètre.
- **Préréglages** de scénarios et **réinitialisation** en un clic.
- **Synthèse décisionnelle** et **export PDF** (impression ciblée de la seule synthèse).
- **Formulaire de contact** (demande d'audit) avec **consentement RGPD** explicite obligatoire.
- **Design responsive** (adaptation ordinateur / tablette / mobile) et **accessibilité** (structure sémantique, navigation clavier).

## 12.7 Déploiement et mise en ligne

Le cycle de publication est entièrement automatisé : le code est versionné avec **Git**, publié sur un dépôt **GitHub**, et déployé automatiquement par **Vercel** à chaque mise à jour. Le site est ainsi disponible en continu sur une **URL publique sécurisée (HTTPS)**, partageable avec le jury et les prospects, sans aucune manipulation manuelle de mise en ligne.

---

# 13. Démonstration

## 13.1 Objectif de la démonstration

La démonstration a pour but de prouver, en conditions réalistes, que la solution SylvaOps transforme des paramètres d'infrastructure en **décision chiffrée** : combien peut-on économiser, combien de CO₂ peut-on éviter, et en combien de temps l'investissement est-il rentabilisé ? Elle illustre le parcours complet d'un prospect, de la page vitrine jusqu'à la synthèse décisionnelle exportable.

Le fil conducteur retenu est un **scénario illustratif appuyé sur des données publiques** : *SNCF Connect & Tech*. Ce choix permet d'ancrer la démonstration dans un cas concret et connu, tout en assumant clairement le statut d'hypothèse des chiffres non publiés.

## 13.2 Scénario retenu

| Élément | Valeur retenue | Statut |
|---------|----------------|--------|
| Budget Cloud mensuel | 200 000 € (hypothèse) | Posé par hypothèse (non public) |
| Décomposition | compute 60 % · stockage 30 % · réseau 10 % | Hypothèse réaliste |
| Part hors-production | 40 % | Hypothèse |
| Heures d'extinction / semaine | 60 h | Paramètre de scénario |
| Rightsizing / stockage / logs | 10 % / 3 % / 2 % | Paramètres de scénario |
| Localisation, PUE | Europe · 1,2 | Cohérent avec un cloud multi-régions |
| Parc sur site | 1 200 postes · 15 serveurs · 4 → 6 ans | Hypothèse |
| Investissement projet · coût récurrent | 310 000 € · 1 500 €/mois | Hypothèse de mission |

**Ancrage public :** bilan carbone 2023 de SNCF Connect & Tech ≈ 11 000 t CO₂e, dont cloud AWS ≈ 7–8 % (≈ 800 t CO₂e/an). L'entreprise pratique déjà l'extinction des environnements de développement et dispose d'un pilotage FinOps + CO₂ (label Numérique Responsable niveau 2). SylvaOps se positionne donc en **complément**, jamais en substitution.

## 13.3 Déroulé pas à pas

La démonstration suit un déroulé volontairement court et lisible :

1. **Page d'accueil** — présentation express du cabinet et de la problématique (coûts Cloud, environnements sous-utilisés, empreinte carbone). Transition : « Pour objectiver tout cela, voici notre simulateur. »
2. **Accès au simulateur** — clic sur « Simuler mes économies ».
3. **Chargement du préréglage « Démo SNCF Connect & Tech »** — d'un clic, tous les paramètres du scénario sont renseignés et l'encadré d'hypothèses s'affiche.
4. **Lecture des indicateurs** — commentaire des KPI financiers, énergétiques et carbone, en insistant sur les **fourchettes d'incertitude** (on présente des ordres de grandeur, pas de faux chiffres exacts).
5. **Ouverture du détail de calcul** — démonstration de la **traçabilité** : chaque euro et chaque kilo de CO₂ est justifié étape par étape (aucune boîte noire).
6. **Activation du mode détaillé** — pour montrer la décomposition du budget et la méthode carbone en vCPU-heures.
7. **Génération de la synthèse décisionnelle** puis **export PDF** — le livrable remis au client.

## 13.4 Résultats clés présentés

Les ordres de grandeur obtenus pour ce scénario :

| Indicateur | Résultat | Lecture |
|------------|----------|---------|
| Économie financière | ≈ **23 600 €/mois** (≈ 283 500 €/an) | Soit ≈ 11,8 % de la facture Cloud. |
| Économie par environnement | ≈ 1 180 €/mois | Utile pour prioriser. |
| CO₂ cloud évité | ≈ **17,9 t CO₂e/an** | Estimation conservatrice (méthode vCPU-heures). |
| CO₂ parc évité | ≈ 23,9 t CO₂e/an | Dominé par le carbone de fabrication. |
| Empreinte totale évitée | ≈ **41,7 t CO₂e/an** | Cloud + parc matériel. |
| Retour sur investissement net | ≈ **14 mois** | Calculé sur l'économie nette. |

> Ces valeurs sont des **ordres de grandeur** issus d'hypothèses paramétrables ; elles seraient affinées par un audit réel. Le carbone cloud évité (~18 t/an) est volontairement une **fraction** des ~800 t publiées par AWS, dont le périmètre et la méthodologie sont plus larges.

![Détail de calcul et traçabilité](screens/03-resultats-detail.png)
*Figure 3 — Traçabilité complète : chaque étape du calcul est explicitée (décomposition, vCPU-heures, CO₂, ROI net, VAN), ainsi que l'empreinte carbone totale évitée.*

## 13.5 Ce que la démonstration prouve

- La solution **rend visible et chiffrable** le double enjeu coûts/carbone en quelques secondes.
- Elle est **transparente et défendable** : traçabilité complète, sources documentées, incertitudes assumées.
- Elle produit un **livrable concret** (synthèse PDF) exploitable en avant-vente.
- Elle reste **honnête sur ses limites**, ce qui renforce sa crédibilité auprès d'un décideur.

En cela, la démonstration valide la proposition de valeur de SylvaOps : passer d'un discours commercial à une **estimation objectivée**, prête à être confirmée par une mission d'audit.
