Aerium — Capteur CO₂ & Qualité de l'air


Surveillance intelligente de la qualité de l’air — Développée en Python & Kivy

Aerium est une application qui se connecte à un capteur de CO₂ physique pour afficher en temps réel la qualité de l’air, informer l’utilisateur lorsque le niveau devient mauvais, et permettre de configurer des alertes personnalisées.
Idéale pour surveiller l’aération d’une chambre, d’une salle de classe, d’un bureau ou d’un atelier.

🚀 Fonctionnalités principales

🌬️ Mesure en temps réel du CO₂ via un capteur externe (MH-Z19B, SCD30…)

📊 Indicateurs de qualité de l’air

< 800 ppm : Bon

800–1200 ppm : Moyen

1200 ppm : Mauvais — Aérer

🔔 Alertes personnalisées

Seuil CO₂ modifiable

Notifications visuelles ou sonores

📱 Interface fluide en Kivy/KivyMD

Écran principal avec indicateur couleur

Écran réglages (seuil, fréquence de mise à jour)

📈 Graphique en direct (optionnel)

💾 Historique local (optionnel)

🧠 Technologies utilisées

Langage : Python 3.10+

Framework UI :

Kivy

KivyMD

Matériel :

Capteur CO₂ (ex : MH-Z19B / SCD30)

Connexion via UART / USB / I2C

Communication :

Serial (pyserial)

Données :

SQLite (optionnel)

🏗️ Architecture du projet
Aerium/
│
├── main.py                  # Point d’entrée Kivy
├── ui/                      # Interfaces .kv + widgets
│   ├── home.kv
│   └── settings.kv
│
├── sensors/                 # Connexion & lecture du capteur CO₂
│   └── co2_reader.py
│
├── core/                    # Logique interne
│   ├── analyzer.py          # Qualité de l'air, niveaux, alertes
│   └── config.py            # Gestion des réglages
│
├── data/                    # Historique local (optionnel)
│   └── history.db
│
└── assets/                  # Icônes, sons d’alertes

⚙️ Fonctionnement global

Acquisition : lecture continue du capteur (ppm)

Analyse : classification des niveaux (bon/moyen/mauvais)

Alertes : déclenchement si le seuil configuré est dépassé

Interface : mise à jour en temps réel dans Kivy

Historique : enregistrement périodique (optionnel)

🧩 Installation
# Cloner le dépôt
git clone https://github.com/<votre-utilisateur>/Aerium.git
cd Aerium

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate sous Windows

# Installer les dépendances
pip install -r requirements.txt

Exemple de requirements.txt
kivy>=2.2.0
kivymd>=1.2.0
pyserial>=3.5


Lancer l’application :

python main.py

📱 Utilisation

Connectez le capteur CO₂ à votre ordinateur.

Ouvrez Aerium.

Choisissez le port série du capteur (si l'app l'intègre).

Sur l’écran d’accueil, surveillez :

valeur en ppm

couleur → qualité

Configurez vos alertes dans l’onglet réglages.

Aérez si un message d’alerte apparaît.

🧮 Logique de classification

< 800 ppm → Air sain

800–1200 ppm → Air modérément chargé

1200 ppm → Qualité mauvaise → ouvrir la fenêtre

Déclenchement d’alerte si valeur > seuil utilisateur durant X secondes

🧠 Feuille de route
Phase	Objectifs
MVP	Lecture capteur + UI simple + indicateur couleur
v1.0	Réglages des seuils + alertes sonores/visuelles
v1.1	Graphique live + historique local
v2.0	Optimisation, support multiplateforme, meilleur design
📄 Licence

Projet sous licence MIT — voir le fichier LICENSE.
