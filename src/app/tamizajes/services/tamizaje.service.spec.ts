import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TamizajeService } from './tamizaje.service';
import { ApiService } from '../../core/services/api.service';

describe('TamizajeService', () => {
  let service: TamizajeService;
  let api: jest.Mocked<Pick<ApiService, 'get' | 'post' | 'put'>>;

  beforeEach(() => {
    api = { get: jest.fn(), post: jest.fn(), put: jest.fn() };
    TestBed.configureTestingModule({
      providers: [TamizajeService, { provide: ApiService, useValue: api }],
    });
    service = TestBed.inject(TamizajeService);
  });

  it('listarPorCaso', (done) => {
    api.get.mockReturnValue(of({ data: [] }));
    service.listarPorCaso('1').subscribe((res) => {
      expect(api.get).toHaveBeenCalledWith('/casos/1/tamizajes');
      expect(res.data).toEqual([]);
      done();
    });
  });

  it('obtenerExpediente', (done) => {
    api.get.mockReturnValue(of({ data: { menor: {}, serie: [] } }));
    service.obtenerExpediente('2').subscribe(() => {
      expect(api.get).toHaveBeenCalledWith('/casos/2/expediente');
      done();
    });
  });

  it('crear y actualizar', (done) => {
    api.post.mockReturnValue(of({ data: {}, sugerenciaRecuperacion: false }));
    api.put.mockReturnValue(of({ data: {}, curvaRecalculada: [] }));
    service.crear('1', { pesoKg: 8 } as never).subscribe();
    service.actualizar('t1', { pesoKg: 9 } as never).subscribe(() => {
      expect(api.post).toHaveBeenCalledWith('/casos/1/tamizajes', { pesoKg: 8 });
      expect(api.put).toHaveBeenCalledWith('/tamizajes/t1', { pesoKg: 9 });
      done();
    });
  });
});
