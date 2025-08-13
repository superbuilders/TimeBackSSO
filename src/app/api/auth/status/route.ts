import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    const idToken = cookieStore.get('id_token')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value;
    const authenticated = cookieStore.get('authenticated')?.value;
    
    // Don't expose actual tokens, just their status
    const status = {
      authenticated: authenticated === 'true',
      hasAccessToken: !!accessToken,
      hasIdToken: !!idToken,
      hasRefreshToken: !!refreshToken,
      // Optionally decode token to get expiry (without exposing the token itself)
      tokenInfo: null as any
    };
    
    // If we have an access token, decode it to get expiry information
    if (accessToken) {
      try {
        const parts = accessToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
          status.tokenInfo = {
            expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : null,
            issuedAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : null,
            scope: payload.scope || null,
            tokenUse: payload.token_use || null
          };
        }
      } catch (error) {
        console.error('Error decoding token for status:', error);
      }
    }
    
    return NextResponse.json(status);
    
  } catch (error) {
    console.error('Error fetching auth status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}