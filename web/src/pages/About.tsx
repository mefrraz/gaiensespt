import { ArrowLeft, Instagram, Code, Database, RefreshCw, ExternalLink } from 'lucide-react'

function About() {
    return (
        <div className="max-w-xl mx-auto space-y-5 pb-24 px-3">
            <div className="flex items-center justify-between pt-3">
                <button onClick={() => window.history.back()} className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    <ArrowLeft size={22} />
                </button>
                <span className="text-xs font-bold tracking-widest uppercase text-zinc-500">SOBRE</span>
                <div className="w-10" />
            </div>

            {/* Intro */}
            <div className="glass-card p-6 flex flex-col items-center text-center animate-fade-in">
                <div className="w-20 h-20 bg-gaia-yellow rounded-full flex items-center justify-center mb-4 shadow-lg shadow-yellow-500/20">
                    <Code size={32} className="text-black" />
                </div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Gaienses App</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xs">
                    A forma mais rápida de acompanhar os resultados do FC Gaia Basquetebol.
                </p>
            </div>

            {/* Creator */}
            <div className="glass-card p-6 animate-slide-up">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Criador</h3>
                <div className="flex items-start gap-4">
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">André Ferraz</h2>
                        <p className="text-sm text-gaia-yellow font-medium mb-3">Atleta do FC Gaia & Criador dos Gaienses</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                            "Desenvolvi esta aplicação para facilitar a visualização dos jogos e resultados do nosso clube. Instala como App para teres tudo à mão!"
                        </p>
                        <a href="https://www.instagram.com/gaiensespt" target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-white/10 text-xs font-bold text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-white/20 transition-colors">
                            <Instagram size={14} />
                            @gaiensespt
                        </a>
                    </div>
                </div>
            </div>

            {/* Como Funciona */}
            <div className="glass-card p-6 animate-slide-up">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <RefreshCw size={12} />
                    Como Funciona
                </h3>
                <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-white/5 rounded-xl">
                        <div className="w-6 h-6 rounded-full bg-gaia-yellow/20 flex items-center justify-center text-[11px] font-bold text-gaia-yellow shrink-0 mt-0.5">1</div>
                        <div>
                            <p className="text-sm font-bold text-zinc-900 dark:text-white">Buscamos os dados</p>
                            <p className="text-xs text-zinc-500 mt-0.5">Quando visitas o site, a app pede os jogos diretamente ao site da FPB (Federação Portuguesa de Basquetebol).</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-white/5 rounded-xl">
                        <div className="w-6 h-6 rounded-full bg-gaia-yellow/20 flex items-center justify-center text-[11px] font-bold text-gaia-yellow shrink-0 mt-0.5">2</div>
                        <div>
                            <p className="text-sm font-bold text-zinc-900 dark:text-white">Guardamos em cache</p>
                            <p className="text-xs text-zinc-500 mt-0.5">Os dados ficam guardados temporariamente (15 minutos). O próximo visitante vê os resultados sem esperar.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-white/5 rounded-xl">
                        <div className="w-6 h-6 rounded-full bg-gaia-yellow/20 flex items-center justify-center text-[11px] font-bold text-gaia-yellow shrink-0 mt-0.5">3</div>
                        <div>
                            <p className="text-sm font-bold text-zinc-900 dark:text-white">Sempre atualizado</p>
                            <p className="text-xs text-zinc-500 mt-0.5">Se os dados tiverem mais de 15 minutos, a app atualiza automaticamente sempre que alguém entra.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Source */}
            <div className="glass-card p-6 animate-slide-up">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Database size={12} />
                    Fonte dos Dados
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
                    Os dados são obtidos diretamente do site oficial da <strong>Federação Portuguesa de Basquetebol (FPB)</strong>.
                    Incluem jogos, resultados e horários de todas as equipas do FC Gaia.
                </p>
                <a href="https://www.fpb.pt" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gaia-yellow hover:text-black dark:hover:text-white transition-colors">
                    <ExternalLink size={12} />
                    Visitar FPB.pt
                </a>
            </div>

            {/* Tech Stack */}
            <div className="glass-card p-6 animate-slide-up">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Code size={12} />
                    Tecnologias
                </h3>
                <div className="flex flex-wrap gap-2">
                    {['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Supabase', 'Vercel', 'PWA'].map(tech => (
                        <span key={tech} className="px-2.5 py-1 text-[10px] font-bold bg-zinc-100 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 rounded-full">{tech}</span>
                    ))}
                </div>
            </div>

            {/* Features */}
            <div className="glass-card p-6 animate-slide-up">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Funcionalidades</h3>
                <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                    {[
                        'Resultados atualizados automaticamente',
                        'Agenda completa de jogos',
                        'Localização dos pavilhões (GPS)',
                        'Instalável como App (PWA)',
                        'Funciona offline com dados em cache'
                    ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gaia-yellow rounded-full shrink-0" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default About
