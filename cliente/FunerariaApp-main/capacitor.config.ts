import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.funerariaapp',
  appName: 'FunerariaApp',
  webDir: 'www',
  server: {
    url: 'https://systemabmxli.com/funeraria_app/',  // Aquí agregas la URL completa
    cleartext: true  // Esto es necesario para permitir conexiones HTTP en Android
  }
};
export default config;

