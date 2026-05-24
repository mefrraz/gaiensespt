sql = ''
for i in range(1, 12):
    with open(rf'C:\Users\andre\OneDrive\Documentos\gaiensespt\scripts\comp_final_batch_{i}.sql', encoding='utf-8') as f:
        sql += f.read() + '\n'

# Split into ~20KB chunks
chunk_size = 20000
chunks = []
start = 0
for _ in range(20):
    end = min(start + chunk_size, len(sql))
    if end >= len(sql):
        chunks.append(sql[start:])
        break
    # Find last INSERT boundary
    pos = sql.rfind('INSERT INTO', start, end + 1000)
    if pos > start:
        chunks.append(sql[start:pos])
        start = pos
    else:
        chunks.append(sql[start:end])
        start = end

for i, c in enumerate(chunks):
    fn = rf'C:\Users\andre\OneDrive\Documentos\gaiensespt\scripts\comp_large_chunk_{i+1}.sql'
    with open(fn, 'w', encoding='utf-8') as f:
        f.write(c)
    print(f'Chunk {i+1}: {len(c)} chars')
