import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import ClubLayout from './pages/club/ClubLayout'
import Landing from './pages/Landing'
import ClubHome from './pages/club/ClubHome'
import ClubGames from './pages/club/ClubGames'
import Game from './pages/Game'
import Standings from './pages/Standings'
import AssociationCompetitions from './pages/AssociationCompetitions'
import CompetitionPhases from './pages/CompetitionPhases'
import About from './pages/About'
import Install from './pages/Install'
import { ClubProvider } from './lib/ClubContext'

function App() {
    return (
        <BrowserRouter>
            <ClubProvider>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Landing />} />
                        <Route path="clube/:slug" element={<ClubLayout />}>
                            <Route index element={<ClubHome />} />
                            <Route path="home" element={<ClubHome />} />
                            <Route path="games" element={<ClubGames />} />
                        </Route>
                        <Route path="game/:slug" element={<Game />} />
                        <Route path="standings" element={<Standings />} />
                        <Route path="standings/:associationId" element={<AssociationCompetitions />} />
                        <Route path="standings/:associationId/:competitionId" element={<CompetitionPhases />} />
                        <Route path="about" element={<About />} />
                        <Route path="install" element={<Install />} />
                    </Route>
                </Routes>
            </ClubProvider>
        </BrowserRouter>
    )
}

export default App
