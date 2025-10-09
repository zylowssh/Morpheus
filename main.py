"""
sleep_detector_pipeline.py

Squelette pour un pipeline d'analyse de capteurs (téléphone) visant à
détecter si une personne dort ou non à partir d'un fichier de données.

But : fournir toutes les fonctions nécessaires (noms + signatures)
avec des explications claires sur ce que fait chaque fonction et
quel format d'entrée/sortie on attend.

Format attendu du fichier d'entrée (exemples) :
- CSV ou JSONL où chaque enregistrement représente un ou plusieurs échantillons.
- Exemple d'une ligne / paquet JSON attendu :
  {
    "device_id": "phone-01",
    "timestamp_start": 1690000000000,
    "sampling_rate": 50,
    "sensor": "accelerometer",
    "samples": [
      {"t":1690000000001, "x":0.01, "y":-0.02, "z":9.80},
      ...
    ]
  }

Remplis les fonctions marquées TODO avec les algos / paramètres que tu veux tester.
"""

from typing import Any, Dict, List, Tuple
import numpy as np
import pandas as pd

# ---------- I/O et parsing ----------

def load_raw_file(path: str) -> List[Dict[str, Any]]:
    """
    Charger le fichier brut (CSV, JSONL ou JSON) contenant les paquets envoyés
    depuis le téléphone et retourner une liste de paquets JSON (dicts).

    - path : chemin vers le fichier (ou dossier).
    - Retour : list de dict, chaque dict = un paquet contenant "sensor", "samples", "sampling_rate", etc.

    TODO:
    - détecter automatiquement le format (CSV vs JSONL) ou forcer un format précis,
    - valider la présence des clés attendues et normaliser les noms.
    """
    # Ex : lire JSONL ligne par ligne ou pandas.read_csv selon extension
    raise NotImplementedError


def unpack_packets_to_timeseries(packets: List[Dict[str, Any]]) -> pd.DataFrame:
    """
    Transformer la liste de paquets en une DataFrame "long format" indexée par timestamp.
    Colonnes attendues recommandées : ['t', 'sensor', 'ax','ay','az','gx','gy','gz', 'audio_feature1', ...]

    - Concatène tous les paquets, convertit les timestamps en datetime (UTC),
    - Normalise la fréquence si besoin (resampling/interpolation optionnel).
    - Retour : pd.DataFrame triée par temps avec colonnes pertinentes.
    """
    raise NotImplementedError


# ---------- Prétraitement ----------

def preprocess_timeseries(df: pd.DataFrame,sensors: List[str] = ['accelerometer','gyroscope'], resample_hz: int = 50) -> pd.DataFrame:
    """
    Prétraitement général :
    - Filtrage de base (ex : passe-bas) pour réduire le bruit,
    - Gestion des valeurs manquantes (interpolation ou forward-fill),
    - Resampling temporel à 'resample_hz' (si utile pour aligner capteurs),
    - Normalisation / centrage si nécessaire.

    - df : DataFrame crée par unpack_packets_to_timeseries.
    - sensors : liste de capteurs à conserver.
    - resample_hz : fréquence cible (Hz) pour uniformisation.
    - Retour : DataFrame prétraitée, prête pour extraction de features.
    """
    raise NotImplementedError


# ---------- Extraction de features ----------

def extract_window_features(window: pd.DataFrame) -> Dict[str, float]:
    """
    Calculer un vecteur de features pour une fenêtre temporelle donnée.
    Exemples de features utiles pour détecter le sommeil :
      - acc_rms, acc_std, acc_mean (pour ax/ay/az ou magnitude),
      - activity_index (algorithme d'actigraphie),
      - gyro_rms, gyro_std,
      - audio_rms, audio_spectral_energy (si tu fournis features audio),
      - zero_crossing_rate, etc.

    - window : DataFrame contenant les échantillons d'une fenêtre (par ex. 10s).
    - Retour : dict feature_name -> valeur (float).
    """
    raise NotImplementedError


def sliding_window(df: pd.DataFrame, window_s: float = 10.0, step_s: float = 5.0, fs: int = 50) -> List[Tuple[float, pd.DataFrame]]:
    """
    Itérer sur la DataFrame avec des fenêtres glissantes.

    - window_s : longueur de fenêtre en secondes.
    - step_s : pas entre fenêtres en secondes.
    - fs : fréquence d'échantillonnage (Hz) attendue pour conversion temps -> nombre d'échantillons.
    - Retour : liste de tuples (window_center_timestamp, window_dataframe).
    """
    raise NotImplementedError


def build_feature_matrix(df: pd.DataFrame, window_s: float = 10.0, step_s: float = 5.0, fs: int = 50) -> pd.DataFrame:
    """
    Pour tout le signal, appliquer sliding_window + extract_window_features pour construire
    une matrice de features structurée (pandas DataFrame) indexée par la timestamp de la fenêtre.

    - Retour : DataFrame où chaque ligne = fenêtre, colonnes = features.
    """
    raise NotImplementedError


# ---------- Détection sommeil / règle simple ou modèle ML ----------

