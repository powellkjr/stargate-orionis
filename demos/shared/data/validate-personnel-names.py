"""Validate the authored personnel manifest; run from any working directory."""

import json
from pathlib import Path


def main():
    data_dir = Path(__file__).resolve().parent
    manifest = json.loads((data_dir / "personnel-names.json").read_text(encoding="utf-8"))
    classes = json.loads((data_dir / "base-classes.json").read_text(encoding="utf-8"))
    pools = manifest["pools"]
    class_ids = {entry["id"] for entry in classes}
    if set(pools) != class_ids or set(manifest["provenance"]["references"]) != class_ids:
        raise ValueError("Pools and provenance references must cover exactly the base classes.")
    nickname_provenance = manifest["nicknameProvenance"]
    if set(nickname_provenance["styleBriefs"]) != class_ids:
        raise ValueError("Nickname style briefs must cover exactly the base classes.")
    if not nickname_provenance.get("prompt") or not nickname_provenance.get("method"):
        raise ValueError("Missing nickname authoring instructions.")
    seen_nicknames = set()
    seen_first = set()
    total = 0
    for class_id, pool in pools.items():
        reference = manifest["provenance"]["references"][class_id]
        if not reference.get("url") or not reference.get("styleBrief"):
            raise ValueError(f"Missing source URL or style brief for {class_id}.")
        nicknames = pool["nicknames"]
        if not nickname_provenance["styleBriefs"][class_id]:
            raise ValueError(f"Missing nickname style brief for {class_id}.")
        if not isinstance(nicknames, list) or len(nicknames) < 16:
            raise ValueError(f"Expected at least 16 nicknames for {class_id}.")
        for nickname in nicknames:
            if not isinstance(nickname, str) or not nickname or nickname != nickname.strip():
                raise ValueError(f"Invalid nickname in {class_id}.")
            if nickname.casefold() in seen_nicknames:
                raise ValueError(f"Duplicate nickname: {nickname}.")
            seen_nicknames.add(nickname.casefold())
        for part in ("first", "last"):
            names = pool[part]
            if not isinstance(names, list) or len(names) < 16:
                raise ValueError(f"Expected at least 16 names in {class_id}.{part}.")
            if any(not isinstance(n, str) or not n or n != n.strip() for n in names):
                raise ValueError(f"Invalid name in {class_id}.{part}.")
            normalized = {name.casefold() for name in names}
            if len(normalized) != len(names):
                raise ValueError(f"Duplicate name in {class_id}.{part}.")
            if part == "first":
                if seen_first & normalized:
                    raise ValueError(f"Given names reused across classes: {class_id}.")
                seen_first.update(normalized)
            total += len(names)
    population_ids = {"scions", "concord", "clp", "independent_a", "independent_b", "independent_c"}
    population_pools = manifest["populationPools"]
    provenance = manifest["populationProvenance"]
    if set(population_pools) != population_ids or set(provenance["references"]) != population_ids:
        raise ValueError("Population pools and references must cover all six populations.")
    if not provenance.get("prompt") or not provenance.get("method"):
        raise ValueError("Missing population authoring instructions.")
    seen_population_names = set()
    for population_id, pool in population_pools.items():
        reference = provenance["references"][population_id]
        if not reference.get("generatorPools") or not reference.get("rationale"):
            raise ValueError(f"Missing population source mapping: {population_id}.")
        names = pool["names"]
        if not isinstance(names, list) or len(names) < 16:
            raise ValueError(f"Expected at least 16 names in {population_id}.")
        for name in names:
            if not isinstance(name, str) or not name or name != name.strip():
                raise ValueError(f"Invalid population name: {population_id}.")
            if name.casefold() in seen_population_names:
                raise ValueError(f"Duplicate population name: {name}.")
            seen_population_names.add(name.casefold())
    print(f"PASS: {len(pools)} professions, {len(seen_nicknames)} unique nicknames, "
          "complete authoring instructions.")
    print(f"PASS: {len(population_pools)} populations, "
          f"{len(seen_population_names)} unique display names, complete source mapping.")
    print(f"PASS: {len(pools)} professions, {total} name components, "
          f"{len(seen_first)} unique given names, complete source mapping.")


if __name__ == "__main__":
    main()
