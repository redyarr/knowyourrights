import { NextResponse } from 'next/server';
import { jwtVerify } from "jose";
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();

        const token = cookieStore.get('token')?.value; 
        
        if (!token) {
            return NextResponse.json({ success: false, message: 'Token not found' }, { status: 401 });
        }
        
          const secret = new TextEncoder().encode(process.env.JWT_SECRET);
          const { payload } = await jwtVerify(token, secret);
          

        return NextResponse.json({ 
            success: true, 
            payload: payload 
        }, { status: 200 });
    } catch (error) {
        console.error('Error geting user data:', error);
        return NextResponse.json({ success: false, message: 'Getting user data failed' }, { status: 500 });
    }
}
