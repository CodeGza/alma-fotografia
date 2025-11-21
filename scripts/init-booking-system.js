/**
 * Script para inicializar el sistema de reservas públicas
 * Crea los tipos de reunión y horarios de trabajo por defecto
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno necesarias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function initBookingSystem() {
  console.log('🚀 Inicializando sistema de reservas...\n');

  try {
    // 1. Crear tipos de reunión pública
    console.log('📝 Creando tipos de reunión pública...');

    const bookingTypes = [
      {
        name: 'Reunión Presencial',
        slug: 'presencial',
        description: 'Reunión en nuestro estudio para conocernos y charlar sobre tu proyecto',
        duration_minutes: 35,
        color: '#79502A',
        is_active: true,
        display_order: 1,
      },
      {
        name: 'Reunión Virtual',
        slug: 'videollamada',
        description: 'Videollamada para coordinar detalles y responder tus consultas',
        duration_minutes: 45,
        color: '#8B5A2F',
        is_active: true,
        display_order: 2,
      },
      {
        name: 'Sesión Exteriores',
        slug: 'exteriores',
        description: 'Charla sobre sesión fotográfica en exteriores',
        duration_minutes: 120,
        color: '#A67C52',
        is_active: true,
        display_order: 3,
      },
      {
        name: 'Sesión Estudio',
        slug: 'estudio',
        description: 'Charla sobre sesión fotográfica en estudio',
        duration_minutes: 120,
        color: '#6B4423',
        is_active: true,
        display_order: 4,
      },
    ];

    for (const type of bookingTypes) {
      const { data, error } = await supabase
        .from('public_booking_types')
        .upsert(type, { onConflict: 'slug' })
        .select()
        .single();

      if (error) {
        console.error(`   ❌ Error creando ${type.name}:`, error.message);
      } else {
        console.log(`   ✅ ${type.name} creado/actualizado`);
      }
    }

    // 2. Configurar horarios de trabajo (Lunes a Viernes, 9:00 - 18:00)
    console.log('\n⏰ Configurando horarios de trabajo...');

    const workingHours = [
      { day_of_week: 0, is_working_day: false, start_time: '09:00', end_time: '18:00' }, // Domingo
      { day_of_week: 1, is_working_day: true, start_time: '09:00', end_time: '18:00' },  // Lunes
      { day_of_week: 2, is_working_day: true, start_time: '09:00', end_time: '18:00' },  // Martes
      { day_of_week: 3, is_working_day: true, start_time: '09:00', end_time: '18:00' },  // Miércoles
      { day_of_week: 4, is_working_day: true, start_time: '09:00', end_time: '18:00' },  // Jueves
      { day_of_week: 5, is_working_day: true, start_time: '09:00', end_time: '18:00' },  // Viernes
      { day_of_week: 6, is_working_day: false, start_time: '09:00', end_time: '18:00' }, // Sábado
    ];

    for (const wh of workingHours) {
      const { error } = await supabase
        .from('working_hours')
        .upsert(wh, { onConflict: 'day_of_week' });

      if (error) {
        console.error(`   ❌ Error configurando día ${wh.day_of_week}:`, error.message);
      } else {
        const dayName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][wh.day_of_week];
        console.log(`   ✅ ${dayName}: ${wh.is_working_day ? `${wh.start_time} - ${wh.end_time}` : 'No laborable'}`);
      }
    }

    console.log('\n✨ ¡Sistema de reservas inicializado correctamente!\n');
    console.log('📋 Resumen:');
    console.log('   - 4 tipos de reunión creados');
    console.log('   - Horarios: Lunes a Viernes, 9:00 - 18:00');
    console.log('   - Fin de semana: No disponible');
    console.log('\n🔗 Accedé a: http://localhost:3000/agendaProvisoria\n');

  } catch (error) {
    console.error('❌ Error general:', error.message);
    process.exit(1);
  }
}

initBookingSystem();
