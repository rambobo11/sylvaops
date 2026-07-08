# Faiblesses du projet & stratégie de défense

Projet M1 MCSI · Démonstrateur SylvaOps (FinOps & Green IT)
Document de préparation à la soutenance — à usage personnel.

---

## Posture générale (à retenir avant tout)

Un jury ne cherche pas un projet **parfait** ; il cherche un étudiant **lucide**. La meilleure défense n'est pas de cacher les limites, mais de **les nommer avant qu'on te les oppose**, en montrant que ce sont des **choix assumés de POC** et que tu sais comment les lever.

Trois réflexes :
1. **Reconnais** la limite honnêtement (« oui, c'est une simplification »).
2. **Justifie** le choix (« parce qu'en avant-vente on cherche un ordre de grandeur, pas un audit »).
3. **Projette** la solution (« un audit / une V2 lèverait cette limite en faisant X »).

> Phrase-clé : « Ce n'est pas un outil de mesure, c'est un outil d'**aide à la décision** en avant-vente. Il donne des ordres de grandeur transparents, pas des chiffres certifiés. »

---

## 1. Faiblesses du modèle de calcul

### 1.1 Le modèle part d'un budget, pas d'un inventaire réel
**Faiblesse :** l'outil ne se connecte pas aux comptes cloud ; il part d'un budget saisi, pas d'un inventaire de ressources (nombre réel de vCPU, d'instances).
**→ Défense :** « C'est volontaire pour un POC d'avant-vente : le prospect connaît sa facture, pas forcément son inventaire détaillé. On raisonne en **pourcentages de la facture**, ce qui reste parlant. La V2 se branche sur les API de facturation (AWS Cost Explorer) et l'inventaire réel pour affiner. »

### 1.2 Les coefficients carbone sont incertains (± 50 %)
**Faiblesse :** le prix moyen d'une vCPU-heure (~0,045 €) et la puissance par vCPU (~12 W) sont des moyennes ; ils varient selon le fournisseur, la région, le type d'instance.
**→ Défense :** « C'est justement pour ça que j'affiche une **fourchette ± 50 %** et non un chiffre unique. Je préfère une incertitude assumée à une fausse précision. Les coefficients viennent de sources reconnues (Cloud Carbon Footprint, Boavizta). »

### 1.3 Le modèle est linéaire
**Faiblesse :** les gains sont proportionnels aux paramètres ; pas d'effets de seuil, de non-linéarités ou de saisonnalité.
**→ Défense :** « La linéarité est un choix de lisibilité pour un POC : elle rend chaque résultat **traçable et explicable** en soutenance. Un modèle plus fin (par charge réelle) est une évolution, mais il perdrait en transparence pédagogique. »

### 1.4 La décomposition du budget (60/30/10) est une hypothèse
**Faiblesse :** la répartition compute/stockage/réseau par défaut est posée, pas mesurée.
**→ Défense :** « C'est un défaut paramétrable, ajustable en mode détaillé. La valeur par défaut reflète une répartition courante ; sur un cas réel, on la calerait sur la facture du client. »

### 1.5 L'extinction suppose un arrêt « propre » du compute
**Faiblesse :** on suppose que le compute hors-prod s'arrête sans coût de redémarrage ni charge *stateful* qui doit rester allumée.
**→ Défense :** « J'ai justement introduit la **décomposition** pour que seul le compute soit concerné, pas le stockage/IP qui restent facturés. Les coûts de redémarrage sont marginaux face aux gains ; un audit les intégrerait. »

### 1.6 Facteurs d'émission et PUE simplifiés
**Faiblesse :** seulement 3 zones (France/Europe/Monde) et un PUE unique paramétrable.
**→ Défense :** « Ce sont des facteurs publics de référence (RTE/ADEME/AIE). Pour un ordre de grandeur c'est suffisant ; la granularité par région exacte relève de l'audit. »

### 1.7 Le taux d'actualisation (8 %) et les investissements sont posés
**Faiblesse :** la VAN dépend d'un taux (8 %/an) et d'un montant d'investissement choisis.
**→ Défense :** « 8 % est un taux d'actualisation d'entreprise classique, et l'investissement est paramétrable. Ce sont des hypothèses transparentes, pas des vérités ; le jury peut les faire varier en direct. »

---

## 2. Faiblesses de données & de réalisme

### 2.1 Le cas SNCF repose sur des hypothèses
**Faiblesse :** le budget cloud de SNCF Connect & Tech (~200 k€/mois) n'est pas public ; il est posé.
**→ Défense :** « Je l'assume clairement à l'écran et dans le rapport : c'est un scénario **illustratif** ancré sur des données publiques (bilan carbone, part cloud AWS). Le budget est une hypothèse, à valider avec le client. Je ne prétends jamais que ce sont des chiffres réels. »

### 2.2 Le carbone cloud évité paraît faible
**Faiblesse :** avec la méthode vCPU, le CO₂ cloud évité est modeste (dizaines de tonnes), loin des ~800 t publiées par AWS.
**→ Défense :** « C'est un choix de rigueur : ma méthode est **conservatrice** et ne mesure que l'empreinte opérationnelle **évitée**, un sous-ensemble du périmètre AWS (plus large). L'enseignement fort est ailleurs : **le matériel (fabrication) domine l'empreinte**, pas le cloud opérationnel. »

### 2.3 Pas de validation empirique
**Faiblesse :** les résultats ne sont pas confrontés à des mesures réelles (pas de backtesting).
**→ Défense :** « C'est la limite structurelle d'un POC académique sans accès aux données d'un vrai client. La démarche prévoit justement un **audit réel** comme étape 1 pour calibrer et valider le modèle. »

---

## 3. Faiblesses fonctionnelles / de périmètre

### 3.1 Pas d'analyse connectée (par service / fournisseur)
**Faiblesse :** l'outil ne fait pas de découverte de ressources ni d'analyse multi-fournisseurs en temps réel.
**→ Défense :** « Le démonstrateur couvre la **simulation et la décision**. La connexion aux comptes cloud et l'analyse fine sont la **vision cible** (perspective d'évolution), pas le périmètre du POC. »

