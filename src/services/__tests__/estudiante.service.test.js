import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Simular el MODELO, no la BD
jest.unstable_mockModule('../../models/estudiante.model.js', () => ({
  registrarEstudianteDB: jest.fn(),
  modificarInformacionEstudiante: jest.fn(),
  obtenerInformacionCompleta: jest.fn(),
}));

jest.unstable_mockModule('../../config/logger.js', () => ({
  default: { info: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

// No hacer mock de response.util.js, usar la función real

describe('Estudiante Service', () => {
  let EstudianteModel;
  let EstudianteService;

  beforeEach(async () => {
    jest.clearAllMocks();
    EstudianteModel = (await import('../../models/estudiante.model.js'));
    EstudianteService = await import('../estudiante.service.js');
  });

  const datosValidos = {
    siglaTipoDocumento: 'CC',
    nombreGenero: 'Masculino',
    nombres: 'Juan Carlos',
    apellidos: 'Pérez García',
    numeroDocumento: '12345678',
    fechaNacimiento: '1995-05-15',
    correo: 'juan.perez@test.com',
    programaNombres: ['Ingeniería de Sistemas']
  };

  describe('registrarEstudiante', () => {
    it('debería registrar exitosamente un estudiante con datos válidos', async () => {
      const mockResponse = { estudianteId: 'student-uuid', mensaje: 'Estudiante registrado exitosamente' };
      EstudianteModel.registrarEstudianteDB.mockResolvedValue(mockResponse);
      const resultado = await EstudianteService.registrarEstudiante(datosValidos);
      expect(resultado.success).toBe(true);
      expect(resultado.data.id).toBe('student-uuid');
    });


  });

  describe('modificarEstudiante', () => {
    const datosModificacion = {
      nombres: 'Juan Carlos Modificado',
      correo: 'juan.modificado@test.com',
    };

    it('debería modificar exitosamente un estudiante', async () => {
      const mockResponse = { mensaje: 'Solicitud procesada para actualización exitosamente.' };
      EstudianteModel.modificarInformacionEstudiante.mockResolvedValue([mockResponse]);
      const resultado = await EstudianteService.modificarEstudiante('CC', '12345678', datosModificacion);
      expect(resultado).toEqual(mockResponse);
    });

    it('debería manejar correo duplicado en modificación', async () => {
       const mockResponse = { mensaje: 'El correo electrónico ya está en uso por otro estudiante.' };
       EstudianteModel.modificarInformacionEstudiante.mockResolvedValue([mockResponse]);
       await expect(EstudianteService.modificarEstudiante('CC', '12345678', datosModificacion)).rejects.toThrow('El correo electrónico ya está en uso por otro estudiante.');
    });
  });

  describe('obtenerEstudiantePorDocumento', () => {
    it('debería obtener exitosamente un estudiante por documento', async () => {
      const estudianteMock = { id: 1, nombres: 'Juan Carlos' };
      EstudianteModel.obtenerInformacionCompleta.mockResolvedValue([estudianteMock]);
      const resultado = await EstudianteService.obtenerEstudiantePorDocumento('CC', '12345678');
      expect(resultado).toEqual(estudianteMock);
    });

    it('debería fallar cuando el estudiante no existe', async () => {
      EstudianteModel.obtenerInformacionCompleta.mockResolvedValue([]);
      await expect(EstudianteService.obtenerEstudiantePorDocumento('CC', '99999999')).rejects.toThrow('Estudiante no encontrado.');
    });
  });
});