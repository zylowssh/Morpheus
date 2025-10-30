# Morpheus

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python)
![Kivy](https://img.shields.io/badge/Kivy-Framework-green)
![KivyMD](https://img.shields.io/badge/KivyMD-UI%20Toolkit-purple)
![Plyer](https://img.shields.io/badge/Plyer-Sensor%20API-orange)
![License](https://img.shields.io/badge/Licence-MIT-lightgrey)
![Status](https://img.shields.io/badge/Statut-En%20développement-yellow)

**Réveil intelligent — Développé avec Python, Kivy, KivyMD et Plyer**

Morpheus est une **application mobile** qui utilise les capteurs du smartphone pour détecter les phases de sommeil d’une personne et, grâce à une estimation de ses cycles, détermine le moment optimal pour la réveiller. L’objectif : offrir un **réveil intelligent** qui améliore la sensation de repos et réduit la fatigue au réveil.


## 🚀 Fonctionnalités principales

* ⏰ **Réveil intelligent** : déclenchement du réveil pendant une phase de sommeil léger dans une fenêtre définie.
* 💤 **Détection du sommeil** : détection automatique de l’endormissement et des réveils nocturnes.
* 📊 **Analyse des cycles** : estimation des cycles de ~90 min via les mouvements et sons ambiants.
* 📱 **Tableau de bord** : affichage des statistiques de sommeil (durée, qualité, interruptions).
* ⚙️ **Personnalisation** : réglages de sensibilité, sons d’alarme, thèmes et intégration avec montres connectées (BLE).
<!-- * 🔒 **Respect de la vie privée** : traitement local des données avec consentement explicite et possibilité de suppression complète. -->


## 🧠 Technologies utilisées

* **Langage :** Python 3.10+
* **Frameworks :** [Kivy](https://kivy.org/) & [KivyMD](https://kivymd.readthedocs.io/) pour l’interface.
* **Capteurs & API :** [Plyer](https://plyer.readthedocs.io/) pour l’accès multiplateforme aux capteurs.
<!-- * **Traitement des données :** NumPy, SciPy (optionnel) pour le filtrage et l’extraction de caractéristiques. 

---

## 🏗️ Architecture du projet

```text
Morpheus/
│
├── main.py              # Point d’entrée de l’application Kivy
├── ui/                  # Interfaces et layouts (.kv)
├── sensors/             # Gestion des capteurs (accéléromètre, gyroscope, micro…)
├── analysis/            # Algorithmes de détection et d’estimation des cycles
├── data/                # Stockage local chiffré
└── assets/              # Icônes, sons et alarmes
```

### Fonctionnement global

1. **Acquisition :** collecte des données via Plyer (mouvements, sons, luminosité).
2. **Prétraitement :** filtrage et extraction de caractéristiques (variance, micro-mouvements, énergie sonore).
3. **Détection :** modèle heuristique ou ML léger pour classer les états de sommeil.
4. **Estimation des cycles :** détection des motifs récurrents pour estimer les cycles (~90 min).
5. **Réveil intelligent :** déclenchement du réveil au moment optimal dans la fenêtre définie.
6. **Interface utilisateur :** affichage des résultats, tendances et qualité du sommeil.

---

## 🧩 Installation

```bash
# Cloner le dépôt
git clone https://github.com/<votre-utilisateur>/Morpheus.git
cd Morpheus

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate sous Windows

# Installer les dépendances
pip install -r requirements.txt
```

### Exemple de `requirements.txt`

```text
kivy>=2.2.0
kivymd>=1.2.0
plyer>=2.1.0
numpy
scipy
```

Lancer l’application :

```bash
python main.py
```

---

## 📱 Utilisation

1. Lancez **Morpheus**.
2. Définissez votre **heure de réveil cible** et la **fenêtre de réveil** (ex. 30 minutes).
3. Placez votre téléphone à proximité du lit (surface plane, micro dégagé).
4. Appuyez sur **Démarrer le suivi du sommeil**.
5. Morpheus analysera les mouvements et sons pour estimer les phases et vous réveiller au moment optimal.

---

## 🧮 Algorithme (concept général)

* **Fenêtrage temporel :** analyse des données par tranches de 30–60 secondes.
* **Extraction de caractéristiques :** variance des mouvements, énergie sonore, rythme respiratoire estimé.
* **Classification :** combinaison de règles simples et d’un petit modèle ML.
* **Suivi des cycles :** adaptation progressive selon les habitudes de l’utilisateur.
* **Déclenchement :** réveil activé si la probabilité de sommeil léger dépasse un seuil pendant la fenêtre.

---

## 🧠 Feuille de route

| Phase                     | Objectifs                                                                                |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| **MVP (0–3 mois)**        | Capture des capteurs (Android), heuristiques simples, UI basique et réveil fonctionnel.  |
| **v1 (3–6 mois)**         | Intégration d’un modèle ML, calibration utilisateur, support iOS, statistiques avancées. |
| **v2 (6–12 mois)**        | Intégration montres connectées / BLE, optimisation énergétique, meilleure UX.            |
| **Production (12+ mois)** | Publication, synchronisation cloud optionnelle, retours utilisateurs.                    |
-->
<!--
---

## 🔐 Vie privée & éthique

* Données traitées **localement** par défaut.
* Consentement explicite pour chaque capteur utilisé.
* Option pour **supprimer ou exporter les données** à tout moment.
* **Transparence totale** sur les données collectées et leur usage.
* **Avertissement :** Morpheus **n’est pas un dispositif médical** et ne doit pas être utilisé à des fins de diagnostic.

---

## 🧑‍💻 Contributeurs

* **Chef de projet :** [Votre nom]
* **Équipe :** Équipe Morpheus

---

## 📄 Licence

Projet sous licence **MIT** — voir le fichier [LICENSE](LICENSE) pour plus d’informations.

---

*Créé avec ❤️ par l’équipe Morpheus — 2025*
-->