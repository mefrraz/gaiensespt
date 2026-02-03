import { ArrowLeft, Instagram, Code, Database, Clock, ExternalLink } from 'lucide-react'
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
                                André Ferraz
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

                {/* Data Source Info - NEW */}
                <div className="glass-card p-6">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Database size={12} />
                        Fonte dos Dados
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                                De onde vêm os resultados?
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                                Os dados são obtidos automaticamente do site oficial da <strong>Federação Portuguesa de Basquetebol (FPB)</strong>.
                                Incluem jogos, resultados, horários e localizações de todas as equipas do FC Gaia.
                            </p>
                            <a
                                href="https://www.fpb.pt"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-gaia-yellow hover:text-black dark:hover:text-white transition-colors"
                            >
                                <ExternalLink size={12} />
                                Visitar FPB.pt
                            </a>
                        </div>
                    </div>
                </div>

                {/* Update Schedule - NEW */}
                <div className="glass-card p-6">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Clock size={12} />
                        Quando Atualiza?
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                                Horário de Atualização Automática
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                                O sistema verifica novos resultados automaticamente várias vezes ao dia:
                            </p>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 shrink-0"></div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Segunda a Quinta</p>
                                        <p className="text-xs text-gray-500">12:00, 19:00 e 23:00</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 shrink-0"></div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Sexta-feira</p>
                                        <p className="text-xs text-gray-500">Das 17:00 à meia-noite, a cada 30 minutos</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-gaia-yellow/10 border border-gaia-yellow/20 rounded-lg">
                                    <div className="w-2 h-2 bg-gaia-yellow rounded-full mt-1.5 shrink-0"></div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Sábado e Domingo</p>
                                        <p className="text-xs text-gray-500">Das 09:00 à meia-noite, a cada 30 minutos</p>
                                        <p className="text-[10px] text-gaia-yellow font-medium mt-1">Resultados quase em tempo real!</p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 mt-4 italic">
                                * Horários em hora de Portugal Continental
                            </p>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="glass-card p-6">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                        Funcionalidades
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gaia-yellow rounded-full"></span>
                            Resultados atualizados automaticamente
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
                            Adicionar jogos ao calendário
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gaia-yellow rounded-full"></span>
                            Funciona offline (PWA)
                        </li>
                    </ul>
                </div>

            </div>
        </div>
    )
}

export default About
