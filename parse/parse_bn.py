from pymarc import MARCReader
import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MARC_FILE = os.path.join(BASE_DIR, "data", "bibs-all.marc")
OUTPUT_FILE = os.path.join(BASE_DIR, "data", "bn_translations_all.csv")

records = []
count = 0

with open(MARC_FILE, "rb") as f:
    reader = MARCReader(f)
    for record in reader:
        if count % 50000 == 0:
            print(f"Processed {count} records, found {len(records)} translations...")
        count += 1

        try:
            # filter by publication language: Polish only
            lang = record["008"].data[35:38] if record["008"] else None
            if lang != "pol":
                continue

            # get language of original — only present in translated works
            f041 = record["041"]
            lang_orig = f041["h"] if f041 and f041["h"] else None
            if not lang_orig or lang_orig == "pol":
                continue

            # publication year from fixed field 008, positions 7-11
            year = record["008"].data[7:11] if record["008"] else None

            records.append({
                "year": year,
                "title": str(record.title or ""),
                "author": str(record.author or ""),
                "publisher": str(record.publisher or ""),
                "lang_original": lang_orig,
            })

        except Exception:
            continue

df = pd.DataFrame(records)
print(f"\nDone. Total translations found: {len(df)}")
print("\nTop 20 source languages:")
print(df["lang_original"].value_counts().head(20))

df.to_csv(OUTPUT_FILE, index=False, encoding="utf-8")
print(f"\nSaved to {OUTPUT_FILE}")