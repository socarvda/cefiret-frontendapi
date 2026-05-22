const API_BASE_URL = localStorage.getItem('API_BASE_URL') || 'https://cefiret-api-production.up.railway.app/';

const ROUTES = {
  login: '/views/auth/login.html',
  dashboard: '/views/dashboard/index.html',
  usuariosCrear: '/views/usuarios/crear.html',
  usuariosBuscar: '/views/usuarios/buscar.html',
  expedientesBuscar: '/views/expedientes/buscar.html',
  rutinas: '/views/rutinas/index.html',
  citas: '/views/citas/index.html',
  progreso: '/views/progreso/index.html',
  videos: '/views/videos/index.html'
};
