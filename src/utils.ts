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
export function buildFilename(prefix: string, ext: 'csv' | 'xlsx' | 'pdf' | 'png' | 'jpg' | 'jpeg', month?: number, year?: number): string {
  const mStr = month ? `_${String(month).padStart(2, '0')}` : '';
  const yStr = year ? `_${year}` : '';
  const dateStr = !month && !year ? `_${new Date().toISOString().split('T')[0].replace(/-/g, '_')}` : '';
  return `${prefix}${mStr}${yStr}${dateStr}.${ext}`;
}

/**
 * Converts an OKLCH color string to standard sRGB format that html2canvas can parse
 */
function oklchToRgb(oklchStr: string): string {
  try {
    // Format is like "oklch(0.696 0.17 162.48)" or "oklch(0.696 0.17 162.48 / 0.1)"
    const content = oklchStr.substring(oklchStr.indexOf('(') + 1, oklchStr.lastIndexOf(')'));
    const parts = content.trim().split(/[\s/]+/);
    if (parts.length < 3) {
      return 'rgb(120, 113, 108)';
    }

    const LStr = parts[0];
    const CStr = parts[1];
    const HStr = parts[2];
    const AStr = parts[3] || '1';

    const L = LStr.endsWith('%') ? parseFloat(LStr) / 100 : parseFloat(LStr);
    const C = CStr.endsWith('%') ? parseFloat(CStr) / 100 : parseFloat(CStr);
    const H = parseFloat(HStr);
    const A = AStr.endsWith('%') ? parseFloat(AStr) / 100 : parseFloat(AStr);

    if (isNaN(L) || isNaN(C) || isNaN(H)) {
      return 'rgb(120, 113, 108)';
    }

    const hRad = (H * Math.PI) / 180;
    const aVal = C * Math.cos(hRad);
    const bVal = C * Math.sin(hRad);

    const l_ = L + 0.3963377774 * aVal + 0.2158037573 * bVal;
    const m_ = L - 0.1055613458 * aVal - 0.0638541728 * bVal;
    const s_ = L - 0.0894841775 * aVal - 1.2914855480 * bVal;

    const L1 = l_ * l_ * l_;
    const M1 = m_ * m_ * m_;
    const S1 = s_ * s_ * s_;

    const rLin = +4.0767416621 * L1 - 3.3077115913 * M1 + 0.2309699292 * S1;
    const gLin = -1.2684380046 * L1 + 2.6097574011 * M1 - 0.3413193965 * S1;
    const bLin = -0.0041960863 * L1 - 0.7034186147 * M1 + 1.7076147010 * S1;

    const gammaCorrect = (val: number) => {
      if (val <= 0.0031308) {
        return Math.max(0, val * 12.92);
      }
      return Math.max(0, Math.min(1, 1.055 * Math.pow(val, 1 / 2.4) - 0.055));
    };

    const r = Math.round(gammaCorrect(rLin) * 255);
    const g = Math.round(gammaCorrect(gLin) * 255);
    const b = Math.round(gammaCorrect(bLin) * 255);

    const alpha = isNaN(A) ? 1 : A;

    if (alpha !== 1) {
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return `rgb(${r}, ${g}, ${b})`;
  } catch (err) {
    return 'rgb(120, 113, 108)';
  }
}

/**
 * Replaces all oklch() color functions in a CSS string with compatible rgb/rgba fallbacks
 */
function replaceOklchInCSS(cssText: string): string {
  let result = '';
  let index = 0;
  while (index < cssText.length) {
    const oklchIdx = cssText.indexOf('oklch(', index);
    if (oklchIdx === -1) {
      result += cssText.slice(index);
      break;
    }
    result += cssText.slice(index, oklchIdx);

    let parenCount = 1;
    let i = oklchIdx + 6;
    while (i < cssText.length && parenCount > 0) {
      if (cssText[i] === '(') {
        parenCount++;
      } else if (cssText[i] === ')') {
        parenCount--;
      }
      i++;
    }

    const matchedStr = cssText.slice(oklchIdx, i);
    const rgbStr = oklchToRgb(matchedStr);
    result += rgbStr;
    index = i;
  }
  return result;
}

/**
 * Export HTML element to JPG
 */
export async function exportElementToJPG(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    alert(`Không tìm thấy vùng dữ liệu ID: ${elementId} để xuất ảnh JPG.`);
    return;
  }

  // Visual feedback
  const originalCursor = document.body.style.cursor;
  document.body.style.cursor = 'wait';

  const linkElements = Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];
  const styleElements = Array.from(document.querySelectorAll('style')) as HTMLStyleElement[];
  const backups: { el: HTMLStyleElement | HTMLLinkElement; originalText?: string; tempStyle?: HTMLStyleElement }[] = [];

  try {
    // 1. Pre-fetch same-origin linked CSS rules and replace oklch patterns to avoid html2canvas parser crash
    for (const link of linkElements) {
      try {
        const href = link.href;
        if (href && (href.startsWith(window.location.origin) || !href.startsWith('http'))) {
          const resp = await fetch(href);
          if (resp.ok) {
            const cssText = await resp.text();
            if (cssText.includes('oklch')) {
              const cleaned = replaceOklchInCSS(cssText);
              const tempStyle = document.createElement('style');
              tempStyle.setAttribute('data-pdf-fallback', 'true');
              tempStyle.textContent = cleaned;
              document.head.appendChild(tempStyle);

              link.disabled = true;
              backups.push({ el: link, tempStyle });
            }
          }
        }
      } catch (fe) {
        console.warn('Failed to pre-clean linked stylesheet:', link.href, fe);
      }
    }

    // 2. Scan and edit active in-document <style> tags
    for (const style of styleElements) {
      if (style.textContent && style.textContent.includes('oklch')) {
        const originalText = style.textContent;
        style.textContent = replaceOklchInCSS(originalText);
        backups.push({ el: style, originalText });
      }
    }

    const originalStyle = element.style.cssText;
    element.style.overflow = 'visible';

    const canvas = await html2canvas(element, {
      scale: 2.0, // High definition JPG output
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.overflow = 'visible';
          clonedElement.style.maxHeight = 'none';
          clonedElement.style.padding = '24px';
          clonedElement.style.width = element.offsetWidth ? `${element.offsetWidth}px` : '1200px';
        }

        // Additional clean inside clone context
        const clonedStyles = clonedDoc.querySelectorAll('style');
        clonedStyles.forEach((styleEl) => {
          if (styleEl.textContent && styleEl.textContent.includes('oklch')) {
            styleEl.textContent = replaceOklchInCSS(styleEl.textContent);
          }
        });

        const elements = clonedDoc.getElementsByTagName('*');
        for (let idx = 0; idx < elements.length; idx++) {
          const el = elements[idx];
          if (el instanceof HTMLElement) {
            const st = el.getAttribute('style');
            if (st && st.includes('oklch')) {
              el.setAttribute('style', replaceOklchInCSS(st));
            }
          }
        }
      }
    });

    element.style.cssText = originalStyle;

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    // Switch extension to jpg
    const cleanFilename = filename.toLowerCase().endsWith('.pdf') 
      ? filename.substring(0, filename.length - 4) + '.jpg'
      : filename.toLowerCase().endsWith('.jpg') ? filename : filename + '.jpg';

    const a = document.createElement('a');
    a.href = imgData;
    a.download = cleanFilename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
    }, 150);

  } catch (error: any) {
    console.error('Lỗi khi xuất JPG:', error);
    alert(`Không thể tự động xuất JPG do rào cản trình duyệt: ${error.message || error}`);
  } finally {
    // 3. Restore all modified stylesheets and disable status
    for (const backup of backups) {
      if ('originalText' in backup && backup.originalText !== undefined) {
        backup.el.textContent = backup.originalText;
      }
      if (backup.tempStyle) {
        if (backup.tempStyle.parentNode) {
          backup.tempStyle.parentNode.removeChild(backup.tempStyle);
        }
        if (backup.el instanceof HTMLLinkElement) {
          backup.el.disabled = false;
        }
      }
    }
    document.body.style.cursor = originalCursor;
  }
}

