/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X, Printer, Download, Check } from 'lucide-react';
import { TuitionPayment, Student, Class, AppConfig } from '../types';
import { formatVND, getMonthName } from '../utils';
import { motion } from 'motion/react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: TuitionPayment;
  student: Student;
  klass?: Class;
  config: AppConfig;
}

export default function ReceiptModal({
  isOpen,
  onClose,
  payment,
  student,
  klass,
  config
}: ReceiptModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    const printContent = document.getElementById('tuition-receipt-print-area');
    if (!printContent) return;

    const originalContent = document.body.innerHTML;
    const originalBg = document.body.style.backgroundColor;
    
    // Set white background for printing
    document.body.style.backgroundColor = 'white';
    document.body.innerHTML = printContent.innerHTML;
    
    window.print();
    
    // Restore
    document.body.innerHTML = originalContent;
    document.body.style.backgroundColor = originalBg;
    
    // Re-bind listeners by reloading or dynamic patch (in an iframe, it is safer to reload or instruct to use browser native print)
    window.location.reload();
  };

  const handleSimulateDownload = () => {
    const isExempt = payment.paidStatus === 'Exempted';
    const boundary = "=========================================";
    const txt = `${boundary}
${config.centerName.toUpperCase()}
Địa chỉ: ${config.address}
SĐT: ${config.phone}
${boundary}
               ${isExempt ? 'PHIẾU MIỄN ĐÓNG HỌC PHÍ' : 'BIÊN LAI THU HỌC PHÍ'}
               Số phiếu: ${payment.receiptNo || 'MD2605XXX'}
${boundary}
Họ và tên học sinh: ${student.fullName}
Thời gian/Tháng học: ${getMonthName(payment.month)} / năm ${payment.year}
${isExempt ? 'Học phí thu: 0 VNĐ (Được miễn học phí hoàn toàn)' : `Học phí thu: ${formatVND(payment.amount)}`}
Trạng thái đóng: ${isExempt ? 'MIỄN GIẢM / CHƯA CẦN THU' : 'ĐÃ THANH TOÁN'}
Ngày thu phí: ${payment.paidDate || 'N/A'}
Đơn vị thu: Võ Quán Nam Anh Quang
Người thực hiện: ${payment.collectedBy || 'N/A'}
Ghi chú/Lý do: ${payment.note || 'Không có'}
${boundary}
Cảm ơn quý phụ huynh và võ sinh đã đồng hành
cùng võ quán Vịnh Xuân Quyền - Nam Anh Quang!
${boundary}`;

    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bien_lai_${payment.receiptNo || 'hoc_phi'}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs no-print">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-emerald-100"
      >
        {/* Header bar */}
        <div className={`flex items-center justify-between border-b border-gray-100 ${payment.paidStatus === 'Exempted' ? 'bg-cyan-50' : 'bg-emerald-50'} px-6 py-4`}>
          <div className="flex items-center gap-2">
            <span className={`flex h-8 w-8 items-center justify-center rounded-full ${payment.paidStatus === 'Exempted' ? 'bg-cyan-500' : 'bg-emerald-500'} text-white`}>
              <Check className="h-4 w-4" />
            </span>
            <span className={`font-semibold ${payment.paidStatus === 'Exempted' ? 'text-cyan-900' : 'text-emerald-900'}`}>
              {payment.paidStatus === 'Exempted' ? 'Chi tiết ghi nhận miễn học phí' : 'Vịnh Xuân Quyền - Nam Anh Quang'}
            </span>
          </div>
          <button 
            onClick={onClose}
            className={`rounded-full p-1.5 ${payment.paidStatus === 'Exempted' ? 'text-cyan-800 hover:bg-cyan-100' : 'text-emerald-800 hover:bg-emerald-100'} transition-colors`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Outer Receipt Panel */}
        <div className="max-h-[75vh] overflow-y-auto p-6">
          <div 
            id="tuition-receipt-print-area" 
            className={`rounded-xl border border-dashed ${payment.paidStatus === 'Exempted' ? 'border-cyan-300 bg-cyan-50/15' : 'border-emerald-300 bg-emerald-50/20'} p-6 font-sans text-gray-800 print:border-none print:bg-white print:p-0`}
          >
            {/* Center Info */}
            <div className="text-center">
              <h2 className={`text-sm font-bold tracking-wider ${payment.paidStatus === 'Exempted' ? 'text-cyan-800' : 'text-emerald-800'} uppercase print:text-black`}>{config.centerName}</h2>
              <p className="text-[11px] text-gray-500 mt-1 print:text-black">{config.address}</p>
              <p className="text-[11px] text-gray-500 print:text-black">SĐT: {config.phone}</p>
            </div>

            {/* Split Decorative */}
            <div className={`my-4 border-b border-dashed ${payment.paidStatus === 'Exempted' ? 'border-cyan-200' : 'border-emerald-200'}`}></div>

            {/* Receipt Title */}
            <div className="text-center">
              <h1 className={`text-lg font-bold ${payment.paidStatus === 'Exempted' ? 'text-cyan-900' : 'text-emerald-900'} uppercase tracking-wide print:text-black`}>
                {payment.paidStatus === 'Exempted' ? 'Phiếu Ghi Nhận Miễn Học Phí' : 'Phiếu Thu Học Phí'}
              </h1>
              <p className="text-xs font-mono text-gray-400 mt-1 print:text-black">
                Số: <span className={`${payment.paidStatus === 'Exempted' ? 'text-cyan-700' : 'text-emerald-700'} font-bold print:text-black`}>{payment.receiptNo || 'MD2605XXX'}</span>
              </p>
            </div>

            {/* Info Grid */}
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="text-gray-500">Họ tên học sinh:</span>
                <span className="font-medium text-gray-900">{student.fullName}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="text-gray-500">Biệt danh / Gọi tên:</span>
                <span className="text-gray-900">{student.nickname || 'Không có'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="text-gray-500">Thời gian học phí:</span>
                <span className="font-medium text-gray-900">{getMonthName(payment.month)}/ {payment.year}</span>
              </div>
              {payment.paidStatus === 'Exempted' ? (
                <div className="flex justify-between border-b border-cyan-100 pb-1.5 bg-cyan-50/50 -mx-2 px-2 rounded animate-pulse">
                  <span className="text-cyan-800 font-bold">Trạng thái nghĩa vụ:</span>
                  <span className="font-extrabold text-cyan-700 print:text-black text-md">MIỄN PHÍ HỌC PHÍ (0đ)</span>
                </div>
              ) : (
                <div className="flex justify-between border-b border-emerald-100 pb-1.5 bg-emerald-50/50 -mx-2 px-2 rounded">
                  <span className="text-emerald-800 font-medium">Học phí nộp:</span>
                  <span className="font-bold text-emerald-700 print:text-black text-md">{formatVND(payment.amount)}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="text-gray-500">{payment.paidStatus === 'Exempted' ? 'Ngày ghi nhận miễn đóng:' : 'Ngày thanh toán:'}</span>
                <span className="text-gray-900">{payment.paidDate || 'Hôm nay'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="text-gray-500">Đơn vị thu:</span>
                <span className="text-emerald-800 font-extrabold text-[12.5px]">VÕ QUÁN NAM ANH QUANG</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5 align-middle">
                <span className="text-gray-500">{payment.paidStatus === 'Exempted' ? 'Người phê duyệt miễn học:' : 'Nhân viên thực hiện:'}</span>
                <span className="text-gray-900 font-medium">{payment.collectedBy || 'Người chỉ định'}</span>
              </div>
              <div className="flex flex-col gap-1 border-b border-gray-100 pb-1.5">
                <span className="text-gray-500">{payment.paidStatus === 'Exempted' ? 'Lý do miễn học/không đóng:' : 'Ghi chú thu phí:'}</span>
                <span className="text-gray-700 italic text-xs font-semibold">{payment.note || 'Không có ghi chú thêm'}</span>
              </div>
            </div>

            {/* Foot note */}
            <div className="mt-8 text-center text-[11px] text-gray-400 italic">
              <p>Võ Quán Vịnh Xuân Quyền Nam Anh Quang</p>
              <p className="mt-1">Cảm ơn quý phụ huynh và võ sinh đã đồng hành cùng võ quán!</p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4">
          <button
            onClick={handleSimulateDownload}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Tải biên lai (.txt)
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-all cursor-pointer shadow-sm shadow-emerald-200"
          >
            <Printer className="h-3.5 w-3.5" />
            In hóa đơn (Chế độ A4/Nội bộ)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