def heuristic_sleep_detector(features_df: pd.DataFrame, threshold: Dict[str, float] = None) -> pd.Series:
    """
    Méthode simple basée sur heuristiques :
    - Exemple d'approche : si acc_rms < T1 pendant N fenêtres consécutives => marquer "endormissement".
    - threshold : dict optionnel avec seuils pour acc_rms, activity_index, etc.

    - Retour : pd.Series booléenne (index = window timestamp) => True = "dort", False = "éveillé".
    - Cette fonction est à remplir avec la règle que tu veux tester.
    """
    raise NotImplementedError


def ml_sleep_detector(features_df: pd.DataFrame, model: Any = None) -> pd.Series:
    """
    Interface pour détecteur basé sur un modèle ML (ex: modèle scikit-learn ou TensorFlow lite).
    - features_df : DataFrame des features.
    - model : objet de modèle pré-entraîné (ou None si tu veux charger depuis chemin).
    - Retour : pd.Series des prédictions (probabilité ou label binaire).

    NOTA : ici tu ne dois fournir que l'interface ; l'entraînement du modèle se fait séparément.
    """
    raise NotImplementedError


# ---------- Post-traitement & agrégation ----------

def aggregate_to_sleep_periods(pred_series: pd.Series, min_duration_s: float = 60.0, step_s: float = 5.0) -> List[Tuple[pd.Timestamp, pd.Timestamp]]:
    """
    Prendre la série temporelle de prédictions fenêtre -> bool et regrouper en périodes continues de sommeil.
    - min_duration_s : seuil minimum pour considérer une période comme 'vraie' (ex. 5 minutes).
    - step_s : step entre fenêtres (utile pour convertir nb fenêtres -> durée).
    - Retour : liste de tuples (start_ts, end_ts) représentant périodes de sommeil détectées.
    """
    raise NotImplementedError


def compute_sleep_metrics(periods: List[Tuple[pd.Timestamp, pd.Timestamp]]) -> Dict[str, Any]:
    """
    Calculer des métriques utiles : durée totale, nombre d'éveils, latence d'endormissement estimée,
    efficacité du sommeil (sleep efficiency), etc.

    - Retour : dict métriques (float/int).
    """
    raise NotImplementedError


# ---------- Visualisation / Export ----------

def plot_sleep_hypnogram(features_df: pd.DataFrame, pred_series: pd.Series):
    """
    Optionnel : tracer un hypnogramme simplifié (ou timeline) montrant périodes détectées de sommeil,
    niveaux d'activité (ex. acc_rms) et annotations.
    - Utiliser matplotlib / seaborn.
    """
    raise NotImplementedError


def save_results(periods: List[Tuple[pd.Timestamp, pd.Timestamp]], metrics: Dict[str, Any], out_path: str):
    """
    Sauvegarder les périodes et métriques dans un fichier JSON/CSV pour rapport.
    - out_path : chemin du dossier ou fichier de sortie.
    """
    raise NotImplementedError


# ---------- Pipeline principal (orchestrateur) ----------

def run_pipeline(input_path: str, out_dir: str,
                 window_s: float = 10.0, step_s: float = 5.0, fs: int = 50,
                 use_ml: bool = False, ml_model: Any = None):
    """
    Orchestrateur principal :
    1. load_raw_file
    2. unpack_packets_to_timeseries
    3. preprocess_timeseries
    4. build_feature_matrix
    5. choisir heuristic_sleep_detector ou ml_sleep_detector
    6. aggregate_to_sleep_periods
    7. compute_sleep_metrics
    8. plot_sleep_hypnogram + save_results

    Paramètres :
    - input_path : chemin du fichier/rep contenant les données brutes
    - out_dir : dossier de sortie pour plots / résultats
    - use_ml : si True utilise ml_sleep_detector (model obligatoire dans ml_model)
    """
    # 1) charger
    packets = load_raw_file(input_path)

    # 2) unpack
    ts = unpack_packets_to_timeseries(packets)

    # 3) preprocess
    ts_p = preprocess_timeseries(ts, resample_hz=fs)

    # 4) features
    feat = build_feature_matrix(ts_p, window_s=window_s, step_s=step_s, fs=fs)

    # 5) détection
    if use_ml:
        preds = ml_sleep_detector(feat, model=ml_model)
    else:
        preds = heuristic_sleep_detector(feat)

    # 6) agrégation
    periods = aggregate_to_sleep_periods(preds, min_duration_s=60.0, step_s=step_s)

    # 7) métriques
    metrics = compute_sleep_metrics(periods)

    # 8) export & plot
    plot_sleep_hypnogram(feat, preds)
    save_results(periods, metrics, out_path=out_dir)

    return periods, metrics


# ---------- Exécution directe (exemple d'usage) ----------

if __name__ == "__main__":
    """
    Exemple d'appel :
    python sleep_detector_pipeline.py --input data/sensors.jsonl --out results/
    """
    # TODO: parser d'arguments (argparse) si nécessaire
    INPUT = "data/sensors.jsonl"
    OUT = "results/"
    # run en mode heuristique par défaut
    periods, metrics = run_pipeline(INPUT, OUT, window_s=10.0, step_s=5.0, fs=50, use_ml=False)
    print("Périodes détectées :", periods)
    print("Métriques :", metrics)
