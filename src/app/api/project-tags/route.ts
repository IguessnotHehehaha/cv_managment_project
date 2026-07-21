import { NextResponse } from 'next/server'
import { projectService } from '@/services/ProjectService'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') ?? ''
    return NextResponse.json(await projectService.searchTags(q))
}