with open(r'C:\Users\andre\OneDrive\Documentos\gaiensespt\scripts\comp_single_inserts.sql', encoding='utf-8') as f:
    sql = f.read()

statements = [s.strip() for s in sql.split(';') if s.strip()]

batch_size = 40
batches = []
for i in range(0, len(statements), batch_size):
    batch = statements[i:i+batch_size]
    combined = ';\n'.join(batch) + ';'
    fn = rf'C:\Users\andre\OneDrive\Documentos\gaiensespt\scripts\comp_final_batch_{i//batch_size+1}.sql'
    with open(fn, 'w', encoding='utf-8') as f:
        f.write(combined)
    batches.append(combined)
    print(f'Batch {i//batch_size+1}: {len(batch)} rows, {len(combined)} chars')

print(f'\nTotal: {len(batches)} batches')
