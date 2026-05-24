import json
import re
import unicodedata
import sys

with open(r'C:\Users\andre\OneDrive\Documentos\gaiensespt\fpb_clubes_completo.json', encoding='utf-8') as f:
    clubs = json.load(f)

def slugify(text):
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('ascii')
    text = re.sub(r'[^a-z0-9\s-]', '', text.lower())
    text = re.sub(r'[\s]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')

def escape_sql(s):
    return s.replace("'", "''")

used_slugs = {}
values_list = []

for c in clubs:
    cid = c['id']
    name = c['nome_curto'].strip()
    full = c['nome_completo'].strip()
    color = c['cor_fundo'].strip()
    logo = (c.get('logo_url') or '').strip()

    base_slug = slugify(name)
    if base_slug in used_slugs:
        base_slug = f"{base_slug}-{cid}"
    used_slugs[base_slug] = True

    search_name = slugify(full)
    logo_val = f"'{escape_sql(logo)}'" if logo else 'NULL'
    color_val = f"'{escape_sql(color)}'" if color else 'NULL'

    values_list.append(
        f"({cid}, '{escape_sql(name)}', '{base_slug}', '{search_name}', {color_val}, {logo_val})"
    )

# Generate SQL in batches of 50
batch_size = 50
total = len(values_list)
batches = []

for i in range(0, total, batch_size):
    batch = values_list[i:i+batch_size]
    values_str = ',\n'.join(batch)
    sql = f"""INSERT INTO clubs (id, name, slug, search_name, primary_color, logo_url)
VALUES
{values_str}
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  primary_color = EXCLUDED.primary_color,
  logo_url = COALESCE(EXCLUDED.logo_url, clubs.logo_url);"""
    batches.append(sql)

# Write batches to a file
with open(r'C:\Users\andre\OneDrive\Documentos\gaiensespt\scripts\club_batches.sql', 'w', encoding='utf-8') as f:
    for idx, b in enumerate(batches):
        f.write(f"-- BATCH {idx+1}/{len(batches)}\n")
        f.write(b)
        f.write('\n\n')

print(f"Generated {len(batches)} batches for {total} clubs")
print(f"SQL written to scripts/club_batches.sql")

# Print summary
dup_ids = [c['id'] for c in clubs if slugify(c['nome_curto'].strip()) in 
           {slugify(c2['nome_curto'].strip()) for c2 in clubs if c2 != c and slugify(c2['nome_curto'].strip()) == slugify(c['nome_curto'].strip())}]
if dup_ids:
    print(f"Warning: potential slug duplicates for IDs: {dup_ids}")
else:
    print("No slug duplicates detected")
