# re-she-to

An interactive data story exploring translation flows in the Polish book market (2000–2025).  
Who gets translated? Whose voices reach Polish readers — and whose don't?

![resheto demo](demo.gif)

🔗 [ni4yja.github.io/re-she-to](https://ni4yja.github.io/re-she-to/)

---

## Data source

[Biblioteka Narodowa](https://data.bn.org.pl) — open bibliographic database (MARC21 format).

## Reproduce the dataset

1. Download `bibs-all.marc` from https://data.bn.org.pl/databases/bibs-all.marc (~9.5 GB)
2. Place it in the `data/` folder
3. Install dependencies: `pip install -r parse/requirements.txt`
4. Run: `python parse/parse_bn.py`

Output: `data/bn_translations_all.csv` and `data/bn_translations_2000_2025.csv`

Then run: `python parse/prepare_viz_data.py`

Output: JSON files in `data/`

## Tech stack

- Vue 3 (CDN, no build step)
- D3.js
- Vanilla JS

## Built by

[Liuba Kuibida](https://liubuntu.tech) · [LinkedIn](https://www.linkedin.com/in/liuba-kuibida/)