export type User = {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    role: string;
    isBlocked: boolean
}
