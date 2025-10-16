// supabaseClient.js
// Configuración del cliente de Supabase para conectar tu proyecto.

const supabaseUrl = 'https://hvwygpnuunuuylzondxt.supabase.co'; // Pega tu URL aquí
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2d3lncG51dW51dXlsem9uZHh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NDUzMTEsImV4cCI6MjA3NjEyMTMxMX0.FxjCX9epT_6LgWGdzdPhRUTP2vn4CLdixRqpFMRZK70'; // Pega tu anon key aquí

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);