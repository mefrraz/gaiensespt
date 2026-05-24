import urllib.request, re

url = 'https://resultados.tugabasket.com/competitions?associationId=1&seasonId=64'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req, timeout=15).read().decode('utf-8', errors='replace')

# Save HTML to file for inspection
with open(r'C:\Users\andre\OneDrive\Documentos\gaiensespt\scripts\tuga_test.html', 'w', encoding='utf-8') as f:
    f.write(html)

print(f'HTML length: {len(html)}')

# Find all links
links = re.findall(r'<a[^>]*href="([^"]*)"[^>]*>([^<]*)</a>', html, re.I)
for href, text in links:
    text = text.strip()
    if text and ('competition' in href.lower() or len(text) > 3):
        print(f'{href} -> {text}')

# Find competition links specifically
comps = re.findall(r'competitionId[\\=](\d+)', html)
print(f'\ncompetitionId patterns: {comps[:20]}')

# Also find seasonId patterns
seasons = re.findall(r'seasonId[\\=](\d+)', html)
print(f'seasonId patterns: {seasons[:10]}')
