'use server';

import { createClient } from '@/lib/server';

/**
 * ============================================
 * SERVER ACTIONS - CONFIGURACIÓN DE HORARIOS
 * ============================================
 * Gestión de horarios de trabajo y bloqueos
 */

// ============================================
// HORARIOS DE TRABAJO
// ============================================

/**
 * Obtener horarios de trabajo
 */
export async function getWorkingHours() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('working_hours')
      .select('*')
      .order('day_of_week', { ascending: true });

    if (error) throw error;

    return {
      success: true,
      workingHours: data || [],
    };
  } catch (error) {
    console.error('[getWorkingHours] Error:', error);
    return { success: false, error: error.message, workingHours: [] };
  }
}

/**
 * Actualizar horarios de trabajo
 */
export async function updateWorkingHours(workingHoursArray) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'No autenticado' };
    }

    // Actualizar cada día
    const promises = workingHoursArray.map((wh) => {
      const updateData = {
        is_working_day: wh.is_working_day,
        start_time: wh.start_time,
        end_time: wh.end_time,
        updated_at: new Date().toISOString(),
      };

      return supabase
        .from('working_hours')
        .update(updateData)
        .eq('day_of_week', wh.day_of_week);
    });

    const results = await Promise.all(promises);

    // Verificar si hubo errores
    const errors = results.filter((r) => r.error);
    if (errors.length > 0) {
      throw new Error('Error al actualizar algunos horarios');
    }

    return {
      success: true,
      message: 'Horarios actualizados correctamente',
    };
  } catch (error) {
    console.error('[updateWorkingHours] Error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// DÍAS BLOQUEADOS (COMPLETOS)
// ============================================

/**
 * Obtener días bloqueados
 */
export async function getBlockedDates() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('blocked_dates')
      .select('*')
      .order('blocked_date', { ascending: true });

    if (error) throw error;

    return {
      success: true,
      blockedDates: data || [],
    };
  } catch (error) {
    console.error('[getBlockedDates] Error:', error);
    return { success: false, error: error.message, blockedDates: [] };
  }
}

/**
 * Bloquear un día completo
 */
export async function blockDate(date, reason = null) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'No autenticado' };
    }

    const { data, error } = await supabase
      .from('blocked_dates')
      .insert({
        blocked_date: date,
        reason: reason,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      blockedDate: data,
    };
  } catch (error) {
    console.error('[blockDate] Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Desbloquear un día
 */
export async function unblockDate(dateId) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'No autenticado' };
    }

    const { error } = await supabase.from('blocked_dates').delete().eq('id', dateId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('[unblockDate] Error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// HORARIOS BLOQUEADOS (ESPECÍFICOS)
// ============================================

/**
 * Obtener horarios bloqueados
 */
export async function getBlockedTimeSlots() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('blocked_time_slots')
      .select(`
        *,
        booking_type:public_booking_types(id, name, slug)
      `)
      .order('blocked_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;

    return {
      success: true,
      blockedSlots: data || [],
    };
  } catch (error) {
    console.error('[getBlockedTimeSlots] Error:', error);
    return { success: false, error: error.message, blockedSlots: [] };
  }
}

/**
 * Bloquear un horario específico
 */
export async function blockTimeSlot({
  blockedDate,
  startTime,
  endTime,
  reason,
  bookingTypeId = null,
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'No autenticado' };
    }

    const { data, error } = await supabase
      .from('blocked_time_slots')
      .insert({
        blocked_date: blockedDate,
        start_time: startTime,
        end_time: endTime,
        reason: reason || null,
        booking_type_id: bookingTypeId, // null = bloquea para todos los tipos
        created_by: user.id,
      })
      .select(`
        *,
        booking_type:public_booking_types(id, name, slug)
      `)
      .single();

    if (error) throw error;

    return {
      success: true,
      blockedSlot: data,
    };
  } catch (error) {
    console.error('[blockTimeSlot] Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Desbloquear un horario
 */
export async function unblockTimeSlot(slotId) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'No autenticado' };
    }

    const { error } = await supabase.from('blocked_time_slots').delete().eq('id', slotId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('[unblockTimeSlot] Error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// GESTIÓN DE TIPOS DE RESERVA PÚBLICA
// ============================================

/**
 * Obtener tipos de reserva pública
 */
export async function getPublicBookingTypes() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('public_booking_types')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    return {
      success: true,
      bookingTypes: data || [],
    };
  } catch (error) {
    console.error('[getPublicBookingTypes] Error:', error);
    return { success: false, error: error.message, bookingTypes: [] };
  }
}

/**
 * Crear tipo de reserva pública
 */
export async function createPublicBookingType({
  name,
  slug,
  durationMinutes,
  color,
  description,
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'No autenticado' };
    }

    const { data, error } = await supabase
      .from('public_booking_types')
      .insert({
        name,
        slug,
        duration_minutes: durationMinutes,
        color: color || '#79502A',
        description: description || null,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      bookingType: data,
    };
  } catch (error) {
    console.error('[createPublicBookingType] Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Actualizar tipo de reserva pública
 */
export async function updatePublicBookingType(id, updates) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'No autenticado' };
    }

    const { data, error } = await supabase
      .from('public_booking_types')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      bookingType: data,
    };
  } catch (error) {
    console.error('[updatePublicBookingType] Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Eliminar tipo de reserva pública
 */
export async function deletePublicBookingType(id) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'No autenticado' };
    }

    const { error } = await supabase.from('public_booking_types').delete().eq('id', id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('[deletePublicBookingType] Error:', error);
    return { success: false, error: error.message };
  }
}
