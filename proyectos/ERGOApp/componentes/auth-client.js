// auth-client.js
// --- Nuevo Archivo de Autenticación Centralizado ---

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
     * @param {string} email - El email del usuario.
     * @param {string} password - La contraseña del usuario.
     * @returns {Promise<{user: object, session: object}|null>} Un objeto con el usuario y la sesión, o null si falla.
     */
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