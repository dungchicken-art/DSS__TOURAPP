import numpy as np


def _normalize_weights(weights, default_weights):
    weights = np.array(weights, dtype=float)
    total = weights.sum()
    if total > 0:
        return weights / total
    return default_weights


def build_decision_matrix(tours, user_input):
    """Build a filtered decision matrix and corresponding metadata."""

    budget_limit = user_input.get("budget")
    day_limit = user_input.get("days")
    min_rating = user_input.get("min_rating")
    region_filter = (user_input.get("region") or "").strip().lower()
    season_filter = (user_input.get("season") or "").strip().lower()
    type_filter = (user_input.get("tour_type") or "").strip().lower()

    filtered = []
    for tour in tours:
        if budget_limit is not None and budget_limit > 0 and tour["price"] > budget_limit:
            continue
        if day_limit is not None and day_limit > 0 and tour["days"] > day_limit:
            continue
        if min_rating is not None and min_rating > 0 and tour["rating"] < min_rating:
            continue
        if region_filter and tour.get("region", "").strip().lower() != region_filter:
            continue
        if season_filter and season_filter not in tour.get("season", "").strip().lower():
            continue
        if type_filter and type_filter not in tour.get("tour_type", "").strip().lower():
            continue
        filtered.append(tour)

    matrix = []
    for tour in filtered:
        matrix.append(
            [
                tour["price"],
                tour["days"],
                tour["rating"],
                tour["attraction"],
            ]
        )

    matrix = np.array(matrix, dtype=float)

    default_weights = np.array([0.35, 0.15, 0.3, 0.2], dtype=float)
    weights = default_weights

    custom_weights = user_input.get("weights")
    if isinstance(custom_weights, dict):
        raw_weights = [
            custom_weights.get("price", 0),
            custom_weights.get("days", 0),
            custom_weights.get("rating", 0),
            custom_weights.get("attraction", 0),
        ]
        weights = _normalize_weights(raw_weights, default_weights)
    elif isinstance(custom_weights, (list, tuple)) and len(custom_weights) == 4:
        weights = _normalize_weights(custom_weights, default_weights)

    crit_types = ["min", "min", "max", "max"]

    return filtered, matrix, weights, crit_types


def saw_score(matrix, weights, crit_types):
    """Compute SAW scores for each alternative."""
    if matrix.size == 0:
        return np.array([])

    normalized = np.zeros_like(matrix, dtype=float)

    for idx, crit_type in enumerate(crit_types):
        column = matrix[:, idx]
        if crit_type == "max":
            denom = column.max()
            normalized[:, idx] = column / denom if denom != 0 else 0
        else:
            denom = column.min()
            normalized[:, idx] = denom / column if denom != 0 else 0

    weighted = normalized * weights
    return weighted.sum(axis=1)


def topsis_score(matrix, weights, crit_types):
    """Compute TOPSIS scores for each alternative."""
    if matrix.size == 0:
        return np.array([])

    norm_factor = np.sqrt((matrix ** 2).sum(axis=0))
    norm_factor[norm_factor == 0] = 1
    normalized = matrix / norm_factor

    weighted = normalized * weights

    ideal_best = np.zeros(matrix.shape[1])
    ideal_worst = np.zeros(matrix.shape[1])

    for idx, crit_type in enumerate(crit_types):
        column = weighted[:, idx]
        if crit_type == "max":
            ideal_best[idx] = column.max()
            ideal_worst[idx] = column.min()
        else:
            ideal_best[idx] = column.min()
            ideal_worst[idx] = column.max()

    dist_best = np.sqrt(((weighted - ideal_best) ** 2).sum(axis=1))
    dist_worst = np.sqrt(((weighted - ideal_worst) ** 2).sum(axis=1))

    scores = dist_worst / (dist_best + dist_worst)
    scores = np.nan_to_num(scores)
    return scores


def rank_tours(tours, user_input):
    filtered, matrix, weights, crit_types = build_decision_matrix(tours, user_input)
    method = user_input.get("method", "saw")

    if matrix.size == 0:
        return []

    if method == "topsis":
        scores = topsis_score(matrix, weights, crit_types)
    else:
        scores = saw_score(matrix, weights, crit_types)

    for tour, score in zip(filtered, scores):
        tour["score"] = float(score)

    filtered.sort(key=lambda x: x["score"], reverse=True)
    return filtered
