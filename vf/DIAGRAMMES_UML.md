# Diagrammes UML — Application web SylvaOps

Projet M1 MCSI · Démonstrateur FinOps & Green IT
Modélisation de la solution web (SPA `index.html` — HTML/CSS/JS, sans framework).

> Note de lecture : l'application étant une **Single-Page Application** 100 % côté client, les diagrammes décrivent des **modules JavaScript** (et non des classes objet classiques) ainsi que les interactions utilisateur → interface → moteur de calcul.

---

## 1. Diagramme de cas d'utilisation

Décrit **qui** fait **quoi** avec l'application.

```mermaid
flowchart LR
  prospect(("Prospect /<br/>Décideur IT"))
  consultant(("Consultant<br/>SylvaOps"))

  subgraph S["Application web SylvaOps (SPA)"]
    direction TB
    uc1(["Consulter la vitrine"])
    uc2(["Basculer thème clair / sombre"])
    uc2b(["Basculer la langue FR / EN"])
    uc3(["Ouvrir le simulateur"])
    uc4(["Choisir un scénario (preset)"])
    uc5(["Ajuster les paramètres"])
    uc6(["Consulter les KPI &amp; fourchettes ±"])
    uc7(["Afficher le détail des calculs"])
    uc8(["Générer la synthèse"])
    uc9(["Imprimer / exporter en PDF"])
    uc10(["Demander un audit (contact RGPD)"])
  end

  prospect --- uc1
  prospect --- uc2
  prospect --- uc2b
  prospect --- uc3
  prospect --- uc4
  prospect --- uc5
  prospect --- uc6
  prospect --- uc7
  prospect --- uc10
  consultant --- uc4
  consultant --- uc8
  consultant --- uc9

  uc3 -. include .-> uc6
  uc9 -. include .-> uc8
  uc5 -. extend .-> uc6
```

**Acteurs**
- **Prospect / Décideur IT** : explore la vitrine et simule ses économies de façon autonome.
- **Consultant SylvaOps** : utilise l'outil en avant-vente, choisit un scénario, génère et imprime la synthèse.

**Relations UML**
- `include` : ouvrir le simulateur **inclut** l'affichage des KPI ; imprimer **inclut** la génération de la synthèse.
- `extend` : ajuster un paramètre **étend** l'affichage des KPI (recalcul temps réel optionnel).

---

## 2. Diagramme de séquence — simulation en temps réel

Décrit le **déroulé d'un calcul** quand l'utilisateur agit sur un paramètre ou un preset.

```mermaid
sequenceDiagram
  actor U as Utilisateur
  participant UI as Interface<br/>(sliders / selects)
  participant SIM as calculate()
  participant ENG as Moteur de calcul<br/>(FinOps + Green IT)
  participant DOM as KPI &amp; Recommandations

  U->>UI: Modifie un paramètre / choisit un preset
  UI->>SIM: événement input / change
  SIM->>SIM: Lecture des valeurs (objet els)
  SIM->>ENG: Décomposition budget + application des leviers
  Note over ENG: Extinction, rightsizing,<br/>stockage, logs, parc matériel
  ENG-->>SIM: Économie €, kWh, CO₂, ROI, VAN
  SIM->>SIM: Calcul des fourchettes d'incertitude ±
  SIM->>DOM: requestAnimationFrame → animation des KPI
  SIM->>DOM: renderReco() → recommandations dynamiques
  DOM-->>U: Affichage mis à jour instantanément
```

**Points clés**
- Aucun aller-retour réseau : tout le calcul est **local** (réactivité immédiate, aucune donnée envoyée).
- `requestAnimationFrame` assure une **animation fluide** des chiffres.
- Les **fourchettes ±** traduisent l'incertitude assumée du modèle.

---

## 3. Diagramme de composants (modules JavaScript)

Décrit l'**organisation logique interne** de l'application.

```mermaid
classDiagram
  class ThemeManager {
    -theme : localStorage
    +isDarkTheme()
    +applyTheme(theme)
    +toggle()
  }
  class I18nManager {
    -lang : localStorage
    +applyLang(fr|en)
    +t(key)
    +currentLocale()
  }
  class Router {
    -pages : accueil, simulateur
    +showPage(name)
  }
  class Simulator {
    -els / displays / fills
    -lastResult
    +calculate()
    +updateSliderFill()
    +renderReco(r)
  }
  class PresetManager {
    -presetCdc / Business / Sncf
    +applyPreset(cfg)
    +setActivePreset(id)
    +withParc(cfg)
  }
  class ReportGenerator {
    +genReport()
    +printReport()
  }
  class ContactModal {
    +openModalFn()
    +closeModalFn()
    +validate(consent RGPD)
  }

  Router --> Simulator : déclenche calculate()
  PresetManager --> Simulator : injecte les paramètres
  ReportGenerator --> Simulator : lit lastResult
  Simulator ..> ThemeManager : logos selon le thème
  ReportGenerator ..> ContactModal : CTA « demander un audit »
```

**Rôle de chaque module**
- **ThemeManager** : mode clair/sombre persistant (`localStorage`).
- **I18nManager** : bascule FR/EN, traduction vitrine + simulateur + synthèse, formatage locale.
- **Router** : navigation SPA entre la vitrine et le simulateur.
- **Simulator** : cœur du produit — lecture des paramètres, calcul, affichage des KPI et recommandations.
- **PresetManager** : scénarios pré-remplis (CDC, business, SNCF).
- **ReportGenerator** : synthèse imprimable / export PDF.
- **ContactModal** : formulaire d'audit avec consentement RGPD.

---

## 4. Diagramme de déploiement

Décrit la **chaîne de publication** et l'exécution de l'application.

```mermaid
flowchart LR
  subgraph DEV["Poste développeur"]
    code["index.html<br/>HTML + CSS + JS"]
    git["Dépôt Git local"]
  end
  subgraph GH["GitHub"]
    repo["rambobo11 / sylvaops"]
  end
  subgraph VER["Vercel — hébergement"]
    cdn["CDN mondial<br/>HTTPS / TLS automatique"]
  end
  subgraph CLI["Poste client"]
    nav["Navigateur<br/>desktop / mobile"]
  end

  code --> git
  git -->|git push| repo
  repo -->|build &amp; deploy auto| cdn
  cdn -->|HTTPS| nav
```

**Points clés**
- **Statique** : aucun serveur applicatif ni base de données → surface d'attaque minimale.
- **Déploiement continu** : chaque `git push` redéploie automatiquement sur Vercel.
- **HTTPS/TLS** géré par la plateforme, sans configuration.

---

## Cohérence avec la solution

Ces diagrammes reflètent fidèlement le code réel (`index.html`) : navigation SPA (`showPage`), moteur `calculate()`, presets (`applyPreset`), synthèse (`genReport` / `printReport`), thème (`applyTheme`) et modale de contact avec consentement RGPD. Ils sont compatibles avec l'architecture décrite dans le rapport (sections Solution & Architecture).
