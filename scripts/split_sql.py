with open(r'C:\Users\andre\OneDrive\Documentos\gaiensespt\scripts\comp_all.sql', encoding='utf-8') as f:
    content = f.read()

parts = content.split(';')
parts = [p.strip() + ';' for p in parts if p.strip()]

for i, sql in enumerate(parts):
    fn = rf'C:\Users\andre\OneDrive\Documentos\gaiensespt\scripts\comp_mega_{i+1}.sql'
    with open(fn, 'w', encoding='utf-8') as f:
        f.write(sql)
    print(f'Part {i+1}: {len(sql)} chars')
