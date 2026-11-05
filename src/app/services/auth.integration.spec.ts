import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { AuthService, AuthResponse } from './auth.service';
import { Component } from '@angular/core';

// ─── Rutas mínimas — selectores únicos para evitar NG0912 ───────────────────
@Component({ standalone: true, selector: 'app-fake-home', template: '' })
class FakeHomeComponent {}

@Component({ standalone: true, selector: 'app-fake-dashboard', template: '' })
class FakeDashboardComponent {}

const TEST_ROUTES = [
  { path: '', component: FakeHomeComponent },
  { path: 'dashboard', component: FakeDashboardComponent },
];

// ─── Datos de prueba (sin información real sensible) ────────────────────────
const VALID_CREDENTIALS = { email: 'test@demo.dev', password: 'Test1234!' };

const VALID_RESPONSE: AuthResponse = {
  token: 'header.payload.signature',
  email: 'test@demo.dev',
  name: 'Usuario Test',
  role: 'USER',
};

// ─── Suite ──────────────────────────────────────────────────────────────────
describe('AuthService — Pruebas de Integración (Fase 3)', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  // Almacén en memoria para localStorage (sin tocar el real)
  const store: Record<string, string> = {};

  beforeEach(() => {
    Object.keys(store).forEach(k => delete store[k]);

    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(k => store[k] ?? null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((k, v) => { store[k] = v; });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(k => { delete store[k]; });

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter(TEST_ROUTES),
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  // ── TC-I01: Flujo HTTP correcto ──────────────────────────────────────────
  it('TC-I01 [FLUJO OK] login con HTTP real actualiza estado de autenticación y persiste token', () => {
    // Arrange
    let responseReceived = false;

    // Act — llamada real al servicio que internamente usa HttpClient
    service.login(VALID_CREDENTIALS.email, VALID_CREDENTIALS.password).subscribe({
      next: () => { responseReceived = true; },
      error: () => { throw new Error('No debería fallar con respuesta 200'); },
    });

    // Interceptamos la solicitud HTTP real que hizo el servicio
    const req = httpMock.expectOne('http://localhost:8082/api/auth/login');

    // Verificamos que la integración construyó correctamente el body HTTP
    expect(req.request.body).toEqual(VALID_CREDENTIALS);
    expect(req.request.method).toBe('POST');

    // Simulamos respuesta del backend con datos de prueba
    req.flush(VALID_RESPONSE, { status: 200, statusText: 'OK' });

    // Assert — comprobamos estado resultante de la integración completa
    expect(responseReceived).toBe(true);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.getToken()).toBe('header.payload.signature');
    // El token fue persistido en el storage integrado
    expect(store['app.auth.token']).toBe('header.payload.signature');
    // El perfil de usuario quedó serializado correctamente
    const savedUser = JSON.parse(store['app.user.id']);
    expect(savedUser.email).toBe('test@demo.dev');
    expect(savedUser.role).toBe('USER');
  });

  // ── TC-I02: Error 401 del servidor no rompe la app ───────────────────────
  it('TC-I02 [ERROR HTTP] respuesta 401 del servidor propaga el error sin corromper el estado', () => {
    // Arrange
    let errorCaptured = false;

    // Act
    service.login('hacker@evil.com', 'wrong').subscribe({
      next: () => { throw new Error('Debería haber fallado'); },
      error: (err) => {
        errorCaptured = true;
        // Assert dentro del error handler
        expect(err.status).toBe(401);
      },
    });

    // Simulamos respuesta 401 del backend
    const req = httpMock.expectOne('http://localhost:8082/api/auth/login');
    req.flush({ message: 'Credenciales inválidas' }, { status: 401, statusText: 'Unauthorized' });

    // Assert — el estado de auth NO cambió tras el error
    expect(errorCaptured).toBe(true);
    expect(service.isAuthenticated()).toBe(false);
    expect(service.getToken()).toBeNull();
    // Ningún dato se persistió en storage
    expect(store['app.auth.token']).toBeUndefined();
  });

  // ── TC-I03: logout integrado con Router ──────────────────────────────────
  it('TC-I03 [LOGOUT+ROUTER] logout limpia storage completo y llama a router.navigate("/")', () => {
    // Arrange — espiamos router.navigate para verificar la integración sin fakeAsync
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    // Poblamos el store simulando sesión activa
    store['app.auth.token'] = 'token-activo';
    store['app.user.id'] = JSON.stringify({ email: 'test@demo.dev', name: 'Test', role: 'USER' });

    // Forzamos al servicio a reconocer la sesión cargando el perfil manualmente
    // (evitamos re-crear TestBed para no necesitar zone-testing)
    // Llamamos login primero para tener usuario autenticado en memoria
    service.login(VALID_CREDENTIALS.email, VALID_CREDENTIALS.password).subscribe();
    const req = httpMock.expectOne('http://localhost:8082/api/auth/login');
    req.flush(VALID_RESPONSE);

    // Verificamos que hay sesión activa antes del logout
    expect(service.isAuthenticated()).toBe(true);
    expect(service.getToken()).toBe('header.payload.signature');

    // Act — ejecutamos logout (integración real: AuthService ↔ Router ↔ Storage)
    service.logout();

    // Assert 1 — estado de memoria completamente limpiado
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(service.getToken()).toBeNull();

    // Assert 2 — keys de storage eliminados (integración con localStorage)
    expect(store['app.auth.token']).toBeUndefined();
    expect(store['app.user.id']).toBeUndefined();

    // Assert 3 — Router.navigate fue invocado con '/' (integración con Router)
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });
});
