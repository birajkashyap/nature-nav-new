import { NextResponse } from "next/server";

export async function GET() {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  return NextResponse.json({
    exists: !!hash,
    length: hash?.length,
    prefix: hash?.substring(0, 15),
    suffix: hash?.substring(hash.length - 10),
  });
}
