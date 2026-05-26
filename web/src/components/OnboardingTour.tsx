import { useState, useEffect, useCallback } from 'react'
import { Star, Heart, ArrowRight, X, Sparkles, LogIn, UserPlus } from 'lucide-react'

export type TourTrigger = 'signup' | 'login' | 'manual'

interface TourStep {
    target: string
    title: string
    description: string
    /** Where the tooltip (label) appears relative to the target */
    position: 'top' | 'bottom' | 'left' | 'right'
    /** Icon shown in the tooltip */
    icon?: 'star' | 'heart' | 'house' | 'list'
}

const ONBOARDING_KEY = 'dribly_onboarding_done'

export function isOnboardingDone(): boolean {
    return localStorage.getItem(ONBOARDING_KEY) === 'true'
}

export function markOnboardingDone(): void {
    localStorage.setItem(ONBOARDING_KEY, 'true')
}

export function triggerOnboarding(): void {
    // Clear the flag so the next mount shows the tour
    localStorage.removeItem(ONBOARDING_KEY)
}

/** Build steps dynamically so the welcome step context can change */
function buildSteps(trigger: TourTrigger): TourStep[] {
    const steps: TourStep[] = []

    if (trigger === 'signup' || trigger === 'login') {
        steps.push({
            target: '[data-tour="welcome-step"]',
            title: trigger === 'signup' ? 'Conta criada com sucesso!' : 'Bem-vindo de volta!',
            description:
                trigger === 'signup'
                    ? 'Agora com conta podes favoritar e seguir clubes, competições e ter acesso rápido a tudo. Vamos mostrar-te como funciona.'
                    : 'Agora que iniciaste sessão, tens funcionalidades extra: favoritar clubes, segui-los e aceder rápido a eles. Vamos ver?',
            position: 'bottom',
        })
    }

    steps.push(
        {
            target: '[data-tour="favorite"]',
            title: 'Favoritar clubes',
            description:
                'Clica na estrela ⭐ para tornar um clube no teu favorito. Só podes ter um favorito de cada vez. Ele aparece no topo da navegação.',
            position: 'bottom',
            icon: 'star',
        },
        {
            target: '[data-tour="follow"]',
            title: 'Seguir clubes',
            description:
                'Com o coração ❤️ podes seguir vários clubes e vê-los todos na página Seguidos, sem perder nenhum.',
            position: 'bottom',
            icon: 'heart',
        },
        {
            target: '[data-tour="my-club"]',
            title: 'O teu clube',
            description:
                'O clube favorito aparece aqui na navegação para acesso rápido. Basta um clique para veres os jogos e classificações.',
            position: 'bottom',
            icon: 'house',
        },
        {
            target: '[data-tour="seguidos-nav"]',
            title: 'Página Seguidos',
            description:
                'Todos os clubes e competições que segues estão aqui. Também podes parar de seguir qualquer um a qualquer momento.',
            position: 'bottom',
            icon: 'list',
        },
    )

    return steps
}

interface OnboardingTourProps {
    onComplete: () => void
    trigger?: TourTrigger
}

const STEP_ICONS: Record<string, React.ReactNode> = {
    star: <Star size={16} className="text-yellow-500 fill-yellow-500" />,
    heart: <Heart size={16} className="text-red-500 fill-red-500" />,
    house: <Star size={16} className="text-dribly-purple" />,
    list: <Heart size={16} className="text-dribly-purple" />,
}

