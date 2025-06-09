// supabase-config.js
const SUPABASE_URL = 'https://ywfmcvmpzvqzkatbkvqo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Zm1jdm1wenZxemthdGJrdnFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMzcxMjUsImV4cCI6MjA2NDkxMzEyNX0.WNW_EkEvhyw5p0xrQ4SYv4DORidnONhsr-8vUbdzNKM';

// Cliente básico de Supabase
class SupabaseClient {
    constructor(url, key) {
        this.url = url;
        this.key = key;
        this.headers = {
            'Content-Type': 'application/json',
            'apikey': key,
            'Authorization': `Bearer ${key}`
        };
    }

async query(table, method = 'GET', data = null, filters = '') {
    const url = `${this.url}/rest/v1/${table}${filters}`;
    
    const options = {
        method: method,
        headers: this.headers
    };
    
    if (data && (method === 'POST' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Para métodos que no devuelven datos
        if (method === 'POST' || method === 'PATCH' || method === 'DELETE') {
            return { success: true }; // Devolver un objeto simple para indicar éxito
        }
        
        // Solo para GET, intentar parsear JSON
        const text = await response.text();
        if (!text) {
            return null;
        }
        
        return JSON.parse(text);
    } catch (error) {
        console.error('Supabase query error:', error);
        throw error;
    }
}

    // Métodos específicos para cada tabla
    async getAreas() {
        return await this.query('areas');
    }

    async createArea(area) {
        return await this.query('areas', 'POST', area);
    }

    async deleteArea(id) {
        return await this.query('areas', 'DELETE', null, `?id=eq.${id}`);
    }

    async getWorkCenters(areaId = null) {
        const filter = areaId ? `?area_id=eq.${areaId}` : '';
        return await this.query('work_centers', 'GET', null, filter);
    }

    async createWorkCenter(workCenter) {
        return await this.query('work_centers', 'POST', workCenter);
    }

    async deleteWorkCenter(id) {
        return await this.query('work_centers', 'DELETE', null, `?id=eq.${id}`);
    }

    async getEvaluaciones(workCenterId = null) {
        const filter = workCenterId ? `?work_center_id=eq.${workCenterId}` : '';
        return await this.query('evaluaciones', 'GET', null, filter);
    }

    async createEvaluacion(evaluacion) {
        return await this.query('evaluaciones', 'POST', evaluacion);
    }

    async updateEvaluacion(id, evaluacion) {
        return await this.query('evaluaciones', 'PATCH', evaluacion, `?id=eq.${id}`);
    }
}

// Instancia global
const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);