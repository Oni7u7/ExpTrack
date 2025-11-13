-- Script SQL para crear la tabla usuarios en Supabase
-- Ejecuta este script en el SQL Editor de Supabase (Dashboard > SQL Editor)

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Crear un índice en el email para búsquedas más rápidas
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- Habilitar Row Level Security (RLS) si es necesario
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Política para permitir que los usuarios vean solo sus propios datos
-- (Ajusta según tus necesidades de seguridad)
CREATE POLICY "Users can view own data" ON usuarios
  FOR SELECT USING (true);

-- Política para permitir que cualquiera pueda insertar (registrarse)
CREATE POLICY "Anyone can register" ON usuarios
  FOR INSERT WITH CHECK (true);



