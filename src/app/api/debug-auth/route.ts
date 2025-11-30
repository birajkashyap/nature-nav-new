import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { password } = await req.json();
  const envHash = process.env.ADMIN_PASSWORD_HASH;
  
  if (!envHash) {
    return NextResponse.json({ error: "No hash in env" });
  }

  const isValid = bcrypt.compareSync(password, envHash);
  
  return NextResponse.json({ 
    isValid, 
    envHashPrefix: envHash.substring(0, 10),
    providedPassword: password 
  });
}
