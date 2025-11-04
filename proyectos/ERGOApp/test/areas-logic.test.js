// proyectos/ERGOApp/tests/areas-logic.test.js
import { describe, it, expect } from 'vitest';
import {
  validateAreaData,
  areaExists,
  createAreaObject,
  createAreaUpdateObject,
  countWorkCentersByArea,
  generateDeleteConfirmation,
  removeAreaFromList,
  removeWorkCentersByArea,
  updateAreaInList
} from '../componentes/areas-logic.js';

describe('Validación de áreas', () => {
  it('debe validar datos correctos', () => {
    const result = validateAreaData('Producción', 'Juan Pérez');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('debe rechazar nombre vacío', () => {
    const result = validateAreaData('', 'Juan Pérez');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('El nombre del área es requerido');
  });

  it('debe rechazar responsable vacío', () => {
    const result = validateAreaData('Producción', '');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('El responsable es requerido');
  });

  it('debe rechazar ambos campos vacíos', () => {
    const result = validateAreaData('', '');
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(2);
  });

  it('debe aceptar espacios en blanco y trimearlos', () => {
    const result = validateAreaData('  Producción  ', '  Juan  ');
    expect(result.isValid).toBe(true);
  });
});

describe('Verificación de existencia de áreas', () => {
  const existingAreas = [
    { id: '1', name: 'Producción', responsible: 'Juan' },
    { id: '2', name: 'Almacén', responsible: 'María' }
  ];

  it('debe detectar área existente (case insensitive)', () => {
    expect(areaExists(existingAreas, 'producción')).toBe(true);
    expect(areaExists(existingAreas, 'PRODUCCIÓN')).toBe(true);
    expect(areaExists(existingAreas, 'Producción')).toBe(true);
  });

  it('debe permitir área nueva', () => {
    expect(areaExists(existingAreas, 'Ventas')).toBe(false);
  });

  it('debe excluir el área actual al editar', () => {
    // Al editar "Producción" con id "1", debe permitir mantener el mismo nombre
    expect(areaExists(existingAreas, 'Producción', '1')).toBe(false);
    
    // Pero no debe permitir un nombre que ya existe en otra área
    expect(areaExists(existingAreas, 'Almacén', '1')).toBe(true);
  });
});

describe('Creación de objetos de área', () => {
  it('debe crear área nueva con estructura correcta', () => {
    const area = createAreaObject('abc123', 'Producción', 'Juan Pérez');
    
    expect(area).toHaveProperty('id', 'abc123');
    expect(area).toHaveProperty('name', 'Producción');
    expect(area).toHaveProperty('responsible', 'Juan Pérez');
    expect(area).toHaveProperty('created_at');
    expect(area.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO format
  });

  it('debe trimear espacios en nombre y responsable', () => {
    const area = createAreaObject('abc', '  Producción  ', '  Juan  ');
    
    expect(area.name).toBe('Producción');
    expect(area.responsible).toBe('Juan');
  });

  it('debe crear objeto de actualización con updated_at', () => {
    const update = createAreaUpdateObject('Producción', 'Juan');
    
    expect(update).toHaveProperty('name', 'Producción');
    expect(update).toHaveProperty('responsible', 'Juan');
    expect(update).toHaveProperty('updated_at');
    expect(update).not.toHaveProperty('created_at');
  });
});

describe('Conteo de centros de trabajo', () => {
  const workCenters = [
    { id: 'wc1', area_id: 'area1', name: 'Centro A' },
    { id: 'wc2', area_id: 'area1', name: 'Centro B' },
    { id: 'wc3', area_id: 'area2', name: 'Centro C' }
  ];

  it('debe contar centros correctamente', () => {
    expect(countWorkCentersByArea(workCenters, 'area1')).toBe(2);
    expect(countWorkCentersByArea(workCenters, 'area2')).toBe(1);
  });

  it('debe retornar 0 para área sin centros', () => {
    expect(countWorkCentersByArea(workCenters, 'area999')).toBe(0);
  });
});

describe('Generación de mensaje de confirmación', () => {
  it('debe generar mensaje simple sin centros', () => {
    const message = generateDeleteConfirmation('Producción', 0);
    expect(message).toBe('¿Estás seguro de eliminar el área "Producción"?');
  });

  it('debe incluir 1 centro de trabajo (singular)', () => {
    const message = generateDeleteConfirmation('Producción', 1);
    expect(message).toContain('1 centro de trabajo asociado');
  });

  it('debe incluir múltiples centros (plural)', () => {
    const message = generateDeleteConfirmation('Producción', 5);
    expect(message).toContain('5 centros de trabajo asociados');
  });
});

describe('Manipulación de listas de áreas', () => {
  it('debe remover área de la lista', () => {
    const areas = [
      { id: '1', name: 'Área 1' },
      { id: '2', name: 'Área 2' },
      { id: '3', name: 'Área 3' }
    ];

    const result = removeAreaFromList(areas, '2');
    
    expect(result).toHaveLength(2);
    expect(result.find(a => a.id === '2')).toBeUndefined();
    expect(result.find(a => a.id === '1')).toBeDefined();
  });

  it('debe actualizar área en la lista', () => {
    const areas = [
      { id: '1', name: 'Área 1', responsible: 'Juan' },
      { id: '2', name: 'Área 2', responsible: 'María' }
    ];

    const updated = { name: 'Área 2 Updated', responsible: 'Pedro' };
    const result = updateAreaInList(areas, '2', updated);
    
    expect(result[1].name).toBe('Área 2 Updated');
    expect(result[1].responsible).toBe('Pedro');
    expect(result[0]).toEqual(areas[0]); // Área 1 no cambia
  });

  it('debe retornar lista sin cambios si id no existe', () => {
    const areas = [{ id: '1', name: 'Área 1' }];
    const result = updateAreaInList(areas, '999', { name: 'New' });
    
    expect(result).toEqual(areas);
  });
});

describe('Filtrado de centros de trabajo', () => {
  it('debe remover centros de un área específica', () => {
    const workCenters = [
      { id: 'wc1', area_id: 'area1' },
      { id: 'wc2', area_id: 'area2' },
      { id: 'wc3', area_id: 'area1' }
    ];

    const result = removeWorkCentersByArea(workCenters, 'area1');
    
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('wc2');
  });
});