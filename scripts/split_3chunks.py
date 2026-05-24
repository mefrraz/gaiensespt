with open(r'C:\Users\andre\OneDrive\Documentos\gaiensespt\scripts\comp_all.sql', encoding='utf-8') as f:
    sql = f.read()

# Split into 3 equal parts by byte count
part_size = len(sql) // 3
parts = []
start = 0
for i in range(3):
    if i < 2:
        # Find next "INSERT" boundary after part_size
        end = sql.rfind('INSERT INTO', start, start + part_size + 2000)
        if end > start:
            parts.append(sql[start:end])
            start = end
        else:
            parts.append(sql[start:start + part_size])
            start += part_size
    else:
        parts.append(sql[start:])

for i, p in enumerate(parts):
    fn = rf'C:\Users\andre\OneDrive\Documentos\gaiensespt\scripts\comp_chunk_{i+1}.sql'
    with open(fn, 'w', encoding='utf-8') as f:
        f.write(p)
    print(f'Chunk {i+1}: {len(p)} chars')
