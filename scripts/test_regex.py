import re
html = open(r'C:\Users\andre\OneDrive\Documentos\gaiensespt\scripts\tuga_test.html', encoding='utf-8').read()
matches = re.findall(r'href="[^"]*competitionId[=\/](\d+)[^"]*"\s+title="([^"]*)"', html)
seen = set()
for cid, cname in matches:
    key = cid + '-' + cname
    if key not in seen:
        seen.add(key)
        print(f'ID={cid}: {cname[:60]}')
print(f'\nTotal: {len(seen)}')
