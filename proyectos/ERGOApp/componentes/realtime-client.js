class ERGORealtimeClient {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
        this.channels = {};
        console.log('✅ Cliente Realtime inicializado.');
    }

    /**
     * Se suscribe a los cambios en una tabla y ejecuta un callback.
     * @param {string} channelName Nombre único del canal.
     * @param {string} tableName El nombre de la tabla a escuchar.
     * @param {function} callback La función a ejecutar cuando hay un cambio.
     * @param {string} localStorageKey La clave para guardar en localStorage.
     */
    subscribeAndCache(channelName, tableName, callback, localStorageKey) {
        if (this.channels[channelName]) {
            console.warn(`⚠️ Ya existe una suscripción para el canal ${channelName}.`);
            return;
        }

        const channel = this.supabase.channel(channelName)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: tableName },
                payload => {
                    console.log(`🔔 Cambio en la tabla ${tableName}:`, payload);
                    // Usamos las funciones del módulo externo
                    const cachedData = LocalStorageCache.loadCachedData(localStorageKey) || [];
                    let newData = [];

                    switch (payload.eventType) {
                        case 'INSERT':
                            newData = [payload.new, ...cachedData];
                            break;
                        case 'UPDATE':
                            newData = cachedData.map(item =>
                                item.id === payload.new.id ? payload.new : item
                            );
                            break;
                        case 'DELETE':
                            newData = cachedData.filter(item =>
                                item.id !== payload.old.id
                            );
                            break;
                        default:
                            newData = cachedData;
                    }

                    LocalStorageCache.cacheData(localStorageKey, newData);
                    callback(payload);
                }
            )
            .subscribe((status, err) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`✅ Suscrito al canal ${channelName}.`);
                }
                if (err) {
                    console.error('❌ Error en la suscripción a Realtime:', err);
                }
            });

        this.channels[channelName] = channel;
    }

    /**
     * Elimina todas las suscripciones a canales activas.
     */
    unsubscribeAll() {
        for (const name in this.channels) {
            if (this.channels[name]) {
                this.channels[name].unsubscribe();
            }
        }
        this.channels = {};
        console.log('🧹 Todas las suscripciones a Realtime se han eliminado.');
    }
    setAuth(token) {
        if (this.supabase && this.supabase.realtime) {
            this.supabase.realtime.setAuth(token);
            console.log('✅ Token de autenticación de Realtime actualizado.');
        } else {
            console.warn('⚠️ Cliente de Realtime o Supabase no inicializado, no se pudo actualizar el token.');
        }
    }
}

window.realtimeClient = new ERGORealtimeClient(window.dataClient.supabase);