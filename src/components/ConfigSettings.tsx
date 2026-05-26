/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, Info, CreditCard, Users, Shield, Copy, CheckCircle, Database, HelpCircle } from 'lucide-react';
import { AppConfig, User, UserRole } from '../types';
import { formatVND } from '../utils';

interface ConfigSettingsProps {
  config: AppConfig;
  users: User[];
  userRole: UserRole;
  onUpdateConfig: (updated: Partial<AppConfig>) => void;
  onSwitchUser: (username: string) => void;
  currentUser: string;
}

export default function ConfigSettings({
  config,
  users,
  userRole,
  onUpdateConfig,
  onSwitchUser,
  currentUser
}: ConfigSettingsProps) {
  const [centerName, setCenterName] = useState(config.centerName);
  const [address, setAddress] = useState(config.address);
  const [phone, setPhone] = useState(config.phone);
  const [receiptPrefix, setReceiptPrefix] = useState(config.receiptPrefix);
  const [defaultTuitionFee, setDefaultTuitionFee] = useState(String(config.defaultTuitionFee));
  const [academicYear, setAcademicYear] = useState(String(config.academicYear));
  
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const canEditConfig = userRole === 'SUPER_ADMIN';

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!canEditConfig) {
      setError('Bạn không có thẩm quyền sửa đổi cấu hình hệ thống! Chỉ SUPER_ADMIN mới được thực hiện.');
      return;
    }

    const fee = parseFloat(defaultTuitionFee.replace(/[^0-9]/g, ''));
    const year = parseInt(academicYear, 10);

    if (isNaN(fee) || fee <= 0) {
      setError('Học phí mặc định không hợp lệ!');
      return;
    }

    if (isNaN(year) || year < 2020) {
      setError('Năm học không hợp lệ!');
      return;
    }

    onUpdateConfig({
      centerName,
      address,
      phone,
      receiptPrefix,
      defaultTuitionFee: fee,
      academicYear: year
    });

    setSuccess('Đã cập nhật cấu hình trung tâm thành công trên toàn hệ thống!');
    setTimeout(() => setSuccess(''), 4000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Cấu hình Hệ Thống & Quản Trị</h1>
        <p className="text-xs text-gray-500 mt-1">Quản lý cơ sở dữ liệu giả lập, phân cấp vai trò người dùng và cấu hình thông tin biên lai.</p>
      </div>

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-1.5 pulse-active">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800 flex items-center gap-1.5">
          <Info className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Branch / Center Information Panel */}
        <div className="lg:col-span-2 rounded-xl border border-gray-100 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-1.5 text-gray-800 font-bold text-xs uppercase border-b border-gray-100 pb-2 mb-4">
            <Settings className="h-4 w-4 text-emerald-600" />
            <span>Thông tin chi nhánh & Học phí chuẩn</span>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Tên Trung tâm giáo dục</label>
                <input
                  type="text"
                  required
                  disabled={!canEditConfig}
                  value={centerName}
                  onChange={(e) => setCenterName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2 px-3 text-xs font-semibold focus:border-emerald-500 focus:outline-none disabled:opacity-60"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Số điện thoại liên lạc</label>
                <input
                  type="text"
                  required
                  disabled={!canEditConfig}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2 px-3 text-xs font-semibold focus:border-emerald-500 focus:outline-none disabled:opacity-60"
                />
              </div>

              <div className="sm:col-span-2 space-y-1 font-sans">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Địa chỉ trụ sở chính</label>
                <input
                  type="text"
                  required
                  disabled={!canEditConfig}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2 px-3 text-xs font-semibold focus:border-emerald-500 focus:outline-none disabled:opacity-60"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Tiền tố biên lai hóa đơn</label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  disabled={!canEditConfig}
                  value={receiptPrefix}
                  onChange={(e) => setReceiptPrefix(e.target.value.toUpperCase())}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2 px-3 text-xs font-mono font-bold focus:border-emerald-500 focus:outline-none disabled:opacity-60"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Học phí mặc định (VND)</label>
                <input
                  type="text"
                  required
                  disabled={!canEditConfig}
                  value={defaultTuitionFee}
                  onChange={(e) => {
                    const cleanVal = e.target.value.replace(/[^0-9]/g, '');
                    setDefaultTuitionFee(cleanVal ? new Intl.NumberFormat('vi-VN').format(parseFloat(cleanVal)) : '');
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2 px-3 text-xs font-semibold focus:border-emerald-500 focus:outline-none disabled:opacity-60"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Niên khóa / Năm học hạch sổ</label>
                <input
                  type="number"
                  required
                  disabled={!canEditConfig}
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2 px-3 text-xs font-semibold focus:border-emerald-500 focus:outline-none disabled:opacity-60"
                />
              </div>
            </div>

            {canEditConfig ? (
              <div className="pt-3 border-t border-gray-50/55 flex justify-end">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white px-4 py-2 rounded-lg transition-all shadow-sm shadow-emerald-200 cursor-pointer"
                >
                  Cập nhật thay đổi cấu hình
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-gray-400 italic">
                * Bạn chỉ có quyền Xem. Đăng nhập tài khoản <strong>superadmin</strong> để chỉnh sửa các trường này.
              </p>
            )}
          </form>
        </div>

        {/* Dynamic User Permissions Simulator switcher */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs h-fit space-y-4">
          <div className="flex items-center gap-1.5 text-gray-800 font-bold text-xs uppercase border-b border-gray-100 pb-2">
            <Users className="h-4 w-4 text-emerald-600" />
            <span>Giả lập tài khoản & Quyền</span>
          </div>

          <div className="rounded-lg bg-emerald-50/20 p-3 text-xs text-emerald-800 border border-emerald-50">
            Ứng dụng hỗ trợ kiểm thử phân cấp tài khoản nhanh. Click vào tên bất kỳ để thay đổi vai trò trải nghiệm ngay lập tức cực kỳ tiện lợi:
          </div>

          <div className="space-y-2">
            {users.map((u) => {
              const isCurrent = u.username === currentUser;
              return (
                <button
                  key={u.username}
                  onClick={() => onSwitchUser(u.username)}
                  className={`w-full text-left rounded-xl p-3 border transition-all flex items-center justify-between cursor-pointer ${isCurrent ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100' : 'bg-gray-50/30 text-gray-700 border-gray-100 hover:bg-gray-50/90'}`}
                >
                  <div>
                    <p className={`text-xs font-bold ${isCurrent ? 'text-white' : 'text-gray-900'}`}>{u.fullName}</p>
                    <p className={`text-[10px] ${isCurrent ? 'text-emerald-100' : 'text-gray-400'}`}>Mã đăng nhập: {u.username}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${isCurrent ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                    {u.role}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-gray-100">
            <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1">
              <Shield className="h-3 w-3" /> Chi tiết phân cấp vai trò
            </h4>
            <ul className="text-[10px] text-gray-500 space-y-1.5 mt-2.5 list-disc pl-3">
              <li><strong className="text-gray-700">SUPER_ADMIN</strong>: Toàn quyền, cấu hình hệ thống, mở khóa tháng đã chốt.</li>
              <li><strong className="text-gray-700">ADMIN</strong>: Quản lý học sinh, thu học phí đóng, xuất hóa đơn, xuất file chuyển GV.</li>
              <li><strong className="text-gray-700">STAFF</strong>: Phụ trách tạo thông báo, xem danh sách, xác định danh số thù lao mà không có quyền sửa đổi.</li>
              <li><strong className="text-gray-700">VIEWER</strong>: Quyền đọc chỉ xem, thích hợp thanh tra.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
