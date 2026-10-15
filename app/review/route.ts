import { NextResponse } from 'next/server'
import { GOOGLE_REVIEW_URL } from '@/lib/contact'

// Short link for texting customers: finishlinetowing.org/review
export function GET() {
  return NextResponse.redirect(GOOGLE_REVIEW_URL, 302)
}
