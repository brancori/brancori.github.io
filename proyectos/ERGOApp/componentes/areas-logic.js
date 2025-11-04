// proyectos/ERGOApp/componentes/areas-logic.js

/**
 * Valida los datos de un área
 */
export function validateAreaData(name, responsible) {
  const errors = [];
  
  if (!name || name.trim() === '') {
    errors.push('El nombre del área es requerido');
  }
  
  if (!responsible || responsible.trim() === '') {
    errors.push('El responsable es requerido');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Verifica si un área ya existe (sin importar mayúsculas)
 */
export function areaExists(areas, newName, excludeId = null) {
  return areas.some(area => 
    area.name.toLowerCase() === newName.toLowerCase() && 
    area.id !== excludeId
  );
}

/**
 * Crea un objeto de área nuevo
 */
export function createAreaObject(id, name, responsible) {
  return {
    id,
    name: name.trim(),
    responsible: responsible.trim(),
    created_at: new Date().toISOString()
  };
}

/**
 * Crea un objeto de actualización de área
 */
export function createAreaUpdateObject(name, responsible) {
  return {
    name: name.trim(),
    responsible: responsible.trim(),
    updated_at: new Date().toISOString()
  };
}

/**
 * Cuenta los centros de trabajo asociados a un área
 */
export function countWorkCentersByArea(workCenters, areaId) {
  return workCenters.filter(wc => wc.area_id === areaId).length;
}

/**
 * Genera el mensaje de confirmación para eliminar un área
 */
export function generateDeleteConfirmation(areaName, centerCount) {
  let message = `¿Estás seguro de eliminar el área "${areaName}"?`;
  
  if (centerCount > 0) {
    const centerWord = centerCount === 1 
      ? 'centro de trabajo asociado' 
      : 'centros de trabajo asociados';
    message += `\n\nEsto también eliminará ${centerCount} ${centerWord}.`;
  }
  
  return message;
}

/**
 * Filtra las áreas eliminando una específica
 */
export function removeAreaFromList(areas, areaId) {
  return areas.filter(a => a.id !== areaId);
}

/**
 * Filtra los centros de trabajo eliminando los de un área
 */
export function removeWorkCentersByArea(workCenters, areaId) {
  return workCenters.filter(wc => wc.area_id !== areaId);
}

/**
 * Actualiza un área en la lista
 */
export function updateAreaInList(areas, areaId, updatedData) {
  const index = areas.findIndex(a => a.id === areaId);
  if (index === -1) return areas;
  
  const newAreas = [...areas];
  newAreas[index] = { ...newAreas[index], ...updatedData };
  return newAreas;
}