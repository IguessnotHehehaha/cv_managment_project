import { prisma } from '@/lib/prisma'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { ForbiddenError, NotFoundError } from './errors'

export class UserService {
    async list() {
        return prisma.profile.findMany({ orderBy: { createdAt: 'desc' } })
    }

    async setRole(id: string, role: 'candidate' | 'recruiter' | 'admin') {
        await prisma.profile.update({ where: { id }, data: { role } })
    }

    async setBlocked(id: string, blocked: boolean) {
        await prisma.profile.update({ where: { id }, data: { isBlocked: blocked } })
        if (blocked) {
            await supabaseAdmin.auth.admin.signOut(id, 'global')
        }
    }

    async delete(id: string) {
        await prisma.profile.delete({ where: { id } })
        const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
        if (error) throw new NotFoundError(error.message)
    }
}

export const userService = new UserService()