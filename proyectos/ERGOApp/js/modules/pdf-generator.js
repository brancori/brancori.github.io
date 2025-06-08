// ===== GENERADOR DE PDFs MODULAR =====

import { PDF_CONFIG, ERGONOMIC_METHODS } from '../core/constants.js';
import { loadingManager, DeviceUtils, StringUtils, PerformanceUtils } from './ui-helpers.js';

export class PDFGenerator {
    constructor() {
        this.doc = null;
        this.currentY = 0;
    }

    // ==========================================
    // MÉTODO PRINCIPAL
    // ==========================================

    async generateEvaluationPDF() {
        loadingManager.show();
        
        try {
            await PerformanceUtils.delay(100);
            await this.createPDFDocument();
            await this.saveDocument();
        } catch (error) {
            console.error('Error generando PDF:', error);
            alert('Error al generar el PDF. Intenta de nuevo.');
        } finally {
            loadingManager.hide();
        }
    }

    // ==========================================
    // CREACIÓN DEL DOCUMENTO
    // ==========================================

    async createPDFDocument() {
        const evaluationData = this.getEvaluationData();
        const filename = this.generateFilename(evaluationData.nombreArea);
        
        // Inicializar jsPDF
        const { jsPDF } = window.jspdf;
        this.doc = new jsPDF({
            orientation: PDF_CONFIG.orientation,
            unit: PDF_CONFIG.unit,
            format: PDF_CONFIG.format,
            compress: PDF_CONFIG.compress
        });
        
        // Crear contenido del PDF
        await this.createHeader(evaluationData);
        await PerformanceUtils.delay(50);
        
        await this.createMethodsSection();
        await PerformanceUtils.delay(50);
        
        await this.createDataTables();
        
        this.filename = filename;
    }

    getEvaluationData() {
        return {
            nombreArea: this.getFieldValue('nombreArea') || 'No especificado',
            ubicacionArea: this.getFieldValue('ubicacionArea') || 'No especificada',
            responsableArea: this.getFieldValue('responsableArea') || 'No especificado',
            fechaEvaluacion: this.getFieldValue('fechaEvaluacion') || new Date().toLocaleDateString(),
            score: this.calculateCurrentScore()
        };
    }

