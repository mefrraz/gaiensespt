import { ArrowLeft, Instagram, Code } from 'lucide-react'
import { Link } from 'react-router-dom'

function About() {
    return (
        <div className="max-w-xl mx-auto pb-12">

            {/* Nav */}
            <div className="flex items-center justify-between mb-8">
                <Link to="/" className="p-2 -ml-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <div className="text-xs font-bold tracking-widest uppercase text-gray-500">
                    SOBRE
                </div>
                <div className="w-10"></div>
            </div>

            <div className="space-y-6">

                {/* Intro Card */}
                <div className="glass-card p-6 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-gaia-yellow rounded-full flex items-center justify-center mb-4 shadow-lg shadow-yellow-500/20">
                        <Code size={32} className="text-black" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Gaienses App
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs">
                        A forma mais rápida e bonita de acompanhar os resultados do FC Gaia Basquetebol.
                    </p>
                </div>

                {/* Creator Info */}
                <div className="glass-card p-6">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                        Criador
                    </h3>
                    <div className="flex items-start gap-4">
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                Frraz
                            </h2>
                            <p className="text-sm text-gaia-yellow font-medium mb-3">
                                Atleta do FC Gaia & Criador dos Gaienses
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                                "Desenvolvi esta aplicação para facilitar a visualização dos jogos e resultados do nosso clube. Instala como App para teres tudo à mão!"
                            </p>

                            <div className="flex gap-3">
                                <a href="https://www.instagram.com/gaiensespt" target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/10 text-xs font-bold text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
                                    <Instagram size={14} />
                                    @gaiensespt
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features / PWA Note */}
                <div className="glass-card p-6">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                        Funcionalidades
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gaia-yellow rounded-full"></span>
                            Resultados em tempo real (LIVE)
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gaia-yellow rounded-full"></span>
                            Agenda completa de jogos
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gaia-yellow rounded-full"></span>
                            Localização dos pavilhões (GPS)
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gaia-yellow rounded-full"></span>
                            Instalável como App (PWA)
                        </li>
                    </ul>
                </div>

                {/* Footer */}
                <div className="text-center pt-8 pb-4">
                    <p className="text-xs text-gray-400">
                        Não oficial • Feito com 💛 para o FC Gaia
                    </p>
                </div>

            </div>
        </div>
    )
}

export default About
