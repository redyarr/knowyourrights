import { jwtVerify } from "jose";

export default async function middleware(req, res, next) {
  // 🟢 FIX: use .value!
  const token = req.cookies.get('token')?.value || req.cookies.token;

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  
  const { payload } = await jwtVerify(token, secret);
    console.log("Middleware JWT payload:", payload);

}
