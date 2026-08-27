import { NextResponse } from "next/server"
import {
  ADMIN_AUTH_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
  getAdminAuthConfigError,
  isValidAdminCredentials,
} from "@/lib/admin-auth"

export async function POST(request: Request) {
  // Fail closed with a clear message if the server is missing a real password
  // or the session-signing secret — never mint a session in that state.
  const configError = getAdminAuthConfigError()
  if (configError) {
    return NextResponse.json({ ok: false, error: configError }, { status: 503 })
  }

  const body = (await request.json().catch(() => null)) as
    | { username?: string; password?: string }
    | null

  const username = body?.username?.trim() ?? ""
  const password = body?.password ?? ""

  if (!isValidAdminCredentials(username, password)) {
    return NextResponse.json({ ok: false, error: "Invalid admin username or password." }, { status: 401 })
  }

  const token = await createAdminSessionToken()
  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    // Secure in production, but not over plain-HTTP localhost: Safari refuses
    // to store a Secure cookie on http://, so the login succeeds and the
    // session is dropped, which presents as "wrong password" forever.
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  })
  return response
}
