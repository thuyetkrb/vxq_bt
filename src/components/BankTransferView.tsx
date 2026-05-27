/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Landmark, 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  HelpCircle, 
  Search, 
  Filter, 
  Download, 
  FileSpreadsheet, 
  X, 
  CheckCircle2, 
  ShieldAlert, 
  User, 
  Banknote,
  Clock
} from 'lucide-react';
import { BankTransfer, Student, UserRole } from '../types';
import { formatVND, exportToCSV, buildFilename } from '../utils';

interface BankTransferViewProps {
  transfers: BankTransfer[];
  userRole: UserRole;
  currentUserName: string;
  onAddTransfer: (transfer: Omit<BankTransfer, 'transferId' | 'createdAt'>) => void;
  onUpdateTransfer: (transfer: BankTransfer) => void;
  onDeleteTransfer: (transferId: string) => void;
}

export default function BankTransferView({
  transfers,
  userRole,
  currentUserName,
  onAddTransfer,
  onUpdateTransfer,
  onDeleteTransfer
}: BankTransferViewProps) {
  // Check authorization
  const isAdminOrSuperAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

  // State management
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<BankTransfer | null>(null);

  // Form Fields State
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [transferDate, setTransferDate] = useState(new Date().toISOString().substring(0, 10));
  const [amountStr, setAmountStr] = useState('');
  const [note, setNote] = useState('');

  // Filtering / Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState<string>('ALL');
  const [filterYear, setFilterYear] = useState<string>('ALL');

  // Messaging State
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  if (!isAdminOrSuperAdmin) {
    return (
      <div className="bg-white rounded-xl border border-rose-100 p-8 text-center space-y-4 max-w-lg mx-auto">
        <div className="mx-auto w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center border border-rose-100">
          <ShieldAlert className="h-7 w-7 text-rose-600 animate-pulse" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Không có quyền truy cập</h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          Tab Chuyển Khoản chỉ dành riêng cho **Quản trị viên (ADMIN)** và **Ban Giám Sát Tối Cao (SUPER_ADMIN)**.
          Giao diện và tính năng ghi nhận sổ sách ngân hàng này được ẩn hoàn toàn đối với vai trò STAFF và VIEWER.
        </p>
      </div>
    );
  }

  // Handle start editing
  const startEdit = (trf: BankTransfer) => {
    setEditingTransfer(trf);
    setMonth(trf.month);
    setYear(trf.year);
    setTransferDate(trf.transferDate);
    setAmountStr(new Intl.NumberFormat('vi-VN').format(trf.amount));
    setNote(trf.note);
    setShowAddForm(false);
    setError('');
    setSuccess('');
  };

  // Reset form status
  const resetForm = () => {
    setMonth(new Date().getMonth() + 1);
    setYear(new Date().getFullYear());
    setTransferDate(new Date().toISOString().substring(0, 10));
    setAmountStr('');
    setNote('');
    setShowAddForm(false);
    setEditingTransfer(null);
    setError('');
  };

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const parsedAmount = parseFloat(amountStr.replace(/[^0-9]/g, ''));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Số tiền chuyển khoản không hợp lệ!');
      return;
    }

    if (!transferDate) {
      setError('Ngày chuyển khoản không được trống!');
      return;
    }

    if (!note.trim()) {
      setError('Ghi chú không được trống!');
      return;
    }

    if (editingTransfer) {
      // Edit mode
      const updated: BankTransfer = {
        ...editingTransfer,
        month,
        year,
        transferDate,
        amount: parsedAmount,
        note: note.trim()
      };
      onUpdateTransfer(updated);
      setSuccess('Đã cập nhật biên nhận chuyển khoản thành công!');
      resetForm();
    } else {
      // Add mode
      const payload = {
        month,
        year,
        transferDate,
        amount: parsedAmount,
        note: note.trim(),
        createdBy: currentUserName
      };
      onAddTransfer(payload);
      setSuccess('Đã tạo thành công biên nhận chuyển khoản mới!');
      resetForm();
    }

    setTimeout(() => setSuccess(''), 4000);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa lịch sử chuyển khoản trị giá ${name} này không?`)) {
      onDeleteTransfer(id);
      setSuccess('Đã xóa biên nhận chuyển khoản.');
      setTimeout(() => setSuccess(''), 3050);
    }
  };

  // Helper to filter and map data
  const filteredTransfers = transfers.filter(t => {
    // 1. Search Query
    let matchesSearch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const trfNote = t.note.toLowerCase();
      matchesSearch = trfNote.includes(q) || t.transferId.toLowerCase().includes(q);
    }

    // 2. Filter Month
    const matchesMonth = filterMonth === 'ALL' ? true : t.month === parseInt(filterMonth, 10);

    // 3. Filter Year
    const matchesYear = filterYear === 'ALL' ? true : t.year === parseInt(filterYear, 10);

    return matchesSearch && matchesMonth && matchesYear;
  });

  const totalTransferFunds = filteredTransfers.reduce((sum, t) => sum + t.amount, 0);

  // Generate unique years for filters
  const uniqueYears = Array.from(new Set(transfers.map(t => t.year))).sort((a,b) => b - a);

  // Export to CSV helper
  const handleExportCSV = () => {
    const csvData = filteredTransfers.map(t => ({
      'Mã GD': t.transferId,
      'Kỳ Học Phí': `T.${t.month}/${t.year}`,
      'Ngày CK': t.transferDate,
      'Số tiền (VND)': t.amount,
      'Ghi chú': t.note,
      'Người ghi': t.createdBy,
      'Ngày ghi sổ': t.createdAt.substring(0, 10)
    }));

    exportToCSV(
      csvData,
      ['Mã GD', 'Kỳ Học Phí', 'Ngày CK', 'Số tiền (VND)', 'Ghi chú', 'Người ghi', 'Ngày ghi sổ'],
      buildFilename('so_chuyen_khoan_ngan_hang', 'csv')
    );
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Header titles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Landmark className="h-5.5 w-5.5 text-emerald-600" />
            <span>Sổ Chi Tiết Nhận Chuyển Khoản Ngân Hàng</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Ghi chép và quản lý dòng tiền đóng học phí trực tuyến từ ngân hàng đổ về Võ Quán.
          </p>
        </div>

        {/* Create new transaction button trigger */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1 text-[11px] font-bold bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-3 py-2 rounded-lg transition-all shadow-3xs cursor-pointer"
            title="Xuất sang file hạch sổ"
          >
            <Download className="h-3.5 w-3.5 text-gray-500" /> Xuất Excel
          </button>
          
          {!showAddForm && !editingTransfer && (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-all shadow-md shadow-emerald-200 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Ghi nhận phiếu chuyển khoản
            </button>
          )}
        </div>
      </div>

      {/* Success/Error displays */}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-[#f0fdf4] p-3.5 text-xs font-semibold text-emerald-800 flex items-center gap-1.5 animate-none">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-205 bg-rose-50 p-3.5 text-xs font-semibold text-rose-800 flex items-center gap-1.5">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Adding / Editing Modal form card */}
      {(showAddForm || editingTransfer) && (
        <div className="rounded-xl border border-emerald-100 bg-[#fcfdfd] p-5 shadow-xs transition-all relative">
          <button 
            type="button" 
            onClick={resetForm}
            className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
            <span className="p-1 rounded-full bg-emerald-100/70 text-emerald-850">
              <Banknote className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
              {editingTransfer ? 'Cập Nhật Phiếu Chuyển Khoản' : 'Ghi Nhận Giao Dịch Chuyển Khoản Mới'}
            </span>
          </div>

          <form onSubmit={validateAndSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-3 font-semibold">
            {/* Tuition month/year */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Học phí cho Tháng mấy (Kỳ thu)</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value, 10))}
                  className="rounded-lg border border-gray-250 bg-white py-2 px-3 text-xs font-semibold focus:border-emerald-500 focus:outline-none cursor-pointer"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>Tháng {m}</option>
                  ))}
                </select>

                <input
                  type="number"
                  required
                  min={2020}
                  max={2040}
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value, 10))}
                  className="rounded-lg border border-gray-255 bg-white py-2 px-3 text-xs font-bold focus:border-emerald-500 focus:outline-none text-center"
                />
              </div>
            </div>

            {/* Actual Transfer Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Ngày nhận tiền hạch toán</label>
              <input
                type="date"
                required
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                className="w-full rounded-lg border border-gray-250 bg-white py-2 px-3 text-xs font-semibold focus:border-emerald-500 focus:outline-none text-center"
              />
            </div>

            {/* Amount transfer */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Số tiền chuyển khoản (VND)</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="ví dụ: 1.000.000"
                  value={amountStr}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^0-9]/g, '');
                    setAmountStr(cleaned ? new Intl.NumberFormat('vi-VN').format(parseFloat(cleaned)) : '');
                  }}
                  className="w-full rounded-lg border border-gray-250 bg-white py-2 px-3 focus:border-emerald-500 focus:outline-none text-xs font-extrabold pr-12 text-emerald-800"
                />
                <span className="absolute right-3.5 top-2.5 text-[9px] font-black text-gray-400">VNĐ</span>
              </div>
            </div>

            {/* Note text field */}
            <div className="sm:col-span-3 space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Ghi chú biên nhận (Nội dung CK, Tên võ sinh, chi tiết giao dịch)</label>
              <input
                type="text"
                required
                placeholder="ví dụ: Nguyen Van A chuyen khoa hoc phi vao tai khoan Vietcombank hoac Techcombank"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-lg border border-gray-250 bg-white py-2 px-3 focus:border-emerald-500 focus:outline-none text-xs font-medium"
              />
            </div>

            <div className="sm:col-span-3 pt-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="border border-gray-200 bg-white text-gray-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-xs font-bold transition shadow-sm shadow-emerald-250 cursor-pointer"
              >
                {editingTransfer ? 'Xác nhận cập nhật' : 'Khấu trừ / Lưu giao dịch'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Ledger Section */}
      <div className="space-y-4">
        {/* Aggregate stats and Filtering panel */}
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-3xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left Side: Summary text counter */}
          <div className="flex items-center gap-3">
            <div className="p-2 w-10 h-10 bg-emerald-50 text-emerald-750 rounded-xl flex items-center justify-center border border-emerald-100/50">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wide">Quỹ chuyển khoản bộ lọc</p>
              <p className="text-base font-black text-emerald-800">{formatVND(totalTransferFunds)}</p>
            </div>
          </div>

          {/* Right Side: Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search text input */}
            <div className="relative min-w-[150px]">
              <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm học viên, mô tả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>

            {/* Month selector filter */}
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 py-1 px-2 rounded-lg">
              <Filter className="h-3 w-3 text-gray-400" />
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="bg-transparent border-none text-[10px] font-bold text-gray-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Tháng: Tất cả</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>Tháng {m}</option>
                ))}
              </select>
            </div>

            {/* Year selector filter */}
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 py-1 px-2 rounded-lg">
              <Calendar className="h-3 w-3 text-gray-400" />
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="bg-transparent border-none text-[10px] font-bold text-gray-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Năm: Tất cả</option>
                {uniqueYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Clear filters trigger */}
            {(searchQuery || filterMonth !== 'ALL' || filterYear !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterMonth('ALL');
                  setFilterYear('ALL');
                }}
                className="text-[10px] font-bold text-rose-600 hover:text-rose-800 transition py-1 px-2 hover:bg-rose-50 rounded"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Main Transfers List Table container */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-3xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-[#fafbfb] border-b border-gray-100 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Mã GD</th>
                  <th className="px-4 py-2.5 text-center">Kỳ Học Phí</th>
                  <th className="px-4 py-2.5 text-center">Ngày CK</th>
                  <th className="px-4 py-2.5 text-right">Số Tiền</th>
                  <th className="px-4 py-2.5">Nội Dung</th>
                  <th className="px-4 py-2.5 text-center">Kế Toán</th>
                  <th className="px-4 py-2.5 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150/60 font-medium">
                {filteredTransfers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-xs">
                      Không tìm thấy bản ghi chuyển khoản nào khớp trong sổ sách.
                    </td>
                  </tr>
                ) : (
                  filteredTransfers.map((t) => (
                    <tr key={t.transferId} className="hover:bg-gray-50/40 transition">
                      {/* ID */}
                      <td className="px-4 py-2.5 font-mono font-bold text-gray-750">
                        <span className="bg-emerald-50 font-black text-emerald-800 px-1.5 py-0.5 rounded text-[9.5px]">
                          {t.transferId}
                        </span>
                      </td>

                      {/* Tuition period */}
                      <td className="px-4 py-2.5 text-center">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-gray-150 text-gray-700 font-extrabold font-mono text-[10px]">
                          T.{t.month}/{t.year}
                        </span>
                      </td>

                      {/* Transfer date */}
                      <td className="px-4 py-2.5 text-center text-gray-500 font-mono text-[11px]">
                        {t.transferDate}
                      </td>

                      {/* Transfer Amount received */}
                      <td className="px-4 py-2.5 text-right font-bold text-emerald-750 font-mono">
                        {formatVND(t.amount)}
                      </td>

                      {/* Description Notes */}
                      <td className="px-4 py-2.5 text-gray-600 max-w-[200px] truncate text-[11px]" title={t.note}>
                        {t.note}
                      </td>

                      {/* Registered by who */}
                      <td className="px-4 py-2.5 text-center">
                        <span className="text-[9.5px] bg-slate-50 text-slate-755 border border-slate-100 px-1.5 py-0.5 rounded-full font-bold">
                          {t.createdBy}
                        </span>
                      </td>

                      {/* Edit Delete buttons for Admin */}
                      <td className="px-4 py-2.5 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(t)}
                            className="p-1 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-950 transition cursor-pointer"
                            title="Chỉnh sửa biên nhận này"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(t.transferId, formatVND(t.amount))}
                            className="p-1 rounded text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                            title="Xóa khỏi sổ sách"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-[#fafbfb] border-t border-gray-200 font-bold text-gray-800 select-none">
                <tr className="bg-emerald-50/15">
                  <td colSpan={3} className="px-4 py-3 text-right font-black text-[10px] text-emerald-950 uppercase tracking-wide">
                    Tổng cộng hạch toán chuyển khoản:
                  </td>
                  <td className="px-4 py-3 font-mono font-black text-[12px] text-emerald-800 text-right">
                    {formatVND(totalTransferFunds)}
                  </td>
                  <td colSpan={3} className="px-4 py-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer info counts */}
          <div className="p-3 bg-[#fcfdfd] border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400 font-semibold uppercase">
            <span>Tìm thấy {filteredTransfers.length} bản ghi</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> Tự động lưu tức thời
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
