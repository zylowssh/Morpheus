'''
Fichier pour tester l'app sans capteur de co2
'''
import random
import time

def fake_read_co2():
    # Simule une valeur CO₂ entre 400 et 2000 ppm
    return random.randint(400, 2000)

if __name__ == "__main__":
    while True:
        print(fake_read_co2())
        time.sleep(1)
