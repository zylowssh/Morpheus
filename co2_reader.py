'''
Fichier pour tester l'app sans capteur de co2
'''
import random
import time

def fake_read_co2():
    """
    Simule une valeur de CO₂ entre 400 et 2000 ppm.
    """
    return random.randint(400, 2000)


def get_air_quality(ppm):
    """
    Retourne une classification de la qualité de l'air en fonction du ppm.
    """
    if ppm < 800:
        return "Bon"
    elif ppm < 1200:
        return "Moyen"
    else:
        return "Mauvais"


def alert_needed(ppm, threshold=1200):
    """
    Retourne True si le ppm dépasse le seuil d'alerte défini.
    Par défaut : 1200 ppm.
    """
    return ppm > threshold


if __name__ == "__main__":
    import time
    while True:
        ppm = fake_read_co2()
        quality = get_air_quality(ppm)
        alert = alert_needed(ppm)

        print(f"CO₂ : {ppm} ppm | Qualité : {quality} | Alerte : {alert}")
        time.sleep(1)
