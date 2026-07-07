import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
    const { data, error } = await supabase.auth.admin.createUser({
        email: 'recruiter@test.com',
        password: 'testpassword123',
        email_confirm: true,
    })
    if (error) throw error

    const { prisma } = await import('@/lib/prisma')
    await prisma.profile.update({
        where: { id: data.user.id },
        data: { role: 'recruiter' },
    })
}

main()