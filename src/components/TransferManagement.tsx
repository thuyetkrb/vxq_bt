/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Landmark, ArrowUpRight, DollarSign, Calendar, Plus, History, CornerDownRight, CheckCircle, ShieldAlert } from 'lucide-react';
import { TeacherTransfer, TuitionPayment, UserRole } from '../types';
import { formatVND, getMonthName } from '../utils';

interface TransferManagementProps {
  transfers: TeacherTransfer[];
  payments: TuitionPayment[];
  selectedMonth: number;
  selectedYear: number;
  userRole: UserRole;
  currentUserName: string;
  onAddTransfer: (transfer: Omit<TeacherTransfer, 'transferId' | 'createdAt'>) => void;
}

export default function TransferManagement({
  transfers,
  payments,
  selectedMonth,
  selectedYear,
  userRole,
  currentUserName,
  onAddTransfer
}: TransferManagementProps) {
  const [transferAmount, setTransferAmount] = useState('');
  const [note, setNote] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Calculate current month's collections
  const collectedPayments = payments.filter(
    p => p.month === selectedMonth && p.year === selectedYear && p.paidStatus === 'Paid'
  );
  const totalCollected = collectedPayments.reduce((sum, p) => sum + p.amount, 0);

  // Calculate existing transfers in selected month/year
  const monthTransfers = transfers.filter(
    t => t.month === selectedMonth && t.year === selectedYear
  );
  const totalTransferred = monthTransfers.reduce((sum, t) => sum + t.transferAmount, 0);

  // Remaining available to transfer for teacher
  const maxAvailableToTransfer = totalCollected - totalTransferred;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (userRole === 'VIEWER' || userRole === 'STAFF') {
      setError('Bạn không có quyền thực hiện giao dịch chuyển quỹ chi trả giáo viên!');
      return;
    }

    const amt = parseFloat(transferAmount.replace(/[^0-9]/g, ''));
    if (isNaN(amt) || amt <= 0) {
      setError('Định mức chuyển tiền không hợp lệ! Vui lòng điền số dương.');
      return;
    }

    // Business rule check: "cannot transfer more than collected amount"
    if (amt > maxAvailableToTransfer) {
      setError(`Vượt quá định ngạch! Bạn chỉ có thể chuyển chi trả tối đa ${formatVND(maxAvailableToTransfer)} cho kỳ hạch toán này.`);
      return;
    }

    // Execute transfer
    onAddTransfer({
      month: selectedMonth,
      year: selectedYear,
      totalCollected: totalCollected,
      transferAmount: amt,
      transferDate: new Date().toISOString().substring(0, 10),
      transferredBy: currentUserName,
      remainingAmount: maxAvailableToTransfer - amt,
      note: note || `Chuyển trả thù lao dạy học tháng ${selectedMonth}/${selectedYear}`
    });

    setSuccess(`Giao dịch thành công! Đã ghi nhận phiếu chi ${formatVND(amt)} cho giảng viên.`);
    setTransferAmount('');
    setNote('');

    setTimeout(() => setSuccess(''), 4000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Chi Trả & Quyết Toán Giáo Viên</h1>
        <p className="text-xs text-gray-500 mt-1">Hạch toán phiếu chi thù lao giảng dạy trích lập từ nguồn học phí thu thực tế hàng tháng.</p>
      </div>

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-1.5 pulse-active">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800 flex items-center gap-1.5">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Grid summary cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Card 1: Total Collected */}
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/20 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Học Phí Đã Thu</span>
            <span className="p-1 rounded-full bg-emerald-100 text-emerald-800">
              <Landmark className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="text-lg font-extrabold text-[#14532d] mt-2">{formatVND(totalCollected)}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Hóa đơn thực tế đã băm trong {getMonthName(selectedMonth)}</p>
        </div>

        {/* Card 2: Total Transferred */}
        <div className="rounded-xl border border-amber-100 bg-amber-50/20 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">Đã Chi Trả (Lũy kế)</span>
            <span className="p-1 rounded-full bg-amber-100 text-amber-800">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="text-lg font-extrabold text-amber-900 mt-2">{formatVND(totalTransferred)}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Tổng số quỹ đã ký phát chi cho lớp</p>
        </div>

        {/* Card 3: Remaining Balance */}
        <div className="rounded-xl border border-gray-200 bg-gray-50/40 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-gray-600 tracking-wider">Tồn Dư Chưa Quyết Toán</span>
            <span className="p-1 rounded-full bg-gray-200 text-gray-700">
              <DollarSign className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="text-lg font-extrabold text-gray-950 mt-2">{formatVND(maxAvailableToTransfer)}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Trần thù lao tối đa được phép xuất biên</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Transaction Creation column */}
        <div className="lg:col-span-1 rounded-xl border border-gray-100 bg-white p-5 shadow-xs h-fit">
          <div className="flex items-center gap-1.5 text-gray-800 font-bold text-xs uppercase border-b border-gray-100 pb-2 mb-4">
            <Plus className="h-4 w-4 text-emerald-600" />
            <span>Ký phát phiếu xuất quỹ</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase">Số tiền chuyển chi (VND)</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 2,000,000"
                  value={transferAmount}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^0-9]/g, '');
                    if (cleaned) {
                      setTransferAmount(new Intl.NumberFormat('vi-VN').format(parseFloat(cleaned)));
                    } else {
                      setTransferAmount('');
                    }
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2.5 px-3.5 text-xs font-semibold focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 pr-10"
                />
                <span className="absolute right-3.5 top-3 text-[10px] font-bold text-gray-400">VNĐ</span>
              </div>
              <p className="text-[10px] text-gray-400 italic">Mức đề xuất tối đa: {formatVND(maxAvailableToTransfer)}</p>
            </div>

            {/* Note Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase">Nội dung chi / Sổ sách chi tiết</label>
              <textarea
                rows={3}
                required
                placeholder="Ví dụ: Thanh toán lương cho Cô Linh lớp A2 đợt 2"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-3 text-xs focus:border-emerald-500 focus:outline-none"
              ></textarea>
            </div>

            {/* Helper warning */}
            <div className="p-2.5 bg-emerald-50/40 rounded-lg text-[10px] text-emerald-800 border border-emerald-50 italic">
              * Hành động hạch toán xuất quỹ sẽ kích hoạt nhật ký tự động phục vụ thanh tra thuế và quản lý nội bộ.
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={maxAvailableToTransfer <= 0 || userRole === 'VIEWER' || userRole === 'STAFF'}
              className="w-full rounded-lg bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer shadow-sm shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Phát toán phiếu chi GV
            </button>
          </form>
        </div>

        {/* Transfer History lists column */}
        <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-1.5 text-gray-800 font-bold text-xs uppercase border-b border-gray-100 pb-2 mb-4">
            <History className="h-4 w-4 text-amber-600" />
            <span>Sổ theo dõi dòng chi tháng {selectedMonth}/{selectedYear}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400">
                  <th className="pb-2">Ngày chi</th>
                  <th className="pb-2">Người ký phát</th>
                  <th className="pb-2">Giá trị chi trả</th>
                  <th className="pb-2">Dư phòng tồn quỹ</th>
                  <th className="pb-2 text-right">Mô tả hạch toán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600">
                {monthTransfers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      Chưa phát hiện phiếu chi lương cho kỳ hạch toán {selectedMonth}/{selectedYear}.
                    </td>
                  </tr>
                ) : (
                  monthTransfers.map(t => (
                    <tr key={t.transferId} className="hover:bg-gray-50/30 transition-colors">
                      <td className="py-3 font-medium text-gray-900 whitespace-nowrap">{t.transferDate}</td>
                      <td className="py-3 font-semibold text-gray-700 whitespace-nowrap">{t.transferredBy}</td>
                      <td className="py-3 font-extrabold text-amber-700 whitespace-nowrap">{formatVND(t.transferAmount)}</td>
                      <td className="py-3 font-mono text-gray-400 whitespace-nowrap">{formatVND(t.remainingAmount)}</td>
                      <td className="py-3 text-right max-w-xs truncate text-[11px]" title={t.note}>
                        {t.note}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
