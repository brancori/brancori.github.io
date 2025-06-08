// supabase-client.js - Versión corregida
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// ✅ URLs CORREGIDAS - Reemplaza con tus valores reales
const SUPABASE_URL = 'https://ywfmcvmpzvqzkatbkvqo.supabase.co'  // ❌ Quita los corchetes []
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Zm1jdm1wenZxemthdGJrdnFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMzcxMjUsImV4cCI6MjA2NDkxMzEyNX0.WNW_EkEvhyw5p0xrQ4SYv4DORidnONhsr-8vUbdzNKM'

// Validar que las URLs estén configuradas correctamente
if (!SUPABASE_URL || SUPABASE_URL.includes('[') || SUPABASE_URL.includes(']')) {
    console.error('❌ ERROR: SUPABASE_URL no está configurada correctamente')
    console.error('Current URL:', SUPABASE_URL)
    console.error('Debe ser algo como: https://tu-proyecto.supabase.co')
}

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.length < 50) {
    console.error('❌ ERROR: SUPABASE_ANON_KEY no está configurada correctamente')
}

let supabase = null

try {
    // Crear cliente de Supabase con manejo de errores
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            persistSession: false // Para evitar problemas de sesión en desarrollo
        },
        db: {
            schema: 'public'
        }
    })
    
    // Hacer disponible globalmente
    window.supabase = supabase
    console.log('✅ Supabase client inicializado correctamente')
    
    // Test de conexión opcional
    testConnection()
    
} catch (error) {
    console.error('❌ Error inicializando Supabase:', error)
    console.warn('⚠️ Continuando en modo offline (localStorage solamente)')
    window.supabase = null
}

// Función para probar la conexión (opcional)
async function testConnection() {
    try {
        // Intentar una consulta simple para verificar conectividad
        const { data, error } = await supabase
            .from('areas')
            .select('count')
            .limit(1)
        
        if (error) {
            console.warn('⚠️ Supabase conectado pero hay un error en la consulta:', error.message)
        } else {
            console.log('✅ Conexión a Supabase verificada')
        }
    } catch (error) {
        console.warn('⚠️ No se pudo verificar la conexión a Supabase:', error.message)
    }
}

export default supabase

// Al final, después de export default supabase
window.supabaseClient = supabase;
window.supabase = supabase; // Mantener compatibilidad