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

export async function GET(request: NextRequest) {
  // Get the URL parameters
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  
  // Handle authentication errors from provider
  if (error) {
    console.error('Authentication error from provider:', error, errorDescription);
    const errorUrl = new URL('/callback', request.url);
    errorUrl.searchParams.set('error', error);
    if (errorDescription) {
      errorUrl.searchParams.set('error_description', errorDescription);
    }
    return NextResponse.redirect(errorUrl);
  }
  
  // Validate required parameters
  if (!code) {
    console.error('No authorization code received');
    const errorUrl = new URL('/callback', request.url);
    errorUrl.searchParams.set('error', 'invalid_request');
    errorUrl.searchParams.set('error_description', 'No authorization code received');
    return NextResponse.redirect(errorUrl);
  }
  
  try {
    // Get environment variables
    const clientId = process.env.NEXT_PUBLIC_PRODUCTION_CLIENT_ID;
    const clientSecret = process.env.PRODUCTION_CLIENT_SECRET;
    const tokenEndpoint = `${process.env.NEXT_PUBLIC_PRODUCTION_AUTH_URL}/oauth2/token`;
    const redirectUri = process.env.NEXT_PUBLIC_PRODUCTION_AUTH_REDIRECT;
    
    // Validate required environment variables
    if (!clientId || !clientSecret || !tokenEndpoint || !redirectUri) {
      throw new Error('Missing required environment variables for token exchange');
    }
    
    // Exchange authorization code for tokens
    const tokenResponse = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // Use Basic Authentication with client credentials
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        // Client ID is also included in the body for some OAuth providers
        client_id: clientId
      }).toString()
    });
    
    // Parse the response
    const data = await tokenResponse.json() as TokenResponse | ErrorResponse;
    
    // Check if the token exchange was successful
    if (!tokenResponse.ok || 'error' in data) {
      const errorData = data as ErrorResponse;
      console.error('Token exchange failed:', errorData);
      const errorUrl = new URL('/callback', request.url);
      errorUrl.searchParams.set('error', errorData.error || 'token_exchange_failed');
      if (errorData.error_description) {
        errorUrl.searchParams.set('error_description', errorData.error_description);
      }
      return NextResponse.redirect(errorUrl);
    }
    
    const tokens = data as TokenResponse;
    
    // Store tokens in httpOnly cookies for security
    const cookieStore = await cookies();
    
    // Set access token cookie
    cookieStore.set('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      // Set expiry based on token expiry (convert seconds to milliseconds)
      maxAge: tokens.expires_in
    });
    
    // Set ID token cookie
    cookieStore.set('id_token', tokens.id_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: tokens.expires_in
    });
    
    // Set refresh token cookie if available (with longer expiry)
    if (tokens.refresh_token) {
      cookieStore.set('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        // Refresh tokens typically last 30 days
        maxAge: 30 * 24 * 60 * 60
      });
    }
    
    // Set authentication status cookie (this one can be read by client)
    cookieStore.set('authenticated', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: tokens.expires_in
    });
    
    // Redirect to dashboard or intended destination
    const intendedDestination = state ? JSON.parse(Buffer.from(state, 'base64').toString()).returnTo : '/dashboard';
    return NextResponse.redirect(new URL(intendedDestination || '/dashboard', request.url));
    
  } catch (error) {
    console.error('Error during token exchange:', error);
    const errorUrl = new URL('/callback', request.url);
    errorUrl.searchParams.set('error', 'server_error');
    errorUrl.searchParams.set('error_description', 'Failed to exchange authorization code for tokens');
    return NextResponse.redirect(errorUrl);
  }
} 