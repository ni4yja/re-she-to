# re-she-to

A data project exploring translation flows in the Polish book market (2000–2025).  
Who gets translated? Whose voices reach Polish readers — and whose don't?

## Data source

[Biblioteka Narodowa](https://data.bn.org.pl) — open bibliographic database (MARC21 format).

## Reproduce the dataset

1. Download `bibs-all.marc` from https://data.bn.org.pl/databases/bibs-all.marc (~9.5 GB)
2. Place it in the `data/` folder
3. Install dependencies: `python -m pip install pymarc pandas`
4. Run: `python parse/parse_bn.py`

Output: `data/bn_translations_all.csv` (~400k records)

## Status

Work in progress.