import { createClient } from '@/lib/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Verificar tipos de reserva pública
    const { data: bookingTypes, error: btError } = await supabase
      .from('public_booking_types')
      .select('*')
      .order('display_order');

    // Verificar horarios de trabajo
    const { data: workingHours, error: whError } = await supabase
      .from('working_hours')
      .select('*')
      .order('day_of_week');

    return NextResponse.json({
      bookingTypes: bookingTypes || [],
      bookingTypesError: btError?.message,
      workingHours: workingHours || [],
      workingHoursError: whError?.message,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
