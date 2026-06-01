/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Formats a number as Vietnamese Dong (VND)
 * e.g., 1500000 -> "1.500.000 ₫"
 */
export function formatVND(amount: number): string {
  if (isNaN(amount) || amount === undefined || amount === null) {
    return '0 ₫';
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount);
}

/**
 * Generates and downloads a CSV file from raw object arrays
 * Injects UTF-8 Byte Order Mark (BOM) to ensure Vietnamese characters render correctly in Excel
 */
export function exportToCSV(data: any[], headers: string[], filename: string) {
  // Add UTF-8 BOM for Excel compatibility with accents
  const bom = '\uFEFF';
  
  // Map rows
  const csvContent = data.map(row => 
    headers.map(header => {
      const val = row[header];
      if (val === undefined || val === null) return '""';
      // Escape nested quotes
      const stringified = String(val).replace(/"/g, '""');
      return `"${stringified}"`;
    }).join(',')
  ).join('\n');

  const finalCSV = bom + headers.join(',') + '\n' + csvContent;
  const blob = new Blob([finalCSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Helper to get the Vietnamese name of a month
 */
export function getMonthName(month: number): string {
  const months = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
    'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
    'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];
  return months[month - 1] || `Tháng ${month}`;
}

/**
 * Custom file-name builder based on year, month, and requested type
 */
export function buildFilename(prefix: string, ext: 'csv' | 'xlsx' | 'pdf' | 'png', month?: number, year?: number): string {
  const mStr = month ? `_${String(month).padStart(2, '0')}` : '';
  const yStr = year ? `_${year}` : '';
  const dateStr = !month && !year ? `_${new Date().toISOString().split('T')[0].replace(/-/g, '_')}` : '';
  return `${prefix}${mStr}${yStr}${dateStr}.${ext}`;
}

/**
 * Export HTML element to PDF
 */
export async function exportElementToPDF(elementId: string, filename: string, landscape: boolean = true) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    const originalStyle = element.style.cssText;
    
    // Temporarily ensure element layout is visible
    element.style.overflow = 'visible';
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    element.style.cssText = originalStyle;

    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: landscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = landscape ? 297 : 210;
    const pageHeight = landscape ? 210 : 297;
    
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Lỗi khi xuất PDF:', error);
  }
}

