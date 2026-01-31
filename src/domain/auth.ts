// Domain-level representation of an authenticated user.
// Keeps UI and repository layers decoupled from Supabase-specific types.
export type AuthUser = {
  id: string
  email: string | null
}
