// componentes/localStorage-cache.js

/**
 * Módulo para gestionar el almacenamiento en localStorage.
 * Centraliza las funciones de caché para una mejor reusabilidad y control.
 */
const LocalStorageCache = {
    /**
     * Almacena datos en el localStorage.
     * @param {string} key La clave para el almacenamiento.
     * @param {any} data Los datos a guardar.
     */
    cacheData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            console.log(`💾 Datos guardados en localStorage con la clave: ${key}`);
        } catch (e) {
            console.error('Error al guardar en localStorage:', e);
        }
    },

    /**
     * Carga datos desde el localStorage.
     * @param {string} key La clave para el almacenamiento.
     * @returns {any|null} Los datos o null si no existen.
     */
    loadCachedData(key) {
        try {
            const data = localStorage.getItem(key);
            if (data) {
                console.log(`✅ Datos recuperados de localStorage para la clave: ${key}`);
                return JSON.parse(data);
            }
        } catch (e) {
            console.error('Error al cargar de localStorage:', e);
        }
        return null;
    }
};

window.LocalStorageCache = LocalStorageCache;