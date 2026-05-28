const fs = require("fs");

function decodeEntities(s) {
    return s.replace(/&#(\d+);/g, (_,d) => String.fromCharCode(parseInt(d)))
            .replace(/&ccedil;/g, '\u00E7').replace(/&Ccedil;/g, '\u00C7')
            .replace(/&atilde;/g, '\u00E3').replace(/&Atilde;/g, '\u00C3')
            .replace(/&otilde;/g, '\u00F5').replace(/&Otilde;/g, '\u00D5')
            .replace(/&aacute;/g, '\u00E1').replace(/&Aacute;/g, '\u00C1')
            .replace(/&eacute;/g, '\u00E9').replace(/&Eacute;/g, '\u00C9')
            .replace(/&iacute;/g, '\u00ED').replace(/&Iacute;/g, '\u00CD')
            .replace(/&oacute;/g, '\u00F3').replace(/&Oacute;/g, '\u00D3')
            .replace(/&uacute;/g, '\u00FA').replace(/&Uacute;/g, '\u00DA')
            .replace(/&acirc;/g, '\u00E2').replace(/&ecirc;/g, '\u00EA').replace(/&ocirc;/g, '\u00F4')
            .replace(/&agrave;/g, '\u00E0').replace(/&ntilde;/g, '\u00F1')
            .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#039;/g, "'")
            .replace(/&nbsp;/g, ' ').replace(/&mdash;/g, '-').replace(/&ndash;/g, '-')
            .replace(/\s+/g, ' ').trim();
}

const raw = fs.readFileSync("C:/Users/andre/OneDrive/Documentos/gaiensespt/https___www.fpb.pt_clubes_.htm", "utf8");
let clean = raw.replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '').replace(/<a class="attribute-value"[^>]*>/g, '').replace(/<\/a>/g, '');
clean = clean.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&nbsp;/g, ' ').replace(/&mdash;/g, '-');
const blocks = clean.split('class="clube-body"');
const clubs = [];
for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    const colorMatch = block.match(/background-color:\s*([^;'><]+)/);
    if (!colorMatch) continue;
    const color = colorMatch[1].trim();
    const idMatch = (blocks[i-1] + block).match(/clube_(\d+)/);
    if (!idMatch) continue;
    const id = parseInt(idMatch[1]);
    const nameMatch = block.match(/class="clube-name"[^>]*>([\s\S]*?)<\/div>/) || block.match(/clube-name[^>]*>([^<]+)/);
    const shortMatch = block.match(/class="clube-shortname"[^>]*>([\s\S]*?)<\/div>/) || block.match(/clube-shortname[^>]*>([^<]+)/);
    const name = nameMatch ? decodeEntities((nameMatch[1] || nameMatch[2] || '').trim()) : '';
    const short = shortMatch ? decodeEntities((shortMatch[1] || shortMatch[2] || '').trim()) : name;
    const logoMatch = block.match(/img[^>]+src="([^"]+)"/);
    const logo = logoMatch ? logoMatch[1].trim() : '';
    clubs.push({ id, name, short_name: short, color, logo_url: logo || null });
}

console.log("Parsed " + clubs.length + " clubs");
let sql = "INSERT INTO clubs (id, name, search_name, slug, primary_color, logo_url) VALUES\n";
const values = clubs.map(c => {
    const isBlack = c.color === "#000000" || c.color === "#000" || c.color === "#FFFFFF";
    const pc = isBlack ? "#7C3AED" : c.color;
    const name = c.name.replace(/'/g, "''");
    const search = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/, '');
    const logo = c.logo_url ? "'" + c.logo_url.replace(/'/g, "''") + "'" : "NULL";
    return "  (" + c.id + ", '" + name + "', '" + search + "', '" + slug + "', '" + pc + "', " + logo + ")";
});
sql += values.join(",\n") + "\nON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, search_name=EXCLUDED.search_name, slug=EXCLUDED.slug, primary_color=EXCLUDED.primary_color, logo_url=EXCLUDED.logo_url;";
fs.writeFileSync("C:/Users/andre/OneDrive/Documentos/gaiensespt/scrapers/upsert_final.sql", sql, "utf8");
console.log("SQL: " + sql.length + " chars, " + clubs.length + " clubs");
