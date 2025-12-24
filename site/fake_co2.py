# fake_co2.py
import random
from database import get_db

def generate_co2(realistic=True, base=500):
    if realistic:
        drift = random.uniform(-30, 50)
        value = base + drift
    else:
        value = random.randint(400, 2000)

    return int(max(400, min(2000, value)))

def save_reading(ppm: int):
    db = get_db()
    db.execute(
        "INSERT INTO co2_readings (ppm) VALUES (?)",
        (ppm,)
    )
    db.commit()
    db.close()
