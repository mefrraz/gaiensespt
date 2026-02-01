import { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'
import { Link } from 'react-router-dom'

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function PWAInstallBanner() {
    const [showBanner, setShowBanner] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

    useEffect(() => {
        // Check if already installed or dismissed
        const isInstalled = window.matchMedia('(display-mode: standalone)').matches
        const isDismissed = localStorage.getItem('pwa-banner-dismissed')
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

        if (isInstalled || isDismissed || !isMobile) {
            return
        }

        // Listen for beforeinstallprompt (Android Chrome)
        const handleBeforeInstall = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            setShowBanner(true)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstall)

        // For iOS, show banner anyway (manual install)
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
        if (isIOS) {
            setShowBanner(true)
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
        }
    }, [])

    const handleInstall = async () => {
        if (deferredPrompt) {
            await deferredPrompt.prompt()
            const result = await deferredPrompt.userChoice
            if (result.outcome === 'accepted') {
                setShowBanner(false)
            }
            setDeferredPrompt(null)
        }
    }

    const handleDismiss = () => {
        localStorage.setItem('pwa-banner-dismissed', 'true')
        setShowBanner(false)
    }

    if (!showBanner) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-gaia-yellow text-black safe-area-bottom">
            <div className="max-w-md mx-auto flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shrink-0">
                        <Download size={20} className="text-gaia-yellow" />
                    </div>
                    <div>
                        <p className="text-sm font-bold">Instalar GaiensesPT</p>
                        <p className="text-xs opacity-80">Adiciona ao ecrã inicial</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {deferredPrompt ? (
                        <button
                            onClick={handleInstall}
                            className="px-4 py-2 bg-black text-gaia-yellow text-xs font-bold rounded-lg"
                        >
                            Instalar
                        </button>
                    ) : (
                        <Link
                            to="/install"
                            className="px-4 py-2 bg-black text-gaia-yellow text-xs font-bold rounded-lg"
                        >
                            Como?
                        </Link>
                    )}
                    <button
                        onClick={handleDismiss}
                        className="p-2 hover:bg-black/10 rounded-lg transition-colors"
                        aria-label="Fechar"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PWAInstallBanner