export function OnboardingTour({ onComplete, trigger = 'manual' }: OnboardingTourProps) {
    const [step, setStep] = useState(0)
    const [pos, setPos] = useState({ top: 0, left: 0, width: 0, height: 0 })
    const [visible, setVisible] = useState(false)
    const [exiting, setExiting] = useState(false)
    const [pulsePhase, setPulsePhase] = useState(0)

    const steps = buildSteps(trigger)
    const currentStep = steps[step]

    const updatePosition = useCallback(() => {
        if (!currentStep) return
        const el = document.querySelector(currentStep.target)
        if (el) {
            const r = el.getBoundingClientRect()
            setPos({ top: r.top, left: r.left, width: r.width, height: r.height })
        } else {
            // Fallback: center of screen
            setPos({ top: window.innerHeight / 2 - 20, left: window.innerWidth / 2 - 100, width: 200, height: 40 })
        }
    }, [step, trigger])

    useEffect(() => {
        const t = setTimeout(() => {
            updatePosition()
            setVisible(true)
        }, 600)
        window.addEventListener('resize', updatePosition)
        window.addEventListener('scroll', updatePosition)
        return () => {
            clearTimeout(t)
            window.removeEventListener('resize', updatePosition)
            window.removeEventListener('scroll', updatePosition)
        }
    }, [updatePosition])

    // Pulse animation cycle
    useEffect(() => {
        if (!visible || exiting) return
        const interval = setInterval(() => {
            setPulsePhase((p) => (p + 1) % 4)
        }, 600)
        return () => clearInterval(interval)
    }, [visible, exiting])

    const next = () => {
        if (step >= steps.length - 1) {
            finish()
        } else {
            setVisible(false)
            setPulsePhase(0)
            setTimeout(() => {
                setStep((s) => s + 1)
                setTimeout(() => {
                    updatePosition()
                    setVisible(true)
                }, 150)
            }, 250)
        }
    }

    const finish = () => {
        setExiting(true)
        setTimeout(() => {
            markOnboardingDone()
            onComplete()
        }, 400)
    }

    if (!currentStep) return null

    const margin = 16

    // Tooltip style based on position
    const tooltipStyle: React.CSSProperties = {}
    const arrowStyle: React.CSSProperties = {}

    if (currentStep.position === 'bottom') {
        tooltipStyle.top = pos.top + pos.height + margin
        tooltipStyle.left = pos.left + pos.width / 2
        tooltipStyle.transform = 'translateX(-50%)'
        arrowStyle.top = -6
        arrowStyle.left = '50%'
        arrowStyle.transform = 'translateX(-50%) rotate(45deg)'
    } else if (currentStep.position === 'top') {
        tooltipStyle.bottom = window.innerHeight - pos.top + margin
        tooltipStyle.left = pos.left + pos.width / 2
        tooltipStyle.transform = 'translateX(-50%)'
        arrowStyle.bottom = -6
        arrowStyle.left = '50%'
        arrowStyle.transform = 'translateX(-50%) rotate(45deg)'
    } else if (currentStep.position === 'left') {
        tooltipStyle.top = pos.top + pos.height / 2
        tooltipStyle.right = window.innerWidth - pos.left + margin
        tooltipStyle.transform = 'translateY(-50%)'
        arrowStyle.top = '50%'
        arrowStyle.right = -6
        arrowStyle.transform = 'translateY(-50%) rotate(45deg)'
    } else if (currentStep.position === 'right') {
        tooltipStyle.top = pos.top + pos.height / 2
        tooltipStyle.left = pos.left + pos.width + margin
        tooltipStyle.transform = 'translateY(-50%)'
        arrowStyle.top = '50%'
        arrowStyle.left = -6
        arrowStyle.transform = 'translateY(-50%) rotate(45deg)'
    }

    const isWelcome = step === 0 && (trigger === 'signup' || trigger === 'login')

    return (
        <div
            className={`fixed inset-0 z-[200] transition-opacity duration-400 ${
                exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
        >
            {/* Dark overlay — click anywhere to advance */}
            <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" onClick={next} />

            {/* Welcome hero step — full screen message */}
            {isWelcome ? (
                <div className="absolute inset-0 flex items-center justify-center p-6">
                    <div
                        className={`relative z-[202] w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-white/10 p-7 text-center transition-all duration-500 ${
                            visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
                        }`}
                    >
                        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-dribly-purple/20 to-dribly-purple/5 flex items-center justify-center mb-4">
                            {trigger === 'signup' ? (
                                <UserPlus size={30} className="text-dribly-purple" />
                            ) : (
                                <LogIn size={30} className="text-dribly-purple" />
                            )}
                        </div>
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2">
                            {trigger === 'signup' ? 'Conta criada! 🎉' : 'Bem-vindo de volta! 👋'}
                        </h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
                            {trigger === 'signup'
                                ? 'Agora com conta no Dribly já podes favoritar clubes, segui-los e ter acesso rápido a tudo. Vamos mostrar-te como funciona.'
                                : 'Agora que iniciaste sessão, tens acesso a funcionalidades extra. Vamos mostrar-te como tirar o máximo partido do Dribly.'}
                        </p>
                        <button
                            onClick={next}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-dribly-purple text-white text-sm font-bold hover:bg-dribly-purple/90 transition-all active:scale-[0.97] shadow-lg shadow-dribly-purple/25 animate-pulse-soft"
                        >
                            Vamos lá! <ArrowRight size={16} />
                        </button>
                        <button
                            onClick={finish}
                            className="block mx-auto mt-3 text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                        >
                            Skip
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Highlight cutout around the target element */}
                    <div
                        className="absolute rounded-xl transition-all duration-300 pointer-events-none"
                        style={{
                            top: pos.top - 6,
                            left: pos.left - 6,
                            width: pos.width + 12,
                            height: pos.height + 12,
                            boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
                            borderRadius: '14px',
                        }}
                    />

                    {/* Animated glow ring that pulses */}
                    <div
                        className="absolute rounded-xl pointer-events-none transition-all duration-700"
                        style={{
                            top: pos.top - 8 - (pulsePhase % 2) * 4,
                            left: pos.left - 8 - (pulsePhase % 2) * 4,
                            width: pos.width + 16 + (pulsePhase % 2) * 8,
                            height: pos.height + 16 + (pulsePhase % 2) * 8,
                            borderRadius: '16px',
                            border: '2.5px solid #7C3AED',
                            boxShadow: `0 0 ${12 + pulsePhase * 6}px rgba(124, 58, 237, ${0.3 + pulsePhase * 0.12})`,
                            opacity: 0.6 + pulsePhase * 0.1,
                        }}
                    />

                    {/* Animated arrow pointing to the target (only on non-welcome steps) */}
                    {currentStep.icon && (
                        <div
                            className="absolute z-[203] transition-all duration-300"
                            style={{
                                top: pos.top - 28,
                                left: pos.left + pos.width / 2 - 8,
                                animation: 'bounce-down 1.2s ease-in-out infinite',
                            }}
                        >
                            <svg
                                width="16"
                                height="20"
                                viewBox="0 0 16 20"
                                fill="none"
                                className="text-dribly-purple drop-shadow-lg"
                            >
                                <path
                                    d="M8 19L1 10L8 13L15 10L8 19Z"
                                    fill="currentColor"
                                    opacity="0.9"
                                />
                                <path
                                    d="M8 1L8 13"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    opacity="0.6"
                                />
                            </svg>
                        </div>
                    )}

                    {/* Tooltip card */}
                    <div
                        className={`absolute z-[201] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-white/10 p-5 max-w-[280px] sm:max-w-[320px] transition-all duration-300 ${
                            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                        }`}
                        style={tooltipStyle}
                    >
                        {/* Arrow */}
                        <div
                            className="absolute w-3 h-3 bg-white dark:bg-zinc-900 border-l border-t border-zinc-200 dark:border-white/10"
                            style={arrowStyle}
                        />

                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                {currentStep.icon ? (
                                    <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center">
                                        {STEP_ICONS[currentStep.icon] ?? null}
                                    </div>
                                ) : (
                                    <Sparkles size={16} className="text-dribly-purple" />
                                )}
                                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                                    {currentStep.title}
                                </h3>
                            </div>
                            <button
                                onClick={finish}
                                className="p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
                            {currentStep.description}
                        </p>

                        <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                                {steps.slice(1).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                            i === step - 1 ? 'bg-dribly-purple w-3' : 'bg-zinc-200 dark:bg-zinc-700'
                                        }`}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={next}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dribly-purple text-white text-xs font-bold hover:bg-dribly-purple/90 transition-all active:scale-[0.97] shadow-sm shadow-dribly-purple/20"
                            >
                                {step < steps.length - 2 ? (
                                    <>
                                        Seguinte <ArrowRight size={12} />
                                    </>
                                ) : (
                                    'Percebi!'
                                )}
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Global keyframe injection for the bounce arrow */}
            <style>{`
                @keyframes bounce-down {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(6px); }
                }
                @keyframes pulse-soft {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.03); }
                }
                .animate-pulse-soft {
                    animation: pulse-soft 1.8s ease-in-out infinite;
                }
            `}</style>
        </div>
    )
}
