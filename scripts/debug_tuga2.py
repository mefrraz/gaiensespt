import re
html = open(r'C:\Users\andre\OneDrive\Documentos\gaiensespt\scripts\tuga_test.html', encoding='utf-8').read()
# Find season links 
seasons = re.findall(r'href="[^"]*seasonId=(\d+)[^"]*"[^>]*>([^<]+)', html)
seen = {}
for sid, label in seasons:
    lbl = label.strip()
    if lbl not in seen:
        seen[lbl] = sid
        print(f'Season ID {sid} -> {lbl}')
# Competition count
comp_count = len(re.findall(r'competitionId[=/](\d+)', html))
print(f'\nTotal competitionId references: {comp_count}')
