export default {
  expo: {
    name: "ExpTrack",
    slug: "ExpTrack",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      // Variables de entorno de Supabase
      // Puedes configurarlas en un archivo .env o directamente aquí
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || "https://ftuwmlkpnmvninmmbbdx.supabase.co",
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0dXdtbGtwbm12bmlubW1iYmR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTgxNTMsImV4cCI6MjA3ODM3NDE1M30.3m4_f9hkGCKmbkSWiEoLWcz9Za2L_Al6CAtM0DHDP7E",
    }
  }
};

