with open(r'C:\Users\andre\OneDrive\Documentos\gaiensespt\scripts\comp_all.sql', encoding='utf-8') as f:
    sql = f.read()

# Split into individual INSERT statements
import re
statements = re.split(r';\s*(?=INSERT)', sql)
statements = [s.strip() + ';' for s in statements if s.strip()]

for i, stmt in enumerate(statements):
    # Extract VALUES
    values_match = re.search(r'VALUES\s*(.*?)(?:\s*ON CONFLICT|;)', stmt, re.DOTALL)
    if not values_match:
        continue
    
    values_str = values_match.group(1)
    # Simple dedup: track (id, season) pairs
    seen = set()
    deduped = []
    # Parse rows (they're parenthesized)
    rows = re.findall(r'\(([^)]+)\)', values_str)
    for r in rows:
        parts = r.split(',')
        if len(parts) >= 5:
            cid = parts[0].strip()
            season_raw = parts[4].strip().strip("'")
            key = f'{cid}-{season_raw}'
            if key not in seen:
                seen.add(key)
                deduped.append(r)
    
    if len(deduped) != len(rows):
        print(f'Statement {i+1}: removed {len(rows) - len(deduped)} duplicates out of {len(rows)}')
    
    # Reconstruct INSERT
    new_values = ',\n'.join(f'({r})' for r in deduped)
    new_stmt = stmt.replace(values_match.group(1), new_values)
    
    fn = rf'C:\Users\andre\OneDrive\Documentos\gaiensespt\scripts\comp_dedup_{i+1}.sql'
    with open(fn, 'w', encoding='utf-8') as f:
        f.write(new_stmt)
    print(f'Written stmt {i+1}: {len(deduped)} rows')
