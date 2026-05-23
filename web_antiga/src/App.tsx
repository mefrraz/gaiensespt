import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import Dashboard from './pages/Dashboard'
import Games from './pages/Games'
import Game from './pages/Game'
import Standings from './pages/Standings'
import AssociationCompetitions from './pages/AssociationCompetitions'
import CompetitionPhases from './pages/CompetitionPhases'
import About from './pages/About'
import Install from './pages/Install'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="games" element={<Games />} />
                    <Route path="game/:slug" element={<Game />} />
                    <Route path="standings" element={<Standings />} />
                    <Route path="standings/:associationId" element={<AssociationCompetitions />} />
                    <Route path="standings/:associationId/:competitionId" element={<CompetitionPhases />} />
                    <Route path="about" element={<About />} />
                    <Route path="install" element={<Install />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App
