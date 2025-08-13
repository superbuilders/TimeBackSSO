import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// User info response type
interface UserInfo {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  phone_number?: string;
  phone_number_verified?: boolean;
  [key: string]: any;
}

// Decode JWT token (without verification - verification should be done with proper library in production)
function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64url').toString('utf-8');
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    const idToken = cookieStore.get('id_token')?.value;
    
    if (!accessToken || !idToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get user info from Cognito userinfo endpoint
    const userInfoEndpoint = `${process.env.NEXT_PUBLIC_PRODUCTION_AUTH_URL}/oauth2/userinfo`;
    
    const userInfoResponse = await fetch(userInfoEndpoint, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!userInfoResponse.ok) {
      // If userinfo endpoint fails, try to decode the ID token
      const idTokenPayload = decodeJWT(idToken);
      if (idTokenPayload) {
        return NextResponse.json({
          user: idTokenPayload,
          source: 'id_token'
        });
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch user information' },
        { status: userInfoResponse.status }
      );
    }
    
    const userInfo: UserInfo = await userInfoResponse.json();
    
    // Also decode the ID token to get additional claims
    const idTokenPayload = decodeJWT(idToken);
    
    // Merge user info from both sources (userinfo endpoint takes precedence)
    const mergedUserInfo = {
      ...idTokenPayload,
      ...userInfo
    };
    
    return NextResponse.json({
      user: mergedUserInfo,
      source: 'userinfo_endpoint'
    });
    
  } catch (error) {
    console.error('Error fetching user information:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}