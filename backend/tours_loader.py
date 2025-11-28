import csv
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "tours.csv"


def load_tours():
    tours = []
    with open(DATA_PATH, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            row["price"] = float(row["price"])
            row["days"] = int(row["days"])
            row["rating"] = float(row["rating"])
            row["attraction"] = float(row["attraction"])
            row["region"] = row.get("region", "").strip()
            row["season"] = row.get("season", "").strip()
            row["tour_type"] = row.get("tour_type", "").strip()
            tours.append(row)
    return tours
