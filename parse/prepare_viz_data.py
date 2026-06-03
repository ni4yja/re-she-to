import pandas as pd
import json
import os

df = pd.read_csv('../data/bn_translations_2000_2025.csv', dtype={'year': str})

# merge duplicate MARC codes for Japanese
df['lang_original'] = df['lang_original'].replace({'jap': 'jpn'})

# filter: valid year range, exclude undefined language
df_clean = df[
    (df['lang_original'] != 'und') &
    (df['year'].str.match(r'^\d{4}$', na=False)) &
    (df['year'] >= '2000') &
    (df['year'] <= '2025')
].copy()

output_dir = '../viz/data'
os.makedirs(output_dir, exist_ok=True)

lang_names = {
    'eng': 'angielski', 'ger': 'niemiecki', 'fre': 'francuski',
    'ita': 'włoski', 'rus': 'rosyjski', 'jpn': 'japoński',
    'spa': 'hiszpański', 'swe': 'szwedzki', 'lat': 'łaciński',
    'nor': 'norweski', 'cze': 'czeski', 'ukr': 'ukraiński',
    'grc': 'starogrecki', 'kor': 'koreański', 'fin': 'fiński',
    'chi': 'chiński', 'dan': 'duński', 'hun': 'węgierski',
    'dut': 'niderlandzki', 'por': 'portugalski', 'ara': 'arabski',
    'heb': 'hebrajski', 'slo': 'słowacki', 'srp': 'serbski',
    'hrv': 'chorwacki', 'bel': 'białoruski', 'lit': 'litewski',
    'yid': 'jidysz', 'gre': 'grecki', 'cat': 'kataloński',
}

years = [str(y) for y in range(2000, 2026)]

# invalid MARC codes to exclude
invalid_codes = {'und', 'ng', 'enm', 'mul', 'zxx'}

# --- top 10 languages for 2025 bar chart ---
df_2025 = df_clean[df_clean['year'] == '2025']
total_2025 = len(df_2025)
top10_2025 = df_2025['lang_original'].value_counts().head(10)

top_langs = []
for code, count in top10_2025.items():
    by_year = df_clean[df_clean['lang_original'] == code].groupby('year').size()
    by_year_dict = {y: int(by_year.get(y, 0)) for y in years}
    top_langs.append({
        'code': code,
        'name': lang_names.get(code, code),
        'count_2025': int(count),
        'percent_2025': round(count / total_2025 * 100, 1),
        'by_year': by_year_dict
    })

with open(f'{output_dir}/top_languages.json', 'w', encoding='utf-8') as f:
    json.dump(top_langs, f, ensure_ascii=False, indent=2)
print('Saved top_languages.json')
print(pd.DataFrame([{'name': d['name'], 'percent_2025': d['percent_2025']} for d in top_langs]))

# --- top 5 languages (excl. English) for line chart 2000–2025 ---
top5_codes = ['jpn', 'fre', 'ger', 'ita', 'spa']
line_data = []
for code in top5_codes:
    by_year = df_clean[df_clean['lang_original'] == code].groupby('year').size()
    total_by_year = df_clean.groupby('year').size()
    for y in years:
        count = int(by_year.get(y, 0))
        total = int(total_by_year.get(y, 1))
        line_data.append({
            'year': y,
            'code': code,
            'name': lang_names.get(code, code),
            'count': count,
            'percent': round(count / total * 100, 2)
        })

with open(f'{output_dir}/top5_by_year.json', 'w', encoding='utf-8') as f:
    json.dump(line_data, f, ensure_ascii=False, indent=2)
print('Saved top5_by_year.json')

# --- Ukrainian vs Russian by year ---
ukr_rus = (
    df_clean[df_clean['lang_original'].isin(['ukr', 'rus'])]
    .groupby(['year', 'lang_original'])
    .size()
    .unstack(fill_value=0)
    .reset_index()
)
result_years = ukr_rus.to_dict(orient='records')

with open(f'{output_dir}/ukr_rus_by_year.json', 'w', encoding='utf-8') as f:
    json.dump(result_years, f, ensure_ascii=False, indent=2)
print('Saved ukr_rus_by_year.json')
print(ukr_rus.tail(6).to_string())

# --- top 25 and tail 5 for 2025 spectrum chart ---
lang_counts_2025 = df_2025['lang_original'].value_counts()
lang_counts_clean = lang_counts_2025[~lang_counts_2025.index.isin(invalid_codes)]

top_25 = lang_counts_clean.head(25)
remaining = lang_counts_clean.iloc[25:]

# top 25 — full list with names
top_25_result = [
    {
        'lang': code,
        'lang_name': lang_names.get(code, code),
        'total_titles': int(count)
    }
    for code, count in top_25.items()
]

# tail 5 — least translated languages with at least one clean author
tail_result = []
for lang_code in remaining.index:
    subset = df_2025[df_2025['lang_original'] == lang_code]
    authors = subset[subset['author'].notna()]['author'].tolist()
    authors_clean = [
        a.split(' Autor')[0].strip()
            for a in authors
                if 'Tłumaczenie' not in a
                    and 'Fotografie' not in a
                    and 'Recenzja' not in a
                    and 'Tekst' not in a
                    and len(a.strip()) > 3
    ]
    if not authors_clean:
        continue
    tail_result.append({
        'lang': lang_code,
        'lang_name': lang_names.get(lang_code, lang_code),
        'total_titles': int(remaining[lang_code]),
        'authors': authors_clean[:2]
    })
    if len(tail_result) == 5:
        break

with open(f'{output_dir}/languages_spectrum_2025.json', 'w', encoding='utf-8') as f:
    json.dump({'top': top_25_result, 'tail': tail_result}, f, ensure_ascii=False, indent=2)

print('Saved languages_spectrum_2025.json')
print('\nTOP 25:')
for r in top_25_result:
    print(f"  {r['lang']} ({r['lang_name']}): {r['total_titles']}")
print('\nTAIL 5:')
for r in tail_result:
    print(f"  {r['lang']} ({r['lang_name']}): {r['total_titles']} — {r['authors']}")