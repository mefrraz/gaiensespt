import os, json, requests, time
from bs4 import BeautifulSoup
from supabase import create_client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

AJAX_URL = "https://www.fpb.pt/wp-admin/admin-ajax.php"

MONTHS_PT = {
    "JAN": 1, "FEV": 2, "MAR": 3, "ABR": 4, "MAI": 5, "JUN": 6,
    "JUL": 7, "AGO": 8, "SET": 9, "OUT": 10, "NOV": 11, "DEZ": 12,
}

WEEKDAYS_PT = [
    "domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado",
    "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira",
    "sábado", "domingo",
]


def slugify(s):
    import re
    s = s.lower().strip()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s_-]+", "-", s)
    return re.sub(r"^-+|-+$", "", s)


def parse_date_pt(date_str):
    if not date_str:
        return None
    cleaned = date_str.replace(",", "").strip().upper()
    parts = cleaned.split()
    parts = [p for p in parts if p.lower() not in WEEKDAYS_PT]
    if len(parts) < 3:
        return None
    try:
        day = int(parts[0])
    except ValueError:
        return None
    month = MONTHS_PT.get(parts[1])
    if not month:
        return None
    try:
        year = int(parts[2])
    except ValueError:
        return None
    return f"{year}-{month:02d}-{day:02d}"


def fetch_and_parse(epoca, clube, competicao=None):
    params = {
        "action": "get_more_days",
        "epoca": epoca,
        "escalao": "Sénior",
        "genero": "masculino",
        "period[time_option]": "fromInit",
        "period[from_date]": f"{epoca[:4]}/09/01",
        "period[to_date]": f"20{epoca[5:7]}/07/31",
    }
    if clube:
        params["clube"] = clube
    if competicao:
        params["competicao[]"] = competicao

    query = "&".join(f"{k}={v}" for k, v in params.items())
    url = f"{AJAX_URL}?{query}"

    print(f"Fetching: {url[:120]}...")
    resp = requests.get(url, headers={
        "User-Agent": "FCGaia-Bot/1.0"
    }, timeout=30)
    data = resp.json()
    html = data.get("result", "")
    return parse_html(html, epoca)


def parse_html(html, epoca):
    soup = BeautifulSoup(html, "html.parser")
    games = []

    for dw in soup.select(".day-wrapper"):
        date_el = dw.select_one("h3.date")
        date_str = date_el.get_text(strip=True) if date_el else ""
        iso_date = parse_date_pt(date_str)
        if not iso_date:
            continue

        for link in dw.select("a.game-wrapper-a"):
            href = link.get("href", "")
            internal_id = ""
            if "internalID=" in href:
                internal_id = href.split("internalID=")[1].split("&")[0]
            if not internal_id:
                continue

            # Time
            hour_el = link.select_one(".hour h3")
            hour_text = hour_el.get_text(strip=True) if hour_el else ""
            normalized = hour_text.replace("H", ":").strip()
            hora = normalized if normalized else ""

            # Teams: first .team-container = home, second = away
            team_containers = link.select(".team-container")
            home_el = team_containers[0] if len(team_containers) > 0 else None
            away_el = team_containers[1] if len(team_containers) > 1 else None

            home_name = ""
            if home_el:
                fn = home_el.select_one(".fullName")
                sigla = home_el.select_one(".sigla")
                home_name = (fn.get_text(strip=True) if fn else "") or (sigla.get_text(strip=True) if sigla else "")
            away_name = ""
            if away_el:
                fn = away_el.select_one(".fullName")
                sigla = away_el.select_one(".sigla")
                away_name = (fn.get_text(strip=True) if fn else "") or (sigla.get_text(strip=True) if sigla else "")

            # Logos
            home_logo = home_el.select_one(".image-container img")["src"] if home_el and home_el.select_one(".image-container img") else None
            away_logo = away_el.select_one(".image-container img")["src"] if away_el and away_el.select_one(".image-container img") else None

            # Competition: format "Sénior Masculino | 1ª Divisão Masculina"
            comp_el = link.select_one(".competition span")
            comp_text = comp_el.get_text(strip=True) if comp_el else ""
            escalao = ""
            competicao = ""
            if "|" in comp_text:
                parts = comp_text.split("|")
                escalao = parts[0].strip()
                competicao = parts[1].strip() if len(parts) > 1 else ""
            else:
                competicao = comp_text

            # Location
            loc_el = link.select_one(".location-wrapper b")
            local = loc_el.get_text(strip=True) if loc_el else None

            s = slugify(home_name)
            sa = slugify(away_name)
            game_slug = f"{iso_date}-{s}-{sa}"

            games.append({
                "id": internal_id,
                "slug": game_slug,
                "data": iso_date,
                "hora": hora,
                "equipa_casa": home_name,
                "equipa_fora": away_name,
                "resultado_casa": None,
                "resultado_fora": None,
                "escalao": escalao,
                "competicao": competicao,
                "local": local,
                "logotipo_casa": home_logo,
                "logotipo_fora": away_logo,
                "status": "AGENDADO",
                "epoca": epoca,
                "updated_at": "now()",
            })

    return games


def main():
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Missing SUPABASE_URL or SUPABASE_KEY env vars")
        return

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    epoca = "2025/2026"
    table = "games_2025_2026"

    print(f"Fetching {epoca} for clube=119...")
    games = fetch_and_parse(epoca, clube=119)

    if not games:
        print("No games found.")
        return

    print(f"Upserting {len(games)} games to {table}...")
    for i in range(0, len(games), 50):
        chunk = games[i:i+50]
        result = supabase.table(table).upsert(
            chunk, on_conflict="slug"
        ).execute()
        print(f"  Chunk {i//50 + 1}: {len(chunk)} rows")
        time.sleep(0.5)

    print("Done.")


if __name__ == "__main__":
    main()
