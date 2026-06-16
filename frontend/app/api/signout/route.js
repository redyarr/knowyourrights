import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
        
        // Clear the cookie by setting expired date
        response.cookies.set('token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(0),
            path: '/',
        });

        response.cookies.set('refreshToken', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(0),
            path: '/',
        });
        
        return response;
    } catch (error) {
        console.error('Error during signout:', error);
        return NextResponse.json({ success: false, error: 'Signout failed' }, { status: 500 });
    }
}
