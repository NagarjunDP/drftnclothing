import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json();
    if (!accessToken) {
      return NextResponse.json({ error: 'Access token is required' }, { status: 400 });
    }

    const clientId = process.env.PHONE_EMAIL_CLIENT_ID || 'mock_client_id';

    // Call phone.email getuser endpoint
    const response = await fetch('https://eapi.phone.email/getuser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        access_token: accessToken,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.userDetails) {
      console.error('phone.email getuser API failed:', data);
      // For mock tokens (e.g. during testing/local environment), check if token starts with mock_
      if (accessToken.startsWith('mock_token_')) {
        const mockPhone = accessToken.replace('mock_token_', '');
        return NextResponse.json({
          success: true,
          phone: mockPhone,
        });
      }
      return NextResponse.json({ error: 'Failed to verify phone OTP' }, { status: 400 });
    }

    const phoneNo = data.userDetails.phoneNo;
    const countryCode = data.userDetails.countryCode;

    return NextResponse.json({
      success: true,
      phone: `${countryCode}${phoneNo}`,
    });

  } catch (error) {
    console.error('Verify OTP route error:', error);
    return NextResponse.json({ error: 'Internal server error occurred' }, { status: 500 });
  }
}
