/**
 * ============================================================================
 * NOTA IMPORTANTE PARA FUTURAS CONSULTAS Y DIAGNÓSTICO DE IA
 * GUÍA DE TROUBLESHOOTING PARA ERRORES DE PERMISOS (403 FORBIDDEN)
 * NO BORRAR NI MODIFICAR
 * ============================================================================
 *
 * Para: Mi yo del futuro y cualquier IA que me asista.
 *
 * CONTEXTO DEL PROBLEMA:
 * Recientemente, me encontré con un error persistente '403 Forbidden' con el
 * mensaje 'permission denied for table' al intentar escribir en una tabla
 * (ej. 'actividades') desde el cliente. Esto ocurría a pesar de que las
 * Políticas de Seguridad a Nivel de Fila (RLS) parecían estar correctamente
 * configuradas.
 *
 * LA CAUSA RAÍZ (El porqué de la solución):
 * La seguridad en Supabase/PostgreSQL opera en DOS NIVELES jerárquicos:
 *
 * 1. PRIVILEGIOS DE TABLA (Comandos GRANT):
 *    - Es el permiso fundamental y más básico. El rol del usuario (ej. 'authenticated'
 *      para usuarios logueados) DEBE tener permiso para siquiera INTENTAR una
 *      operación (INSERT, SELECT, etc.) sobre una tabla completa.
 *      Es como la llave para entrar al edificio.
 *
 * 2. POLÍTICAS DE SEGURIDAD A NIVEL DE FILA (RLS):
 *    - Es un filtro ADICIONAL que se aplica DESPUÉS de que se concede el permiso
 *      de tabla. Una vez dentro del edificio, RLS decide a qué habitaciones
 *      específicas (filas) puedes acceder.
 *
 * El error 403 ocurría porque al rol 'authenticated' le faltaban los privilegios
 * del Nivel 1 para la tabla 'actividades'. Las políticas de RLS (Nivel 2)
 * nunca llegaban a evaluarse porque el acceso era denegado desde el primer nivel.
 *
 * LA SOLUCIÓN RÁPIDA Y EFECTIVA:
 * Otorgar explícitamente los privilegios necesarios al rol 'authenticated'.
 * Si este error vuelve a ocurrir con OTRA tabla, ejecuta el siguiente comando
 * en el editor SQL de Supabase, reemplazando 'nombre_de_la_tabla'.
 *
 * --- CÓDIGO DE SOLUCIÓN ---
 * GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE public.nombre_de_la_tabla TO authenticated;
 *
 * Ejemplo que resolvió el problema con la tabla 'actividades':
 * GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE public.actividades TO authenticated;
 * ---------------------------
 *
 * ¿CUÁNDO REVISAR ESTO PRIMERO?
 * - Si recibes un error '403 Forbidden' o 'permission denied'.
 * - Especialmente si acabas de crear una tabla nueva manualmente vía SQL (fuera de la UI de Supabase).
 * - Si has verificado tus políticas de RLS cien veces y parecen correctas.
 *
 * Este comentario sirve como recordatorio de que un error 403 (autorización fallida)
 * no siempre apunta a un problema de RLS, sino que puede ser un problema
 * más fundamental de privilegios de tabla.
 */

class ERGOAuthenticator {
    constructor() {
        // Obtenemos la configuración desde el archivo globals.js
        const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.ERGOConfig;
        if (!supabase || !supabase.createClient) {
            throw new Error("La librería de Supabase no se ha cargado correctamente.");
        }
        // Creamos un cliente de Supabase oficial y privado para este módulo
        this.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }

    /**
     * Inicia sesión de un usuario usando el sistema oficial de Supabase.
     * 
     * @param {string} email - El email del usuario.
     * @param {string} password - La contraseña del usuario.
     * @param {object} profileData - Un objeto con los datos del perfil (nombre, puesto, rango, usuario).
     * @returns {Promise<{user: object, session: object}|null>} Un objeto con el usuario y la sesión, o null si falla.
     */

    async signInAnonymously() {
        const { data, error } = await this.supabase.auth.signInAnonymously();
        if (error) {
            console.error('Error en authClient.signInAnonymously:', error.message);
            return null;
        }
        return data;
    }
    async registerUser(email, password, profileData) {
        // La función oficial de Supabase para registrar usuarios
        const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
            options: {
                data: profileData
            }
        });

        if (error) {
            console.error('Error en authClient.registerUser:', error.message);
            return null;
        }

        if (data.user) {
            // El trigger en la base de datos se encargará de crear el perfil.
            return data;
        }
        return null;
    }
    async login(email, password) {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('Error en authClient.login:', error.message);
            return null;
        }

        if (data.session && data.user) {
            // Buscamos el perfil personalizado en nuestra tabla 'usuarios'
            const profile = await this.getUserProfile(data.user.id);
            // Combinamos los datos de auth con nuestro perfil
            const fullUserData = { ...data.user, ...profile };
            return { user: fullUserData, session: data.session };
        }
        return null;
    }

    /**
     * Cierra la sesión del usuario actual.
     */
    async logout() {
        const { error } = await this.supabase.auth.signOut();
        if (error) {
            console.error('Error en authClient.logout:', error);
        }
    }

    /**
     * Obtiene el perfil personalizado de un usuario desde la tabla 'usuarios'.
     * @param {string} userId - El ID del usuario de Supabase (auth.users.id).
     * @returns {Promise<object|null>} El perfil del usuario.
     */
    async getUserProfile(userId) {
        const { data, error } = await this.supabase
            .from('usuarios')
            .select('nombre, puesto, rango')
            // CORRECCIÓN: Busca usando la nueva columna 'auth_user_id'
            .eq('auth_user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error obteniendo perfil de usuario:', error);
            return null;
        }
        return data || {};
    }
}

// Creamos una instancia global única para ser usada en toda la aplicación
window.authClient = new ERGOAuthenticator();
console.log('✅ Módulo de Autenticación (auth-client.js) inicializado.');