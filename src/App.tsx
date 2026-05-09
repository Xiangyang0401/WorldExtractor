// ============================================================
// 宇宙尽头 · 主应用路由
// ============================================================

import { useApp } from '@/store/AppContext'
import { HomePage } from '@/pages/HomePage'
import { WorldIntroPage } from '@/pages/WorldIntroPage'
import { ExplorationPage } from '@/pages/ExplorationPage'
import { OutcomePage } from '@/pages/OutcomePage'
import { AchievementsPage } from '@/pages/AchievementsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { LoadingPage } from '@/pages/LoadingPage'
import { ConfrontationPage } from '@/pages/ConfrontationPage'
import { ConfrontationResultPage } from '@/pages/ConfrontationResultPage'
import { RelicsPage } from '@/pages/RelicsPage'

export function App() {
  const { state } = useApp()

  switch (state.page) {
    case 'home': return <HomePage />
    case 'world-intro': return <WorldIntroPage />
    case 'exploration': return <ExplorationPage />
    case 'outcome': return <OutcomePage />
    case 'achievements': return <AchievementsPage />
    case 'settings': return <SettingsPage />
    case 'loading': return <LoadingPage />
    case 'confrontation': return <ConfrontationPage />
    case 'confrontation-result': return <ConfrontationResultPage />
    case 'relics': return <RelicsPage />
    default: return <HomePage />
  }
}
