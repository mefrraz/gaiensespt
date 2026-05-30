-- Tabela de metadados das competições — TODAS as ligas do FPB
CREATE TABLE IF NOT EXISTS competitions_meta (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    abrev TEXT NOT NULL,
    gradient_from TEXT NOT NULL DEFAULT 'from-dribly-purple',
    gradient_to TEXT NOT NULL DEFAULT 'to-purple-700',
    logo_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE competitions_meta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access competitions_meta"
ON competitions_meta FOR SELECT
USING (true);

INSERT INTO competitions_meta (id, name, abrev, gradient_from, gradient_to, logo_url) VALUES

-- 🏀 MASCULINO
(10902, 'Liga Betclic Masculina', 'LBM',       'from-blue-600',  'to-blue-800',    'https://sav2.fpb.pt/uploads/provas/logotipos/logo109021756223004.png'),
(10903, 'Proliga', 'PL',                       'from-emerald-500','to-emerald-700', 'https://sav2.fpb.pt/uploads/provas/logotipos/logo109031756223029.png'),
(10904, '1ª Divisão Masculina', '1DM',         'from-amber-500',  'to-orange-700',  'https://sav2.fpb.pt/uploads/provas/logotipos/logo109041756223053.png'),
(10905, '2ª Divisão Masculina', '2DM',         'from-red-500',    'to-red-700',     'https://sav2.fpb.pt/uploads/provas/logotipos/logo109051756223078.png'),
(10909, 'Liga BCR', 'BCR',                     'from-indigo-500', 'to-indigo-700',  'https://sav2.fpb.pt/uploads/provas/logotipos/logo109091756223122.png'),
(10910, 'Liga Masters DHIKA Masculina', 'LMM', 'from-slate-500',  'to-slate-700',   'https://sav2.fpb.pt/uploads/provas/logotipos/logo109101761214989.jpg'),
(10912, 'Taça de Portugal Skoiy', 'TPS',       'from-orange-500', 'to-orange-700',  'https://sav2.fpb.pt/uploads/provas/logotipos/logo109121769093633.png'),
(10914, 'Taça de Portugal BCR', 'TPB',         'from-stone-500',  'to-stone-700',   'https://sav2.fpb.pt/uploads/provas/logotipos/logo109141758451570.png'),
(10917, 'Taça Hugo dos Santos', 'THS',         'from-yellow-500', 'to-yellow-700',  'https://sav2.fpb.pt/uploads/provas/logotipos/logo109171758528108.png'),
(10919, 'Supertaça Mário Saldanha', 'SMS',     'from-amber-600',  'to-amber-800',   'https://sav2.fpb.pt/uploads/provas/logotipos/logo109191758528167.png'),
(10921, 'Supertaça BCR', 'SBC',                'from-emerald-600','to-emerald-800',  'https://sav2.fpb.pt/uploads/provas/logotipos/logo109211758528296.png'),
(10955, 'FIBA World Cup 2027 Qualifiers', 'WCQ','from-gray-700',  'to-gray-900',    'https://sav2.fpb.pt/uploads/provas/logotipos/logo109551758473901.png'),
(10957, 'Basketball Champions League', 'BCL',   'from-yellow-700','to-yellow-900',  'https://sav2.fpb.pt/uploads/provas/logotipos/logo109571758390603.png'),
(10958, 'FIBA Europe Cup', 'FEC',              'from-blue-700',  'to-blue-900',    'https://sav2.fpb.pt/uploads/provas/logotipos/logo109581758451316.png'),
(10974, 'Jogos Preparação Masculino', 'JPM',   'from-zinc-500',  'to-zinc-700',    'https://sav2.fpb.pt/uploads/provas/logotipos/logo109741758451196.png'),
(10976, 'Jogos Preparação BCR', 'JPB',         'from-lime-500',  'to-lime-700',    'https://sav2.fpb.pt/uploads/provas/logotipos/logo109761758451443.png'),
(11078, 'CNT Ponte de Sor', 'CPS',             'from-sky-500',   'to-sky-700',     'https://sav2.fpb.pt/uploads/provas/logotipos/logo110781759766686.png'),
(11160, 'Campeonato Nacional Sub18 Masculinos', 'S18M','from-cyan-600','to-cyan-800','https://sav2.fpb.pt/uploads/provas/logotipos/logo111601779285085.png'),
(11162, 'Taça Nacional Sub18 Masculinos', 'TS18M','from-sky-600', 'to-sky-800',    'https://sav2.fpb.pt/uploads/provas/logotipos/logo111621779285135.png'),
(11164, 'Campeonato Nacional Sub16 Masculinos', 'S16M','from-teal-600','to-teal-800','https://sav2.fpb.pt/uploads/provas/logotipos/logo111641779719721.png'),
(11166, 'Taça Nacional Sub16 Masculinos', 'TS16M','from-green-600','to-green-800',  'https://sav2.fpb.pt/uploads/provas/logotipos/logo111661779739255.png'),
(11168, 'Campeonato Nacional Sub14 Masculinos', 'S14M','from-lime-600','to-lime-800','https://sav2.fpb.pt/uploads/provas/logotipos/logo111681779806476.png'),
(11174, 'Festa do Basquetebol Juvenil U16', 'FBU16','from-green-500','to-green-700','https://sav2.fpb.pt/uploads/provas/logotipos/logo111741774607861.png'),
(11176, 'Festa do Basquetebol Juvenil U14', 'FBU14','from-teal-500','to-teal-700', 'https://sav2.fpb.pt/uploads/provas/logotipos/logo111761774608141.png'),

-- 🏀 FEMININO
(10906, 'Liga Betclic Feminina', 'LBF',         'from-pink-500',  'to-rose-600',    'https://sav2.fpb.pt/uploads/provas/logotipos/logo109061756223100.png'),
(10907, '1ª Divisão Feminina', '1DF',           'from-violet-500','to-purple-700',  'https://sav2.fpb.pt/uploads/provas/logotipos/logo109071756223151.png'),
(10908, '2ª Divisão Feminina', '2DF',           'from-teal-500',  'to-teal-700',    'https://sav2.fpb.pt/uploads/provas/logotipos/logo109081756223176.png'),
(10911, 'Liga Masters DHIKA Feminina', 'LMF',   'from-pink-400',  'to-pink-600',    'https://sav2.fpb.pt/uploads/provas/logotipos/logo109111761215012.jpg'),
(10913, 'Taça de Portugal Feminina', 'TPF',     'from-red-400',   'to-red-600',     'https://sav2.fpb.pt/uploads/provas/logotipos/logo109131769366285.png'),
(10918, 'Taça Federação Marsh', 'TF',           'from-lime-500',  'to-lime-700',    'https://sav2.fpb.pt/uploads/provas/logotipos/logo109181767357583.png'),
(10920, 'Supertaça Feminina', 'SF',             'from-cyan-500',  'to-cyan-700',    'https://sav2.fpb.pt/uploads/provas/logotipos/logo109201758528191.png'),
(10956, 'FIBA Womens Eurobasket 2027', 'FEW',   'from-rose-700',  'to-rose-900',    'https://sav2.fpb.pt/uploads/provas/logotipos/logo109561758474176.png'),
(10959, 'EuroCup Women', 'ECW',                 'from-fuchsia-500','to-fuchsia-700','https://sav2.fpb.pt/uploads/provas/logotipos/logo109591758451351.png'),
(10975, 'Jogos Preparação Feminino', 'JPF',     'from-zinc-400',  'to-zinc-600',    'https://sav2.fpb.pt/uploads/provas/logotipos/logo109751758451214.png'),
(11079, 'CAR Jamor', 'CAR',                     'from-sky-500',   'to-sky-700',     'https://sav2.fpb.pt/uploads/provas/logotipos/logo110791759766701.png'),
(11159, 'Campeonato Nacional Sub18 Femininos', 'S18F','from-rose-600','to-rose-800','https://sav2.fpb.pt/uploads/provas/logotipos/logo111591779206358.png'),
(11161, 'Taça Nacional Sub18 Femininos', 'TS18F','from-pink-600', 'to-pink-800',   'https://sav2.fpb.pt/uploads/provas/logotipos/logo111611779284568.png'),
(11163, 'Campeonato Nacional Sub16 Femininos', 'S16F','from-fuchsia-600','to-fuchsia-800','https://sav2.fpb.pt/uploads/provas/logotipos/logo111631779805842.png'),
(11165, 'Taça Nacional Sub16 Femininos', 'TS16F','from-violet-600','to-violet-800', 'https://sav2.fpb.pt/uploads/provas/logotipos/logo111651779720619.png'),
(11173, 'Festa do Basquetebol Juvenil U16W', 'FBW16','from-emerald-500','to-emerald-700','https://sav2.fpb.pt/uploads/provas/logotipos/logo111731774301635.png'),
(11175, 'Festa do Basquetebol Juvenil U14W', 'FBW14','from-teal-500','to-teal-700','https://sav2.fpb.pt/uploads/provas/logotipos/logo111751774607878.png'),
(11416, 'Circuito Mega Ticha', 'MGT',           'from-yellow-400','to-yellow-600', 'https://sav2.fpb.pt/uploads/provas/logotipos/logo114161778861349.png')

-- Sem logo na FPB (fallback abreviatura)
INSERT INTO competitions_meta (id, name, abrev, gradient_from, gradient_to) VALUES
    (10915, 'Taça de Portugal Masters DHIKA Masculina', 'TPMM','from-amber-700','to-amber-900'),
    (10916, 'Taça de Portugal Masters DHIKA Feminina', 'TPMF','from-rose-700','to-rose-900'),
    (10922, 'Supertaça Masters DHIKA Masculina', 'SMM', 'from-amber-800','to-amber-950'),
    (10923, 'Supertaça Masters DHIKA Feminina', 'SMF',  'from-rose-800','to-rose-950'),
    (11167, 'Campeonato Nacional Sub14 Femininos', 'S14F','from-fuchsia-600','to-fuchsia-800'),
    (11169, 'Taça Nacional Sub14 Femininos', 'TS14F','from-pink-600','to-pink-800'),
    (11170, 'Taça Nacional Sub14 Masculinos', 'TS14M','from-cyan-600','to-cyan-800'),
    (11171, 'Taça Nacional Seniores Femininos', 'TSF', 'from-rose-500','to-rose-700'),
    (11172, 'Taça Nacional Seniores Masculinos', 'TSM', 'from-sky-500','to-sky-700'),
    (11383, 'Taça Nacional BCR', 'TBCR', 'from-indigo-600','to-indigo-800')
ON CONFLICT (id) DO NOTHING;

-- ⚠️ As seguintes NÃO têm logo na FPB (mostram ícone trophy.svg):
-- 10915 Taça de Portugal Masters DHIKA Masculina
-- 10916 Taça de Portugal Masters DHIKA Feminina
-- 10922 Supertaça Masters DHIKA Masculina
-- 10923 Supertaça Masters DHIKA Feminina
-- 11167 Campeonato Nacional Sub14 Femininos
-- 11169 Taça Nacional Sub14 Femininos
-- 11170 Taça Nacional Sub14 Masculinos
-- 11171 Taça Nacional Seniores Femininos
-- 11172 Taça Nacional Seniores Masculinos
-- 11383 Taça Nacional BCR
-- 10910 etc (sem logo_src)

ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    abrev = EXCLUDED.abrev,
    logo_url = EXCLUDED.logo_url;
