import random

def read_co2():
    """Return fake CO₂ value (ppm)."""
    return random.randint(400, 2000)

def air_quality(ppm: int) -> str:
    if ppm < 800:
        return "Bon"
    elif ppm < 1200:
        return "Moyen"
    return "Mauvais"

def alert(ppm: int, threshold: int = 1200) -> bool:
    return ppm > threshold
