import requests
from bs4 import BeautifulSoup

url = "https://www.fpb.pt/calendario/clube_119/"
headers = {"User-Agent": "Mozilla/5.0"}
res = requests.get(url, headers=headers)
soup = BeautifulSoup(res.content, "html.parser")

# Find the first game item
game = soup.select_one(".game-schedule-item")
if game:
    print(game.prettify())
else:
    print("No game item found")
