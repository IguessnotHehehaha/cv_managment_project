'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ProfileMeSection } from './ProfileMeSection'
import { InfoSection } from './InfoSection'
import { ProjectsSection } from './ProjectsSection'
import { CvsSection} from "./CvsSection";


const TABS = ['me', 'info', 'projects', 'cvs'] as const

export default function ProfilePage() {
    const [tab, setTab] = useState<(typeof TABS)[number]>('me')
    const t = useTranslations('profile.tabs')
    return (
        <div className="mx-auto max-w-3xl space-y-6 p-6">
            <div className="flex gap-1 border-b dark:border-gray-800">
                {TABS.map((tabKey) => (
                    <button key={tabKey} onClick={() => setTab(tabKey)}
                            className={`px-4 py-2 text-sm font-medium capitalize ${tab === tabKey ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>
                        {t(tabKey)}
                    </button>
                ))}
            </div>
            {tab === 'me' && <ProfileMeSection />}
            {tab === 'info' && <InfoSection />}
            {tab === 'projects' && <ProjectsSection />}
            {tab === 'cvs' && <CvsSection />}
        </div>
    )
}