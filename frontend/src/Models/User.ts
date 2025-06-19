export interface User {
    id?: number,
    username?: string | undefined,
    email: string | undefined,
    password: string | undefined
    confirmPassword?: string | undefined
}