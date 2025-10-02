<style>
    red{
        color: red;
    }
</style>

# ProjetNSI

 
**Objectif final** : Nous voulons développer une application mobile qui utilise les capteurs du téléphone pour détecter si une personne dort et, grâce à une estimation des cycles de sommeil, déterminer le moment optimal pour la réveiller.
L’objectif est de fournir à l’utilisateur un réveil « intelligent » qui améliore la sensation de repos.

Tout ça en python.

METHODE D’ORGANISATION : Méthode Agile

<red>ROUGE</red> = Prioritaire

### UGO (Frontend, design) : Concevoir l’interface mobile :
- <red>Page d’accueil (lancer le suivi).</red>
- <red>Écran de suivi en direct (affichage état, chrono, heure prévue réveil).</red>
- Écran de résumé du sommeil (graphique simple).
- Design simple et intuitif (priorité à la lisibilité).
- Intégrer l’alarme (affichage + sonnerie).

### MOHAMED (Backend, serveur) : Développer la partie serveur :
- <red>API pour recevoir les données capteurs.</red>
- <red>Traitement simple des données (détection sommeil/éveil).</red>
- Stockage (BDD légère : SQLite, PostgreSQL ou MongoDB).
- Assurer la communication front ↔ back (API REST/GraphQL).

### ADAM (Développeur principal) :
- <red>Implémenter la récupération des capteurs (accéléromètre du téléphone).</red>
- Préparer l’envoi des données en continu vers le back-end.
- <red>Développer l’algorithme de détection sommeil/éveil (analyse de variance des mouvements sur des fenêtres de 30s).</red>
- Collaborer avec Mohamed pour intégrer la logique côté serveur.

### AMOR ( développeur, manager) :
- <red>Superviser l’avancée du projet, organiser les réunions et vérifier que chacun  avance.</red>
- <red>Définir les priorités de développement (MVP d’abord, puis ajout des cycles).</red>
- Développer avec Adam la partie calcul des cycles de sommeil et la logique du réveil intelligent.
- Tester l’application avec le reste de l’équipe et rédiger la documentation utilisateur.



SEMAINE 1 :
- Adam → récup capteurs.
- Mohamed → setup serveur et API.
- Ugo → maquette interface.
- Amor → cahier des charges + organisation + recuperer info du tel micro etc






