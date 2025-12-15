# **Aerium — Capteur CO₂ & Qualité de l'air**

### *Surveillance intelligente de la qualité de l’air — Développée en Python & Kivy*

Aerium est une application permettant de surveiller en temps réel la qualité de l’air grâce à un capteur de CO₂ physique. Elle affiche les valeurs instantanément, informe l’utilisateur lorsque l’air devient mauvais, et permet de définir des alertes personnalisées.
Idéale pour surveiller une chambre, salle de classe, bureau ou atelier.

---

## 🚀 **Fonctionnalités principales**

### 🌬️ Mesure en temps réel du CO₂

Compatible avec les capteurs : **MH-Z19B, SCD30, …**

### 📊 Indicateurs de qualité de l’air

| Niveau CO₂ (ppm) | Qualité         |
| ---------------- | --------------- |
| **< 800 ppm**    | Bon             |
| **800–1200 ppm** | Moyen           |
| **> 1200 ppm**   | Mauvais — Aérer |

### 🔔 Alertes personnalisées

* Seuil CO₂ modifiable
* Notifications visuelles et/ou sonores

### 📱 Interface fluide (Kivy / KivyMD)

* Écran principal avec indicateur couleur
* Écran réglages : seuil + fréquence de mise à jour

### 📈 Graphique en direct *(optionnel)*

### 💾 Historique local *(optionnel)*

---

## 🧠 **Technologies utilisées**

* **Langage :** Python 3.10+
* **Framework UI :** Kivy / KivyMD
* **Matériel :** capteurs CO₂ (MH-Z19B, SCD30…)
* **Connexion :** UART / USB / I2C
* **Communication :** `pyserial`
* **Données :** SQLite *(optionnel)*

---

## 🏗️ **Architecture du projet**

```
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
```

---

## ⚙️ **Fonctionnement global**

1. **Acquisition :** lecture continue du capteur (ppm)
2. **Analyse :** classification des niveaux (bon / moyen / mauvais)
3. **Alertes :** déclenchement si le seuil configuré est dépassé
4. **Interface :** mise à jour en temps réel dans Kivy
5. **Historique :** enregistrement périodique *(optionnel)*

---

## 🧩 **Installation**

```bash
# Cloner le dépôt
git clone https://github.com/<votre-utilisateur>/Aerium.git
cd Aerium

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate sous Windows

# Installer les dépendances
pip install -r requirements.txt
```

### Exemple de `requirements.txt`

```
kivy>=2.2.0
kivymd>=1.2.0
pyserial>=3.5
```

### Lancer l’application :

```bash
python main.py
```

---

## 🌐 **Version Web — WebApp Flask**

Aerium peut également être déployé en tant que **WebApp** pour visualiser la qualité de l’air depuis un navigateur. La version Flask permet de consulter les mesures en temps réel et d’afficher les graphiques interactifs.

### ⚙️ **Installation & Lancement**

1. Lancer l’application Flask :

```bash
python site/app.py
```

4. Ouvrir votre navigateur à l’adresse :

```
http://127.0.0.1:5000
```
---

## 📱 **Utilisation**

1. Connectez le capteur CO₂ à votre ordinateur.
2. Ouvrez **Aerium**.
3. Sélectionnez le port série (si l’app le propose).
4. Sur l’écran d’accueil, surveillez :
   * valeur CO₂ (ppm)
   * indicateur couleur
5. Configurez vos seuils d’alerte dans l’onglet *Réglages*.
6. Aérez si une alerte apparaît.

---

## 🧮 **Logique de classification**

* **< 800 ppm** → Air sain
* **800–1200 ppm** → Air modérément chargé
* **> 1200 ppm** → Qualité mauvaise → ouvrir la fenêtre

**Alerte :** déclenchée si la valeur dépasse le seuil utilisateur durant *X secondes*.

---

## 🧠 **Feuille de route**

| Phase    | Objectifs                                        |
| -------- | ------------------------------------------------ |
| **MVP**  | Lecture capteur + UI simple + indicateur couleur |
| **v1.0** | Réglages des seuils + alertes sonores/visuelles  |
| **v1.1** | Graphique live + historique local                |
| **v2.0** | Optimisation, multiplateforme, nouveau design    |

---

## 📄 Licence

Projet sous **Licence MIT** — voir le fichier `LICENSE`.
