# ProjetNSI

 
**Objectif final** : Nous voulons développer une application mobile qui utilise les capteurs du téléphone pour détecter si une personne dort et, grâce à une estimation des cycles de sommeil, déterminer le moment optimal pour la réveiller.
L’objectif est de fournir à l’utilisateur un réveil « intelligent » qui améliore la sensation de repos.

Tout ça en python.

METHODE D’ORGANISATION : Méthode Agile

### UGO (Frontend, design) : Concevoir l’interface mobile :
- Page d’accueil (lancer le suivi).
- Écran de suivi en direct (affichage état, chrono, heure prévue réveil).
- Écran de résumé du sommeil (graphique simple).
- Design simple et intuitif (priorité à la lisibilité).
- Intégrer l’alarme (affichage + sonnerie).

### MOHAMED (Backend, serveur) : Développer la partie serveur :
- API pour recevoir les données capteurs.
- Traitement simple des données (détection sommeil/éveil).
- Stockage (BDD légère : SQLite, PostgreSQL ou MongoDB).
- Assurer la communication front ↔ back (API REST/GraphQL).

### ADAM (Développeur principal) :
- Implémenter la récupération des capteurs (accéléromètre du téléphone).
- Préparer l’envoi des données en continu vers le back-end.
- Développer l’algorithme de détection sommeil/éveil (analyse de variance des mouvements sur des fenêtres de 30s).
- Collaborer avec Mohamed pour intégrer la logique côté serveur.

### AMOR ( développeur, manager) :
- Superviser l’avancée du projet, organiser les réunions et vérifier que chacun  avance.
- Définir les priorités de développement (MVP d’abord, puis ajout des cycles).
- Développer avec Adam la partie calcul des cycles de sommeil et la logique du réveil intelligent.
- Tester l’application avec le reste de l’équipe et rédiger la documentation utilisateur.


## Programme :
### SEMAINE 1 :
- Adam → récup capteurs.
- Mohamed → setup serveur et API.
- Ugo → maquette interface.
- Amor → cahier des charges + organisation + recuperer info du tel micro etc






