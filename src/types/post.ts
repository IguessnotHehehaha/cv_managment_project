export type Post = {
    id: string
    content: string
    createdAt: string
    authorId: string
    author: { id: string; firstName: string; lastName: string }
}