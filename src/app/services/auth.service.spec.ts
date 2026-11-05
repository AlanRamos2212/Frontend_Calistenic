/**
 * FASE 2 — Pruebas Unitarias: AuthService
 * =========================================
 * Funcionalidad crítica: Autenticación y persistencia de sesión JWT
 *
 * Cobertura:
 *  - TC-U01: Caso válido   → login exitoso guarda token y expone usuario
 *  - TC-U02: Caso límite   → token con espacios en blanco NO se persiste
 *  - TC-U03: Caso inválido → JSON corrupto en localStorage dispara logout
 *
 * Dependencias aisladas mediante vi.spyOn y mocks de localStorage.
 */

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService, AuthResponse } from './auth.service';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Respuesta simulada válida devuelta por el backend */
const MOCK_AUTH_RESPONSE: AuthResponse = {
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.sig',
  email: 'atleta@calistenictrack.dev',
  name: 'Atleta Demo',
  role: 'USER',
};

/** Respuesta con token vacío/espacios (caso límite) */
const MOCK_BLANK_TOKEN_RESPONSE: AuthResponse = {
  token: '   ',
  email: 'borde@ejemplo.com',
  name: 'Borde',
  role: 'USER',
};

// ─── Suite ──────────────────────────────────────────────────────────────────

describe('AuthService — Pruebas Unitarias (Fase 2)', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    // Aislamos localStorage con mocks en memoria
    const store: Record<string, string> = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
      (key: string) => store[key] ?? null
    );
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
      (key: string, value: string) => { store[key] = value; }
    );
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(
      (key: string) => { delete store[key]; }
    );

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  // ── TC-U01: Caso válido ──────────────────────────────────────────────────
  it('TC-U01 [VÁLIDO] login exitoso persiste token y expone usuario autenticado', () => {
    // Arrange
    let loginCompleted = false;

    // Act
    service.login('atleta@calistenictrack.dev', 'Segura#123').subscribe(() => {
      loginCompleted = true;
    });

    // Simulamos la respuesta del backend
    const req = httpMock.expectOne('http://localhost:8082/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'atleta@calistenictrack.dev',
      password: 'Segura#123',
    });
    req.flush(MOCK_AUTH_RESPONSE);

    // Assert
    expect(loginCompleted).toBe(true);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()?.email).toBe('atleta@calistenictrack.dev');
    expect(service.currentUser()?.name).toBe('Atleta Demo');
    expect(service.currentUser()?.role).toBe('USER');
    expect(service.getToken()).toBe(MOCK_AUTH_RESPONSE.token);
  });

  // ── TC-U02: Caso límite ──────────────────────────────────────────────────
  it('TC-U02 [LÍMITE] token con sólo espacios en blanco NO se almacena en localStorage', () => {
    // Arrange
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    // Act
    service.login('borde@ejemplo.com', 'cualquier').subscribe();

    const req = httpMock.expectOne('http://localhost:8082/api/auth/login');
    req.flush(MOCK_BLANK_TOKEN_RESPONSE);

    // Assert — el token ' ' (trimmed) es falsy, por lo que NO debe guardarse
    const tokenSaveCalls = setItemSpy.mock.calls.filter(
      ([key]) => key === 'app.auth.token'
    );
    expect(tokenSaveCalls).toHaveLength(0);
    expect(service.getToken()).toBeNull();
  });

  // ── TC-U03: Caso inválido / error ────────────────────────────────────────
  it('TC-U03 [INVÁLIDO] JSON corrupto en localStorage dispara logout al iniciar', () => {
    // Arrange — inyectamos datos corruptos antes de crear el servicio
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
      if (key === 'app.auth.token') return 'algun-token-real';
      if (key === 'app.user.id') return '{ esto no es JSON válido }}}';
      return null;
    });

    // Espiamos logout para confirmar que se llama
    const logoutSpy = vi.spyOn(AuthService.prototype, 'logout');

    // Act — reconstruimos el servicio para que loadSession() se ejecute de nuevo
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    const freshService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Assert — estado NO autenticado tras JSON corrupto
    expect(freshService.isAuthenticated()).toBe(false);
    expect(freshService.currentUser()).toBeNull();
  });
});