### 3.2 Le nombre d'environnements est peu structurant
**Faiblesse :** `envCount` sert surtout à un ratio « économie par environnement », il ne pilote pas fortement le calcul.
**→ Défense :** « Je l'ai câblé comme indicateur de priorisation plutôt que comme multiplicateur, pour **éviter un coefficient non justifiable** qui gonflerait artificiellement les gains. C'est un choix de sobriété méthodologique. »

### 3.3 Formulaire non fonctionnel, pas de persistance
**Faiblesse :** le formulaire de contact n'envoie rien ; pas de sauvegarde de scénarios, pas de comptes utilisateurs.
**→ Défense :** « C'est cohérent avec un POC 100 % côté client, sans backend : **aucune donnée n'est collectée**, ce qui est un atout RGPD. Un back-office (envoi, sauvegarde, multi-utilisateur) est une évolution naturelle. »

---

## 4. Faiblesses techniques & architecture

### 4.1 Architecture mono-fichier
**Faiblesse :** tout tient dans un seul `index.html` ; ce n'est pas l'architecture d'une plateforme industrielle.
**→ Défense :** « Pour un démonstrateur, c'est un **avantage** : léger, sans dépendance, chargement instantané, pérenne — et cohérent avec le message de sobriété numérique. Une industrialisation passerait par une architecture modulaire et un backend. »

### 4.2 Sécurité déléguée à la plateforme
**Faiblesse :** je n'ai pas configuré de pare-feu applicatif (WAF) ; la sécurité repose sur Vercel (HTTPS/TLS, protection DDoS de base).
**→ Défense :** « Le site étant **statique, sans backend ni base de données**, la surface d'attaque est minimale : les injections et fuites de données sont éliminées **par l'architecture elle-même**. HTTPS et les mises à jour sont gérés automatiquement par Vercel. » *(Ne pas prétendre avoir configuré un WAF ou du DMARC — non applicables ici.)*

---

## 5. Contenu & démonstration

### 5.1 Témoignages et clients fictifs
**Faiblesse :** les avis clients (RATP, ENGIE, Capgemini) et les logos sont fictifs.
**→ Défense :** « Ils sont **explicitement signalés comme illustratifs** sous la section. Dans un projet académique sans clients réels, ils servent à montrer la **mise en situation commerciale** attendue d'une vitrine. »

---

## 6. Trois réponses « joker » universelles

À ressortir si une question te surprend :

1. **« C'est un ordre de grandeur, pas une mesure. »** — L'outil objective l'avant-vente ; l'audit apporte la précision.
2. **« C'est un choix transparent et paramétrable. »** — Rien n'est caché : tout est traçable et modifiable en direct, avec des fourchettes.
3. **« C'est une perspective d'évolution. »** — Inventaire réel, connexion API de facturation, empreinte totale (pas seulement évitée), backend et sauvegarde de scénarios.

---

## 7. Synthèse : transformer chaque faiblesse en argument

| Faiblesse | Argument de défense en une phrase |
|-----------|-----------------------------------|
| Basé sur le budget, pas l'inventaire | Adapté à l'avant-vente ; l'API de facturation est la V2. |
| Coefficients carbone incertains | D'où les fourchettes ± 50 %, plutôt qu'une fausse précision. |
| Modèle linéaire | Choisi pour la traçabilité et la pédagogie. |
| Cas SNCF hypothétique | Assumé à l'écran, ancré sur des données publiques. |
| Carbone cloud faible | Méthode conservatrice ; enseignement = le matériel domine. |
| Pas de backend / formulaire inactif | Atout RGPD (aucune donnée) ; évolution naturelle. |
| Mono-fichier | Sobriété et pérennité, cohérent avec le message Green IT. |
| Sécurité déléguée | Site statique = surface d'attaque minimale par conception. |
| Témoignages fictifs | Signalés comme illustratifs (cadre académique). |

> **À retenir :** un projet dont tu connais parfaitement les limites est plus solide qu'un projet qu'on croit parfait. Ta lucidité est ta meilleure note.
