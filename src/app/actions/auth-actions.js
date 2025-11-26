'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

/**
 * Registrar un nuevo usuario
 * Usa el username como parte del email interno pero almacena el username real
 */
export async function registerUser({ username, email, password, full_name }) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Handle error if needed
            }
          },
        },
      }
    );

    // Validar contraseña segura
    if (password.length < 8) {
      return { success: false, error: 'La contraseña debe tener al menos 8 caracteres' };
    }

    if (!/[A-Z]/.test(password)) {
      return { success: false, error: 'La contraseña debe contener al menos una mayúscula' };
    }

    if (!/[a-z]/.test(password)) {
      return { success: false, error: 'La contraseña debe contener al menos una minúscula' };
    }

    if (!/[0-9]/.test(password)) {
      return { success: false, error: 'La contraseña debe contener al menos un número' };
    }

    // Crear cliente con Service Role para poder confirmar el email automáticamente
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Registrar usuario en Supabase Auth usando el admin client
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirmar el email
      user_metadata: {
        username: username,
        full_name: full_name || 'Fernanda',
        instagram: '@almafotografiauy',
        facebook: 'Alma Fotografía',
        tiktok: '@almafotografiauy',
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Crear el perfil en user_profiles
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: data.user.id,
        email: email,
        username: username,
        full_name: full_name || 'Fernanda',
        is_active: true,
        permissions: {
          manage_users: false,
          edit_bookings: true,
          edit_galleries: true,
          delete_bookings: false,
          delete_galleries: false
        },
        requires_password_change: false
      });

    if (profileError) {
      // Si falla crear el perfil, eliminar el usuario de auth
      await supabaseAdmin.auth.admin.deleteUser(data.user.id);
      return { success: false, error: 'Error al crear perfil de usuario: ' + profileError.message };
    }

    return {
      success: true,
      message: 'Usuario registrado correctamente',
      user: data.user
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Iniciar sesión con username
 */
export async function loginUser({ usernameOrEmail, password }) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Handle error if needed
            }
          },
        },
      }
    );

    // Buscar el usuario por username en user_profiles (case-insensitive)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email, is_active')
      .ilike('username', usernameOrEmail)
      .single();

    if (profileError || !profile) {
      return { success: false, error: 'Usuario o contraseña incorrectos' };
    }

    // Verificar que el usuario esté activo
    if (!profile.is_active) {
      return { success: false, error: 'Tu cuenta ha sido deshabilitada. Contactá al administrador.' };
    }

    // Intentar login con el email del perfil
    const { data, error } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: password,
    });

    if (error) {
      return { success: false, error: 'Usuario o contraseña incorrectos' };
    }

    return {
      success: true,
      user: data.user
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Cerrar sesión
 */
export async function logoutUser() {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Handle error if needed
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
