import { config } from 'dotenv'
config({ path: '.env.local' })

import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const prisma = new PrismaClient()
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
)

async function getOrCreateAuthUser(email: string, fullName: string) {
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 })
    const existing = list?.users.find((u) => u.email === email)
    if (existing) return existing.id

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: process.env.DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: fullName },
    })
    if (error || !data.user) throw new Error(`Could not create ${email}: ${error?.message}`)
    return data.user.id
}

async function main() {
    console.log('Creating auth users + profiles...')

    const recruiterEmails = [
        ['recruiter1@test.com', 'Alice Recruiter'],
        ['admin1@test.com', 'Sam Admin'],
    ] as const
    const candidateEmails = [
        ['candidate1@test.com', 'John Smith'],
        ['candidate2@test.com', 'Maria Garcia'],
        ['candidate3@test.com', 'Wei Chen'],
        ['candidate4@test.com', 'Aida Nazarova'],
        ['candidate5@test.com', 'Lucas Silva'],
        ['candidate6@test.com', 'Priya Patel'],
    ] as const

    const recruiterIds: string[] = []
    for (const [email, name] of recruiterEmails) {
        const id = await getOrCreateAuthUser(email, name)
        recruiterIds.push(id)
    }
    await prisma.profile.update({ where: { id: recruiterIds[0] }, data: { role: 'recruiter' } })
    await prisma.profile.update({ where: { id: recruiterIds[1] }, data: { role: 'admin' } })
    const [recruiterId, adminId] = recruiterIds

    const candidateIds: string[] = []
    for (const [email, name] of candidateEmails) {
        candidateIds.push(await getOrCreateAuthUser(email, name))
    }
    const [c1, c2, c3, c4, c5, c6] = candidateIds

    console.log('Creating attributes...')

    const attrDefs = [
        { name: 'English Level', category: 'soft_skills', description: 'CEFR level', dataType: 'dropdown',
            config: { options: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] } },
        { name: 'Presentation Skills', category: 'soft_skills', description: 'Self-rated presentation ability', dataType: 'dropdown',
            config: { options: ['Beginner', 'Intermediate', 'Advanced'] } },
        { name: 'Years of Experience', category: 'domain_knowledge', description: 'Total professional years', dataType: 'numeric',
            config: { min: 0, max: 50 } },
        { name: 'GPA', category: 'certification', description: 'University GPA', dataType: 'numeric', config: { min: 0, max: 4 } },
        { name: 'Remote Work Availability', category: 'personal_information', description: 'Open to remote roles', dataType: 'boolean', config: {} },
        { name: 'Phone Number', category: 'personal_information', description: 'Contact number', dataType: 'string',
            config: { regex: '^\\+?[0-9\\s-]{7,15}$', maxLength: 20 } },
        { name: 'Bio', category: 'personal_information', description: 'Short professional summary', dataType: 'text', config: { maxLength: 2000 } },
        { name: 'Employment Period at Last Job', category: 'domain_knowledge', description: 'Start and end date', dataType: 'period', config: {} },
        { name: 'Certification Date', category: 'certification', description: 'Most recent certification earned', dataType: 'date', config: {} },
        { name: 'PMP Certified', category: 'certification', description: 'Project Management Professional certification', dataType: 'boolean', config: {} },
    ] as const

    const attrs: Record<string, string> = {}
    for (const def of attrDefs) {
        const a = await prisma.attribute.upsert({
            where: { name: def.name },
            update: {},
            create: { name: def.name, category: def.category, description: def.description, dataType: def.dataType, config: def.config },
        })
        attrs[def.name] = a.id
    }

    console.log('Creating positions...')

    const positionDefs = [
        { title: 'Business Analyst', company: 'Acme Corp', level: 'middle', visibility: 'public',
            description: 'Analyzing business requirements and bridging stakeholders.', projectTags: ['analytics', 'sql'],
            attributeNames: ['English Level', 'GPA', 'Years of Experience'] },
        { title: 'DevOps Engineer', company: 'CloudWorks', level: 'senior', visibility: 'public',
            description: 'Owning CI/CD pipelines and infrastructure.', projectTags: ['docker', 'kubernetes', 'ci-cd'],
            attributeNames: ['Years of Experience', 'Remote Work Availability'] },
        { title: 'QA Engineer', company: 'Acme Corp', level: 'junior', visibility: 'public',
            description: 'Manual and automated testing across the product.', projectTags: ['testing', 'automation'],
            attributeNames: ['English Level', 'Bio'] },
        { title: 'Data Scientist', company: 'Insight Labs', level: 'senior', visibility: 'restricted',
            description: 'Advanced modeling role — English C1+ and 5+ years required.', projectTags: ['python', 'ml'],
            attributeNames: ['English Level', 'Years of Experience', 'PMP Certified'],
            accessRules: [{ attributeName: 'English Level', operator: 'eq', value: 'C1' }, { attributeName: 'Years of Experience', operator: 'gte', value: '5' }] },
        { title: 'Product Manager', company: 'Insight Labs', level: 'c_level', visibility: 'restricted',
            description: 'Remote-only, PMP certified candidates preferred.', projectTags: ['strategy', 'roadmap'],
            attributeNames: ['Presentation Skills', 'PMP Certified'],
            accessRules: [{ attributeName: 'Remote Work Availability', operator: 'eq', value: 'true' }] },
    ] as const

    const positionIds: Record<string, string> = {}
    for (const def of positionDefs) {
        const existing = await prisma.position.findFirst({ where: { title: def.title } })
        const position = existing
            ? existing
            : await prisma.position.create({
                data: {
                    title: def.title, company: def.company, level: def.level, visibility: def.visibility,
                    description: def.description, projectTags: [...def.projectTags],
                    positionAttributes: { create: def.attributeNames.map((n, i) => ({ attributeId: attrs[n], sortOrder: i })) },
                },
            })
        positionIds[def.title] = position.id

        if ('accessRules' in def && def.accessRules) {
            await prisma.positionAccessRule.deleteMany({ where: { positionId: position.id } })
            await prisma.positionAccessRule.createMany({
                data: def.accessRules.map((r) => ({ positionId: position.id, attributeId: attrs[r.attributeName], operator: r.operator, value: r.value })),
            })
        }
    }

    console.log('Setting profile attribute values...')

    const profileValues: Record<string, Record<string, unknown>> = {
        [c1]: { 'English Level': 'C1', GPA: 3.8, 'Years of Experience': 6, 'Remote Work Availability': true, 'PMP Certified': true, 'Phone Number': '+1 555 0100', Bio: 'Senior engineer with a decade of experience.' },
        [c2]: { 'English Level': 'B2', GPA: 3.4, 'Years of Experience': 2, 'Remote Work Availability': false },
        [c3]: { 'English Level': 'C1', GPA: 3.9, 'Years of Experience': 7, 'Remote Work Availability': true, 'PMP Certified': true },
        [c4]: { 'English Level': 'B1', 'Years of Experience': 1 }, // intentionally incomplete for some positions
        [c5]: { 'English Level': 'C2', GPA: 3.5, 'Years of Experience': 4, 'Remote Work Availability': true },
        [c6]: { 'English Level': 'B2', 'Presentation Skills': 'Advanced', 'PMP Certified': false, 'Remote Work Availability': true },
    }

    for (const [profileId, values] of Object.entries(profileValues)) {
        for (const [attrName, value] of Object.entries(values)) {
            await prisma.profileAttributeValue.upsert({
                where: { profileId_attributeId: { profileId, attributeId: attrs[attrName] } },
                update: { value: value as never },
                create: { profileId, attributeId: attrs[attrName], value: value as never },
            })
        }
    }

    console.log('Creating projects...')

    const projectDefs: Record<string, { name: string; tags: string[]; description: string }[]> = {
        [c1]: [
            { name: 'Internal Analytics Dashboard', tags: ['analytics', 'sql', 'react'], description: 'Built a **Metabase**-style dashboard for the sales team.' },
            { name: 'CI/CD Migration', tags: ['docker', 'ci-cd'], description: 'Migrated Jenkins pipelines to GitHub Actions.' },
        ],
        [c2]: [{ name: 'QA Automation Suite', tags: ['testing', 'automation'], description: 'Playwright-based regression suite, 300+ tests.' }],
        [c3]: [
            { name: 'ML Fraud Detection', tags: ['python', 'ml'], description: 'Gradient-boosted model reducing false positives by 40%.' },
            { name: 'Data Pipeline Rebuild', tags: ['python', 'sql'], description: 'Rebuilt ETL pipeline using Airflow.' },
        ],
        [c4]: [{ name: 'Marketing Site Redesign', tags: ['react', 'design'], description: 'Full redesign of the public marketing site.' }],
        [c5]: [{ name: 'Kubernetes Cluster Rollout', tags: ['kubernetes', 'docker'], description: 'Rolled out prod k8s cluster across 3 regions.' }],
        [c6]: [{ name: 'Product Roadmap Overhaul', tags: ['strategy', 'roadmap'], description: 'Restructured quarterly roadmap process.' }],
    }

    for (const [profileId, projects] of Object.entries(projectDefs)) {
        for (const p of projects) {
            const existing = await prisma.project.findFirst({ where: { profileId, name: p.name } })
            if (existing) continue
            const tagIds = await Promise.all(
                p.tags.map(async (tagName) => (await prisma.projectTag.upsert({ where: { name: tagName }, update: {}, create: { name: tagName } })).id)
            )
            await prisma.project.create({
                data: {
                    profileId, name: p.name, description: p.description,
                    periodStart: new Date('2023-01-01'), periodEnd: new Date('2024-06-01'),
                    tags: { create: tagIds.map((tagId) => ({ tagId })) },
                },
            })
        }
    }

    console.log('Creating CVs...')

    const cvDefs = [
        { profileId: c1, position: 'Business Analyst', status: 'published' },
        { profileId: c2, position: 'QA Engineer', status: 'published' },
        { profileId: c3, position: 'Data Scientist', status: 'published' },
        { profileId: c5, position: 'DevOps Engineer', status: 'published' },
        { profileId: c6, position: 'Product Manager', status: 'draft' },
        { profileId: c4, position: 'Business Analyst', status: 'draft' },
    ] as const

    const cvIds: { id: string; status: string }[] = []
    for (const def of cvDefs) {
        const positionId = positionIds[def.position]
        const cv = await prisma.cv.upsert({
            where: { profileId_positionId: { profileId: def.profileId, positionId } },
            update: { status: def.status },
            create: { profileId: def.profileId, positionId, status: def.status },
        })
        cvIds.push({ id: cv.id, status: cv.status })
    }

    console.log('Adding likes...')

    for (const cv of cvIds.filter((c) => c.status === 'published')) {
        await prisma.like.upsert({ where: { cvId_recruiterId: { cvId: cv.id, recruiterId } }, update: {}, create: { cvId: cv.id, recruiterId } })
    }
    if (cvIds[0]) {
        await prisma.like.upsert({ where: { cvId_recruiterId: { cvId: cvIds[0].id, recruiterId: adminId } }, update: {}, create: { cvId: cvIds[0].id, recruiterId: adminId } })
    }

    console.log('Adding discussion posts...')

    const discussionSeeds = [
        { position: 'Business Analyst', authorId: recruiterId, content: 'Looking forward to strong SQL candidates for this role.' },
        { position: 'Business Analyst', authorId: c1, content: 'Is remote work an option for this position?' },
        { position: 'Data Scientist', authorId: c3, content: 'What ML frameworks does the team currently use?' },
    ]
    for (const post of discussionSeeds) {
        const positionId = positionIds[post.position]
        const already = await prisma.post.findFirst({ where: { positionId, authorId: post.authorId, content: post.content } })
        if (!already) await prisma.post.create({ data: { positionId, authorId: post.authorId, content: post.content } })
    }

    console.log('\nDone. Test accounts')
    console.log('  recruiter1@test.com — recruiter')
    console.log('  admin1@test.com — admin')
    console.log('  candidate1-6@test.com — candidates')
}

main()
    .catch((e) => { console.error(e); process.exit(1) })
    .finally(() => prisma.$disconnect())