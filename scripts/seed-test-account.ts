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

const accounts = [
    { email: 'tutor-candidate@example.com', role: 'candidate' as const },
    { email: 'tutor-recruiter@example.com', role: 'recruiter' as const },
    { email: 'tutor-admin@example.com', role: 'admin' as const },
]
const PASSWORD = process.env.TUTOR_ACCOUNT_PASSWORD

async function main() {
    for (const acc of accounts) {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: acc.email, password: PASSWORD, email_confirm: true,
        })
        if (error) { console.log(`${acc.email}: ${error.message}`); continue }
        await prisma.profile.update({ where: { id: data.user!.id }, data: { role: acc.role } })
        console.log(`Created ${acc.email} as ${acc.role}`)
    }
}
main().finally(() => prisma.$disconnect())