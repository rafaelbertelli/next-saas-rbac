import { deleteAuthToken } from "@/_backend/session/auth-token";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  await deleteAuthToken();

  const redirectURL = request.nextUrl.clone();
  redirectURL.pathname = "/auth/sign-in";

  return NextResponse.redirect(redirectURL);
}
