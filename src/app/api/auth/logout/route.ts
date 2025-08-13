import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Clear all authentication cookies
    cookieStore.delete('access_token');
    cookieStore.delete('id_token');
    cookieStore.delete('refresh_token');
    cookieStore.delete('authenticated');
    
    // Check if this is a full SSO logout request
    const { searchParams } = new URL(request.url);
    const ssoLogout = searchParams.get('sso') === 'true';
    
    if (ssoLogout) {
      // Redirect to Cognito logout endpoint
      const clientId = process.env.NEXT_PUBLIC_PRODUCTION_CLIENT_ID || '';
      const authUrl = process.env.NEXT_PUBLIC_PRODUCTION_AUTH_URL || '';
      const logoutUri = `${request.headers.get('origin')}/`;
      
      const cognitoLogoutUrl = `${authUrl}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
      
      return NextResponse.json({
        success: true,
        redirect: cognitoLogoutUrl
      });
    }
    
    // Local logout only
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
    
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}