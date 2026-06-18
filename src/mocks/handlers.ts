import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/auth/user', () => {
    return HttpResponse.json({ 
      id: 1, 
      name: 'Test User',
      email: 'test@example.com'
    });
  }),
  
  http.post('/api/auth/login', () => {
    return HttpResponse.json({ 
      token: 'fake-jwt-token',
      user: { id: 1, name: 'Test User' }
    });
  }),

  http.get('/api/*', () => {
    return HttpResponse.json({ data: [] });
  })
];
