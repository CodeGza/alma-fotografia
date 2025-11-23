'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

/**
 * Obtener información del perfil del usuario
 */
export async function getProfileData() {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'No se pudo obtener el usuario' };
    }

    // Obtener el perfil desde la tabla user_profiles para incluir permisos
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error obteniendo user_profile:', profileError);
    }

    return {
      success: true,
      profile: {
        id: user.id,
        email: user.email,
        username: userProfile?.username || user.user_metadata?.username || '',
        full_name: userProfile?.full_name || user.user_metadata?.full_name || 'Fernanda',
        phone: user.user_metadata?.phone || '',
        bio: user.user_metadata?.bio || '',
        instagram: user.user_metadata?.instagram || '@almafotografiauy',
        facebook: user.user_metadata?.facebook || 'Alma Fotografía',
        tiktok: user.user_metadata?.tiktok || '@almafotografiauy',
        permissions: userProfile?.permissions || {},
        is_active: userProfile?.is_active || false,
      }
    };
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Actualizar información del perfil del usuario
 */
export async function updateProfile(formData) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'No se pudo obtener el usuario' };
    }

    // Actualizar metadatos del usuario
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        full_name: formData.full_name,
        phone: formData.phone,
        bio: formData.bio,
        instagram: formData.instagram,
        facebook: formData.facebook,
        tiktok: formData.tiktok,
      }
    });

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    revalidatePath('/dashboard/configuracion/perfil');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Actualizar email del usuario
 */
export async function updateEmail(newEmail) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'No se pudo obtener el usuario' };
    }

    // Actualizar email (Supabase enviará email de confirmación)
    const { error: updateError } = await supabase.auth.updateUser({
      email: newEmail
    });

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return {
      success: true,
      message: 'Se ha enviado un correo de confirmación a tu nueva dirección'
    };
  } catch (error) {
    console.error('Error al actualizar email:', error);
    return { success: false, error: error.message };
  }
}
