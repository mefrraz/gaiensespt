import { ArrowLeft, Smartphone } from 'lucide-react'
import { Link } from 'react-router-dom'

function Install() {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    const isAndroid = /Android/i.test(navigator.userAgent)

    return (
        <div className="max-w-xl mx-auto pb-12">

            {/* Nav */}
            <div className="flex items-center justify-between mb-8">
                <Link to="/" className="p-2 -ml-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <div className="text-xs font-bold tracking-widest uppercase text-zinc-500">
                    INSTALAR APP
                </div>
                <div className="w-10"></div>
            </div>

            <div className="space-y-6">

                {/* Intro */}
                <div className="glass-card p-6 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-gaia-yellow rounded-full flex items-center justify-center mb-4 shadow-lg shadow-yellow-500/20">
                        <Smartphone size={32} className="text-black" />
                    </div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                        Instalar GaiensesPT
                    </h1>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xs">
                        Adiciona a app ao teu ecrã inicial para acesso rápido, mesmo offline!
                    </p>
                </div>

                {/* iOS Instructions */}
                {(isIOS || !isAndroid) && (
                    <div className="glass-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-zinc-100 dark:bg-white/10 rounded-lg flex items-center justify-center">
                                <span className="text-lg">🍎</span>
                            </div>
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                                iPhone / iPad (Safari)
                            </h3>
                        </div>
                        <ol className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                            <li className="flex gap-3">
                                <span className="w-6 h-6 bg-gaia-yellow text-black rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                                <span>Abre o site no <strong>Safari</strong> (não funciona no Chrome)</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="w-6 h-6 bg-gaia-yellow text-black rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                                <span>Toca no ícone de <strong>Partilhar</strong> (quadrado com seta para cima)</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="w-6 h-6 bg-gaia-yellow text-black rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                                <span>Desliza para baixo e toca em <strong>"Adicionar ao Ecrã Principal"</strong></span>
                            </li>
                            <li className="flex gap-3">
                                <span className="w-6 h-6 bg-gaia-yellow text-black rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
                                <span>Confirma tocando em <strong>"Adicionar"</strong></span>
                            </li>
                        </ol>
                    </div>
                )}

                {/* Android Instructions */}
                {(isAndroid || !isIOS) && (
                    <div className="glass-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 bg-zinc-100 dark:bg-white/10 rounded-lg flex items-center justify-center">
                                <span className="text-lg">🤖</span>
                            </div>
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                                Android (Chrome)
                            </h3>
                        </div>
                        <ol className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                            <li className="flex gap-3">
                                <span className="w-6 h-6 bg-gaia-yellow text-black rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                                <span>Abre o site no <strong>Chrome</strong></span>
                            </li>
                            <li className="flex gap-3">
                                <span className="w-6 h-6 bg-gaia-yellow text-black rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                                <span>Toca nos <strong>3 pontos</strong> (menu) no canto superior direito</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="w-6 h-6 bg-gaia-yellow text-black rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                                <span>Seleciona <strong>"Adicionar ao ecrã inicial"</strong> ou <strong>"Instalar app"</strong></span>
                            </li>
                            <li className="flex gap-3">
                                <span className="w-6 h-6 bg-gaia-yellow text-black rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
                                <span>Confirma tocando em <strong>"Instalar"</strong></span>
                            </li>
                        </ol>
                    </div>
                )}

                {/* Benefits */}
                <div className="glass-card p-6">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
                        Vantagens
                    </h3>
                    <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gaia-yellow rounded-full"></span>
                            Acesso direto do ecrã inicial
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gaia-yellow rounded-full"></span>
                            Funciona offline
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gaia-yellow rounded-full"></span>
                            Experiência de app nativa
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gaia-yellow rounded-full"></span>
                            Sem ocupar espaço como uma app normal
                        </li>
                    </ul>
                </div>

            </div>
        </div>
    )
}

export default Install
