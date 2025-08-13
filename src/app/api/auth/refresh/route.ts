import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Token response type from Cognito
interface TokenResponse {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

// Error response type
interface ErrorResponse {
  error: string;
  error_description?: string;
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token available' },
        { status: 401 }
      );
    }
    
    // Get environment variables
    const clientId = process.env.NEXT_PUBLIC_PRODUCTION_CLIENT_ID;
    const clientSecret = process.env.PRODUCTION_CLIENT_SECRET;
    const tokenEndpoint = `${process.env.NEXT_PUBLIC_PRODUCTION_AUTH_URL}/oauth2/token`;
    
    // Validate required environment variables
    if (!clientId || !clientSecret || !tokenEndpoint) {
      throw new Error('Missing required environment variables for token refresh');
    }
    
    // Exchange refresh token for new tokens
    const tokenResponse = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // Use Basic Authentication with client credentials
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId
      }).toString()
    });
    
    // Parse the response
    const data = await tokenResponse.json() as TokenResponse | ErrorResponse;
    
    // Check if the token refresh was successful
    if (!tokenResponse.ok || 'error' in data) {
      const errorData = data as ErrorResponse;
      console.error('Token refresh failed:', errorData);
      
      // Clear all auth cookies on refresh failure
      cookieStore.delete('access_token');
      cookieStore.delete('id_token');
      cookieStore.delete('refresh_token');
      cookieStore.delete('authenticated');
      
      return NextResponse.json(
        { 
          error: errorData.error || 'token_refresh_failed',
          error_description: errorData.error_description
        },
        { status: 401 }
      );
    }
    
    const tokens = data as TokenResponse;
    
    // Update tokens in httpOnly cookies
    cookieStore.set('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: tokens.expires_in
    });
    
    cookieStore.set('id_token', tokens.id_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: tokens.expires_in
    });
    
    // Update refresh token if a new one is provided
    if (tokens.refresh_token) {
      cookieStore.set('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60 // 30 days
      });
    }
    
    // Update authentication status cookie
    cookieStore.set('authenticated', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: tokens.expires_in
    });
    
    return NextResponse.json({
      success: true,
      expires_in: tokens.expires_in
    });
    
  } catch (error) {
    console.error('Error refreshing tokens:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}