/**
 * Export HTML element to PDF
 */
export async function exportElementToPDF(elementId: string, filename: string, landscape: boolean = true) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    alert(`Không tìm thấy vùng dữ liệu ID: ${elementId} để xuất PDF.`);
    return;
  }

  // Visual feedback
  const originalCursor = document.body.style.cursor;
  document.body.style.cursor = 'wait';

  const linkElements = Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];
  const styleElements = Array.from(document.querySelectorAll('style')) as HTMLStyleElement[];
  const backups: { el: HTMLStyleElement | HTMLLinkElement; originalText?: string; tempStyle?: HTMLStyleElement }[] = [];

  try {
    // 1. Pre-fetch same-origin linked CSS rules and replace oklch patterns to avoid html2canvas parser crash
    for (const link of linkElements) {
      try {
        const href = link.href;
        if (href && (href.startsWith(window.location.origin) || !href.startsWith('http'))) {
          const resp = await fetch(href);
          if (resp.ok) {
            const cssText = await resp.text();
            if (cssText.includes('oklch')) {
              const cleaned = replaceOklchInCSS(cssText);
              const tempStyle = document.createElement('style');
              tempStyle.setAttribute('data-pdf-fallback', 'true');
              tempStyle.textContent = cleaned;
              document.head.appendChild(tempStyle);

              link.disabled = true;
              backups.push({ el: link, tempStyle });
            }
          }
        }
      } catch (fe) {
        console.warn('Failed to pre-clean linked stylesheet:', link.href, fe);
      }
    }

    // 2. Scan and edit active in-document <style> tags
    for (const style of styleElements) {
      if (style.textContent && style.textContent.includes('oklch')) {
        const originalText = style.textContent;
        style.textContent = replaceOklchInCSS(originalText);
        backups.push({ el: style, originalText });
      }
    }

    const originalStyle = element.style.cssText;
    element.style.overflow = 'visible';

    const canvas = await html2canvas(element, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.overflow = 'visible';
          clonedElement.style.maxHeight = 'none';
        }

        // Additional clean inside clone context
        const clonedStyles = clonedDoc.querySelectorAll('style');
        clonedStyles.forEach((styleEl) => {
          if (styleEl.textContent && styleEl.textContent.includes('oklch')) {
            styleEl.textContent = replaceOklchInCSS(styleEl.textContent);
          }
        });

        const elements = clonedDoc.getElementsByTagName('*');
        for (let idx = 0; idx < elements.length; idx++) {
          const el = elements[idx];
          if (el instanceof HTMLElement) {
            const st = el.getAttribute('style');
            if (st && st.includes('oklch')) {
              el.setAttribute('style', replaceOklchInCSS(st));
            }
          }
        }
      }
    });

    element.style.cssText = originalStyle;

    const imgData = canvas.toDataURL('image/jpeg', 0.9);
    
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

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    // High compatibility download trigger for sandboxed iframe environments
    const blob = pdf.output('blob');
    const blobURL = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = blobURL;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(blobURL);
    }, 150);

  } catch (error: any) {
    console.error('Lỗi khi xuất PDF:', error);
    alert(`Không thể tự động xuất PDF do rào cản phân quyền trình duyệt (Iframe sandbox / CORS): ${error.message || error}.\n\nMẹo: Bạn nên mở ứng dụng trong Tab mới bằng nút phía trên bên phải màn hình để xuất file PDF một cách trơn tru nhất!`);
  } finally {
    // 3. Restore all modified stylesheets and disable status
    for (const backup of backups) {
      if ('originalText' in backup && backup.originalText !== undefined) {
        backup.el.textContent = backup.originalText;
      }
      if (backup.tempStyle) {
        if (backup.tempStyle.parentNode) {
          backup.tempStyle.parentNode.removeChild(backup.tempStyle);
        }
        if (backup.el instanceof HTMLLinkElement) {
          backup.el.disabled = false;
        }
      }
    }
    document.body.style.cursor = originalCursor;
  }
}

