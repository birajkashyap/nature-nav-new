import { NextResponse } from 'next/server';
import { sendBookingConfirmationEmail, BookingDetails } from '@/lib/email';

/**
 * Test endpoint to verify email sending functionality
 * GET /api/test-email
 */
export async function GET() {
  try {
    // Create test booking data
    const testBooking: BookingDetails = {
      id: 'test-' + Date.now(),
      car: 'Transit Van (14 Passengers)',
      pickup: 'Calgary International Airport (YYC)',
      drop: 'Hotel Vista, Canmore',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      totalPrice: 685.13,
      depositAmount: 239.80,
      bookingType: 'CEREMONY_HOTEL_VISTA'
    };

    // Send test email
    await sendBookingConfirmationEmail(
      'kashyapbiraj83@gmail.com',
      'Biraj Kashyap (Test)',
      testBooking
    );

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully to kashyapbiraj83@gmail.com',
      booking: testBooking
    });

  } catch (error) {
    console.error('Test email failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
