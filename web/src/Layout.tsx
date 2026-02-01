import { useState, useEffect } from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Sun, Moon, Instagram, Facebook } from 'lucide-react'

function Layout() {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
        localStorage.setItem('theme', theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-300 flex flex-col font-sans">

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">

                    {/* Logo & Brand */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <img
                            src="/logo.png"
                            alt="FC Gaia Logo"
                            className="h-10 w-auto group-hover:scale-110 transition-transform duration-300 drop-shadow-md"
                        />
                        <div className="flex flex-col">
                            <span className="font-bold text-lg leading-tight tracking-tight text-gaia-black dark:text-white">
                                FC GAIA
                            </span>
                            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-medium group-hover:text-gaia-yellow transition-colors">
                                Basquetebol
                            </span>
                        </div>
                    </Link>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow p-4 md:p-8">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-white/10 py-8">
                <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                    <div>
                        &copy; {new Date().getFullYear()} FC Gaia Basquetebol
                    </div>
                    <div className="flex gap-4">
                        <a href="https://www.instagram.com/gaiensespt" target="_blank" rel="noopener noreferrer" className="hover:text-gaia-blue transition-colors">
                            <Instagram size={20} />
                        </a>
                        <a href="https://www.facebook.com/fcgaia" target="_blank" rel="noopener noreferrer" className="hover:text-gaia-blue transition-colors">
                            <Facebook size={20} />
                        </a>
                    </div>
                </div>
            </footer>

        </div>
    )
}

export default Layout