    generateFilename(areaName) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 16);
        const sanitizedName = StringUtils.sanitizeFilename(areaName);
        return `${timestamp}_Evaluacion_${sanitizedName}.pdf`;
    }

    // ==========================================
    // SECCIONES DEL PDF
    // ==========================================

    async createHeader(data) {
        this.doc.setFontSize(PDF_CONFIG.fonts.title);
        this.doc.text('Reporte de Evaluación Ergonómica Integrada', 105, 15, {align: 'center'});
        
        this.doc.setFontSize(PDF_CONFIG.fonts.normal);
        this.doc.text(`Área: ${data.nombreArea} | Ubicación: ${data.ubicacionArea}`, 14, 25);
        this.doc.text(`Responsable: ${data.responsableArea} | Fecha: ${data.fechaEvaluacion}`, 14, 31);
        this.doc.text(`Generado: ${new Date().toLocaleDateString()}`, 14, 37);
        
        this.doc.setFontSize(PDF_CONFIG.fonts.subtitle);
        this.doc.text(`Riesgo Ergonómico: ${data.score}%`, 14, 48);
        
        this.currentY = 55;
    }

    async createMethodsSection() {
        const detectedMethods = this.analyzeRequiredMethods();
        
        if (Object.keys(detectedMethods).length > 0) {
            let methodsText = 'Métodos recomendados: ';
            Object.entries(detectedMethods).forEach(([method, data], index) => {
                const initial = method.charAt(0);
                const priority = data.critical > 0 ? '!' : data.count > 2 ? '*' : '';
                methodsText += `${initial}${priority}`;
                if (index < Object.keys(detectedMethods).length - 1) methodsText += ', ';
            });
            
            this.doc.setFontSize(PDF_CONFIG.fonts.normal);
            this.doc.text(methodsText, 14, this.currentY);
            this.doc.text('(!:Obligatorio, *:Recomendado)', 14, this.currentY + 6);
            this.currentY += 15;
        } else {
            this.doc.setFontSize(PDF_CONFIG.fonts.normal);
            this.doc.text('Métodos: Seguimiento rutinario', 14, this.currentY);
            this.currentY += 10;
        }
        
        await this.createMethodsTable(detectedMethods);
    }

    async createMethodsTable(detectedMethods) {
        if (Object.keys(detectedMethods).length === 0) return;
        
        const methodsData = Object.entries(detectedMethods).map(([method, data]) => {
            const methodInfo = ERGONOMIC_METHODS[method];
            const priority = data.critical > 0 ? 'OBLIGATORIO' : 
                           data.count > 2 ? 'RECOMENDADO' : 'OPCIONAL';
            const reason = `${data.count} indicador(es)${data.critical > 0 ? ` (${data.critical} crítico(s))` : ''}`;
            
            return [
                `${methodInfo.nombre} - ${methodInfo.descripcion}`,
                reason,
                priority
            ];
        });
        
        this.doc.autoTable({
            startY: this.currentY,
            head: [['Método Recomendado', 'Justificación', 'Prioridad']],
            body: methodsData,
            theme: 'striped',
            headStyles: {
                fillColor: PDF_CONFIG.colors.primary,
                textColor: 255,
                fontSize: PDF_CONFIG.fonts.normal,
                fontStyle: 'bold'
            },
            bodyStyles: {
                fontSize: PDF_CONFIG.fonts.small,
                cellPadding: 3
            },
            columnStyles: {
                0: {cellWidth: 80},
                1: {cellWidth: 60},
                2: {cellWidth: 25, halign: 'center'}
            },
            margin: {left: PDF_CONFIG.margins.left, right: PDF_CONFIG.margins.right}
        });
        
        this.currentY = this.doc.lastAutoTable.finalY + 10;
    }

    async createDataTables() {
        const tablesData = this.getTablesData();
        
        for (let i = 0; i < tablesData.length; i++) {
            const section = tablesData[i];
            
            if (i > 0 && i % 2 === 0) {
                await PerformanceUtils.delay(100);
            }
            
            await this.createSectionTable(section);
        }
    }

    async createSectionTable(section) {
        if (this.currentY > 250) {
            this.doc.addPage();
            this.currentY = 20;
        }
        
        this.doc.setFontSize(PDF_CONFIG.fonts.subtitle);
        this.doc.text(section.title, 14, this.currentY);
        this.currentY += 8;
        
        this.doc.autoTable({
            startY: this.currentY,
            head: [['Pregunta', 'Respuesta']],
            body: section.data,
            theme: 'grid',
            headStyles: {
                fillColor: PDF_CONFIG.colors.primary,
                fontSize: PDF_CONFIG.fonts.normal,
                halign: 'center',
                valign: 'middle',
                fontStyle: 'bold'
            },
            columnStyles: {
                0: {
                    cellWidth: 140,
                    fontSize: PDF_CONFIG.fonts.small,
                    halign: 'left',
                    valign: 'middle',
                    overflow: 'linebreak',
                    cellPadding: 2
                },
                1: {
                    cellWidth: 25,
                    halign: 'center',
                    valign: 'middle',
                    fontSize: PDF_CONFIG.fonts.normal,
                    fontStyle: 'bold'
                }
            },
            margin: {left: PDF_CONFIG.margins.left, right: PDF_CONFIG.margins.right},
            styles: {
                fontSize: PDF_CONFIG.fonts.small,
                cellPadding: 2,
                overflow: 'linebreak',
                lineColor: PDF_CONFIG.colors.border,
                lineWidth: 0.5,
                valign: 'middle',
                minCellHeight: 12
            },
            pageBreak: 'auto',
            showHead: 'everyPage'
        });
        
        this.currentY = this.doc.lastAutoTable.finalY + 10;
    }

    // ==========================================
    // ANÁLISIS DE DATOS
    // ==========================================

    analyzeRequiredMethods() {
        const detectedMethods = {};
        const questions = document.querySelectorAll('.question[data-metodo]');
        
        questions.forEach(question => {
            const method = question.getAttribute('data-metodo');
            const critical = question.getAttribute('data-critica') === 'true';
            const selectedRadio = question.querySelector('input[type="radio"]:checked');
            
            if (method && selectedRadio && selectedRadio.value === 'no') {
                if (!detectedMethods[method]) {
                    detectedMethods[method] = { count: 0, critical: 0 };
                }
                detectedMethods[method].count++;
                if (critical) detectedMethods[method].critical++;
            }
        });
        
        return detectedMethods;
    }

    getTablesData() {
        const tablesData = [];
        
        // Criterios generales
        const generalData = this.getSectionData('preguntas-generales');
        if (generalData.length > 0) {
            tablesData.push({title: 'Criterios Generales', data: generalData});
        }
        
        // Secciones condicionales
        const conditionalSections = [
            {id: 'manipulaCargas', title: 'Manipulación de Cargas'},
            {id: 'usaPantallas', title: 'Uso de Pantallas'},
            {id: 'usaHerramientas', title: 'Uso de Herramientas'},
            {id: 'mantienePosturas', title: 'Mantenimiento de Posturas'}
        ];
        
        conditionalSections.forEach(({id, title}) => {
            if (this.isCheckboxChecked(id)) {
                const data = this.getSectionData(`preguntas-${id}`);
                if (data.length > 0) {
                    tablesData.push({title, data});
                }
            }
        });
        
        return tablesData;
    }

    getSectionData(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return [];
        
        const questions = section.querySelectorAll('.question');
        const data = [];
        
        questions.forEach(question => {
            try {
                let questionText = question.querySelector('div')?.textContent || 'N/A';
                questionText = this.cleanQuestionText(questionText);
                
                const selectedRadio = question.querySelector('input[type="radio"]:checked');
                const answer = selectedRadio ? 
                    (selectedRadio.value === 'si' ? 'Sí' : 
                    (selectedRadio.value === 'no' ? 'No' : 'N/A')) : 
                    'Sin respuesta';
                
                data.push([questionText, answer]);
            } catch (e) {
                console.warn('Error procesando pregunta:', e);
            }
        });
        
        return data;
    }

    cleanQuestionText(text) {
        let cleanText = text.trim();
        cleanText = cleanText.replace(/\s+(NIOSH|REBA|RULA|OCRA)(\s+⚠️)?$/, '');
        
        const maxLength = 120;
        if (cleanText.length > maxLength) {
            cleanText = cleanText.substring(0, maxLength - 3);
            const lastSpace = cleanText.lastIndexOf(' ');
            if (lastSpace > maxLength * 0.8) {
                cleanText = cleanText.substring(0, lastSpace);
            }
            cleanText += '...';
        }
        
        return cleanText;
    }

    // ==========================================
    // GUARDADO DEL DOCUMENTO
    // ==========================================

    async saveDocument() {
        try {
            const deviceInfo = DeviceUtils.getDeviceInfo();
            
            if (deviceInfo.isAndroid || deviceInfo.isEMUI) {
                await this.saveForMobile();
            } else {
                this.doc.save(this.filename);
                alert('PDF generado correctamente');
            }
        } catch (error) {
            console.error('Error guardando PDF:', error);
            alert('Error al guardar PDF: ' + error.message);
        }
    }

    async saveForMobile() {
        const pdfData = this.doc.output('arraybuffer');
        const blob = new Blob([pdfData], { type: 'application/pdf' });
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = this.filename;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
            alert('PDF generado correctamente en Downloads');
        }, 500);
    }

    // ==========================================
    // MÉTODOS DE UTILIDAD
    // ==========================================

    getFieldValue(fieldId) {
        const field = document.getElementById(fieldId);
        return field ? field.value : '';
    }

    isCheckboxChecked(checkboxId) {
        const checkbox = document.getElementById(checkboxId);
        return checkbox ? checkbox.checked : false;
    }

    calculateCurrentScore() {
        let totalWeighted = 0;
        let totalWeights = 0;

        const questions = document.querySelectorAll('.question');

        questions.forEach(question => {
            const weight = parseInt(question.getAttribute('data-peso')) || 1;
            const selectedRadio = question.querySelector('input[type="radio"]:checked');
            const response = selectedRadio ? selectedRadio.value : null;

            if (response && response !== 'na') {
                const value = (response === 'no') ? 1 : 0;
                totalWeighted += value * weight;
                totalWeights += weight;
            }
        });

        const finalScore = (totalWeights > 0) ? (totalWeighted / totalWeights) * 100 : 0;
        return finalScore.toFixed(2);
    }
}

// ==========================================
// FUNCIONES PÚBLICAS
// ==========================================

export async function generatePDF() {
    const generator = new PDFGenerator();
    await generator.generateEvaluationPDF();
}

// Crear instancia global para compatibilidad
export const pdfGenerator = new PDFGenerator();

// Función global para compatibilidad con código existente
export function createGlobalPDFFunction() {
    window.exportarPDFCompleto = generatePDF;
}

export default PDFGenerator;