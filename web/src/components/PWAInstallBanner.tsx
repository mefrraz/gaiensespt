import { useState, useEffect } from 'react'
import { Download, Share2 } from 'lucide-react'
import { Link } from 'react-router-dom'

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function PWAInstallBanner() {
    const [showBanner, setShowBanner] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [dismissed, setDismissed] = useState(false)

    useEffect(() => {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
        if (isStandalone) return

        const isDismissed = localStorage.getItem('pwa-banner-dismissed')
        if (isDismissed) return

        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
        if (!isMobile) return

        const handleBeforeInstall = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            setShowBanner(true)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstall)

        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
        if (isIOS) {
            const timer = setTimeout(() => setShowBanner(true), 3000)
            return () => {
                clearTimeout(timer)
                window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
            }
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
        }
    }, [])

    useEffect(() => {
        if (showBanner) setDismissed(false)
    }, [showBanner])

    const handleInstall = async () => {
        if (deferredPrompt) {
            await deferredPrompt.prompt()
            const result = await deferredPrompt.userChoice
            if (result.outcome === 'accepted') {
                localStorage.setItem('pwa-banner-dismissed', 'true')
                setShowBanner(false)
            }
            setDeferredPrompt(null)
        }
    }

    const handleDismiss = () => {
        setDismissed(true)
        setTimeout(() => {
            localStorage.setItem('pwa-banner-dismissed', 'true')
            setShowBanner(false)
        }, 200)
    }

    if (!showBanner) return null

    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
                    dismissed ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
                onClick={handleDismiss}
            />

            {/* Bottom Sheet */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 rounded-t-3xl shadow-2xl transition-transform duration-300 ${
                    dismissed ? 'translate-y-full' : 'translate-y-0'
                }`}
            >
                <div className="w-10 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mt-3" />

                <div className="p-5 sm:p-6 text-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-gaia-yellow to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
                        <Download size={26} className="text-white" />
                    </div>

                    <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-1.5">
                        Instalar GaiensesPT
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5 max-w-xs mx-auto leading-relaxed">
                        Adiciona ao ecrã inicial para acesso rápido a jogos, resultados e classificações do FC Gaia.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
                        {deferredPrompt && !isIOS ? (
                            <button
                                onClick={handleInstall}
                                className="px-6 py-3 bg-gaia-yellow text-black text-sm font-bold rounded-xl hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/20"
                            >
                                Instalar App
                            </button>
                        ) : isIOS ? (
                            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3.5 text-left flex items-start gap-3 max-w-xs mx-auto">
                                <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                    <Share2 size={14} className="text-zinc-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Como instalar no iPhone</p>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                        Toca no botão <span className="font-bold">Partilhar</span> do Safari e escolhe <span className="font-bold">"Adicionar ao Ecrã Principal"</span>
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <Link
                                to="/install"
                                onClick={handleDismiss}
                                className="px-6 py-3 bg-gaia-yellow text-black text-sm font-bold rounded-xl hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/20"
                            >
                                Ver instruções
                            </Link>
                        )}

                        <button
                            onClick={handleDismiss}
                            className="px-4 py-3 text-sm font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                        >
                            Agora não
                        </button>
                    </div>
                </div>

                <div className="h-6 safe-area-bottom" />
            </div>
        </>
    )
}

export default PWAInstallBanner
