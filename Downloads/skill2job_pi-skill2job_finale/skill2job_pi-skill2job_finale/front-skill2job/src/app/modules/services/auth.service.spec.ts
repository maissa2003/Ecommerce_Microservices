import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { AuthService, JwtResponse } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#login', () => {
    it('should return a JwtResponse', () => {
      const mockResponse: JwtResponse = {
        token: 'xxx.yyy.zzz',
        type: 'Bearer',
        username: 'testuser',
        roles: ['ROLE_LEARNER']
      };

      service.login('testuser', 'password').subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:8090/api/auth/login');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('#register', () => {
    it('should send a POST request and return a success message', () => {
      const mockMsg = 'User registered successfully';
      service
        .register('user', 'email@test.com', 'pass', ['learner'])
        .subscribe(msg => {
          expect(msg).toEqual(mockMsg);
        });

      const req = httpMock.expectOne('http://localhost:8090/api/auth/register');
      expect(req.request.method).toBe('POST');
      req.flush(mockMsg);
    });
  });

  describe('LocalStorage Management', () => {
    it('should save token and user info to localStorage', () => {
      const userInfo: JwtResponse = {
        token: 'tk',
        type: 'Bearer',
        username: 'u',
        roles: ['r']
      };
      service.saveToken('tk', userInfo);
      expect(localStorage.getItem('token')).toBe('tk');
      expect(localStorage.getItem('user')).toContain('tk');
    });

    it('should clear localStorage on logout', () => {
      localStorage.setItem('token', 'tk');
      service.logout();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('#getCurrentUserId', () => {
    it('should return userId from user object in localStorage', () => {
      const userInfo = { id: 123, username: 'u' };
      localStorage.setItem('user', JSON.stringify(userInfo));
      expect(service.getCurrentUserId()).toBe(123);
    });

    it('should fallback to ID 1 for ADMIN role', () => {
      const userInfo = { roles: ['ROLE_ADMIN'] };
      localStorage.setItem('user', JSON.stringify(userInfo));
      expect(service.getCurrentUserId()).toBe(1);
    });
  });
});
