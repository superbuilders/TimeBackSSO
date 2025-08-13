import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Return the bearer token for API calls
    return NextResponse.json({
      access_token: accessToken,
      token_type: 'Bearer'
    });
    
  } catch (error) {
    console.error('Error fetching token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// This endpoint can be used to validate if a token is still valid
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json(
        { valid: false, error: 'No token found' },
        { status: 401 }
      );
    }
    
    // Optionally, you can validate the token with Cognito's userinfo endpoint
    const userInfoEndpoint = `${process.env.NEXT_PUBLIC_PRODUCTION_AUTH_URL}/oauth2/userinfo`;
    
    const validationResponse = await fetch(userInfoEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (validationResponse.ok) {
      return NextResponse.json({
        valid: true,
        message: 'Token is valid'
      });
    } else {
      // Token is invalid or expired
      return NextResponse.json(
        { valid: false, error: 'Token is invalid or expired' },
        { status: 401 }
      );
    }
    
  } catch (error) {
    console.error('Error validating token:', error);
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}