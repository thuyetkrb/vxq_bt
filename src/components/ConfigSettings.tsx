/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, Info, Users, Shield, CheckCircle, Trash2, Edit3, UserPlus, XCircle, LogIn } from 'lucide-react';
import { AppConfig, User, UserRole } from '../types';

interface ConfigSettingsProps {
  config: AppConfig;
  users: User[];
  userRole: UserRole;
  onUpdateConfig: (updated: Partial<AppConfig>) => void;
  onSwitchUser: (username: string) => void;
  currentUser: string;
  onUpdateUsers: (updatedUsers: User[]) => void;
}

export default function ConfigSettings({
  config,
  users,
  userRole,
  onUpdateConfig,
  onSwitchUser,
  currentUser,
  onUpdateUsers
}: ConfigSettingsProps) {
  const [centerName, setCenterName] = useState(config.centerName);
  const [address, setAddress] = useState(config.address);
  const [phone, setPhone] = useState(config.phone);
  const [receiptPrefix, setReceiptPrefix] = useState(config.receiptPrefix);
  const [defaultTuitionFee, setDefaultTuitionFee] = useState(String(config.defaultTuitionFee));
  const [academicYear, setAcademicYear] = useState(String(config.academicYear));
  
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // States for User management
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('STAFF');
  const [newIsActive, setNewIsActive] = useState(true);
  const [userActionError, setUserActionError] = useState('');
  const [userActionSuccess, setUserActionSuccess] = useState('');

  const canEditConfig = userRole === 'SUPER_ADMIN';
  const canManageUsers = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';

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

    setSuccess('Đã cập nhật cấu hình võ quán thành công trên toàn hệ thống!');
    setTimeout(() => setSuccess(''), 4000);
  };

  const handleStartAdd = () => {
    setEditingUser(null);
    setNewUsername('');
    setNewFullName('');
    setNewPassword('');
    setNewRole('STAFF');
    setNewIsActive(true);
    setIsAddingUser(true);
    setUserActionError('');
    setUserActionSuccess('');
  };

  const handleStartEdit = (u: User) => {
    setIsAddingUser(false);
    setEditingUser(u);
    setNewUsername(u.username);
    setNewFullName(u.fullName);
    setNewPassword(u.password || u.username);
    setNewRole(u.role);
    setNewIsActive(u.isActive);
    setUserActionError('');
    setUserActionSuccess('');
  };

  const handleCancelUserForm = () => {
    setIsAddingUser(false);
    setEditingUser(null);
    setUserActionError('');
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUserActionError('');
    setUserActionSuccess('');

    if (!canManageUsers) {
      setUserActionError('Bạn không có quyền quản lý danh sách tài khoản!');
      return;
    }

    const trimmedUsername = newUsername.trim().toLowerCase();
    const trimmedFullName = newFullName.trim();

    if (!trimmedUsername) {
      setUserActionError('Mã tài khoản không được để trống!');
      return;
    }

    if (!/^[a-z0-9_]{3,20}$/.test(trimmedUsername)) {
      setUserActionError('Mã tài khoản phải từ 3-20 ký tự, cấu thành từ chữ cái viết thường, số hoặc (_) không khoảng trắng!');
      return;
    }

    if (!trimmedFullName) {
      setUserActionError('Họ và tên không được để trống!');
      return;
    }

    if (isAddingUser) {
      const exists = users.some(u => u.username === trimmedUsername);
      if (exists) {
        setUserActionError('Tài khoản này đã tồn tại trên hệ thống!');
        return;
      }

      const defaultPassword = trimmedUsername;
      const finalPassword = userRole === 'SUPER_ADMIN' ? (newPassword.trim() || defaultPassword) : defaultPassword;

      const newUserItem: User = {
        username: trimmedUsername,
        fullName: trimmedFullName,
        role: newRole,
        isActive: newIsActive,
        password: finalPassword
      };

      onUpdateUsers([...users, newUserItem]);
      setUserActionSuccess(`Đã thêm thành công tài khoản ${trimmedFullName} (Mật khẩu: ${finalPassword})!`);
      setIsAddingUser(false);
    } else if (editingUser) {
      const updatedUsers = users.map(u => {
        if (u.username === editingUser.username) {
          const defaultPassword = u.password || u.username;
          const finalPassword = userRole === 'SUPER_ADMIN' ? (newPassword.trim() || defaultPassword) : defaultPassword;
          return {
            ...u,
            fullName: trimmedFullName,
            role: newRole,
            isActive: newIsActive,
            password: finalPassword
          };
        }
        return u;
      });

      onUpdateUsers(updatedUsers);
      setUserActionSuccess(`Đã cập nhật thành công tài khoản ${trimmedFullName}!`);
      setEditingUser(null);
    }
    
    setTimeout(() => {
      setUserActionSuccess('');
    }, 4000);
  };

  const handleDeleteUser = (usernameToDelete: string) => {
    setUserActionError('');
    setUserActionSuccess('');

    if (!canManageUsers) {
      setUserActionError('Bạn không có quyền quản lý danh sách tài khoản!');
      return;
    }

    if (usernameToDelete === currentUser) {
      setUserActionError('Không được tự xóa tài khoản của chính mình!');
      return;
    }

    if (usernameToDelete === 'superadmin') {
      setUserActionError('Tài khoản quản quản trị tối cao (superadmin) bắt buộc phải tồn tại!');
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${usernameToDelete}" ra khỏi hệ thống không?`)) {
      const updatedUsers = users.filter(u => u.username !== usernameToDelete);
      onUpdateUsers(updatedUsers);
      setUserActionSuccess(`Đã xóa thành công tài khoản ${usernameToDelete}!`);
      setTimeout(() => setUserActionSuccess(''), 4000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Cấu hình Hệ Thống & Quản Trị</h1>
        <p className="text-xs text-gray-500 mt-1">Quản lý cơ sở dữ liệu giả lập, phân cấp vai trò người dùng và cấu hình thông tin biên lai.</p>
      </div>

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-1.5 animate-none">
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
        {/* Left Column containing Branch Config AND User Config */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Branch / Center Information Panel */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-1.5 text-gray-800 font-bold text-xs uppercase border-b border-gray-100 pb-2 mb-4">
              <Settings className="h-4 w-4 text-emerald-600" />
              <span>Thông tin chi nhánh & Học phí chuẩn</span>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Tên Võ quán / Lớp Võ</label>
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

          {/* Accounts list Management Panel */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-1.5 text-gray-800 font-bold text-xs uppercase">
                <Users className="h-4 w-4 text-emerald-600" />
                <span>Cấu hình Danh sách Quản Trị Viên & User</span>
              </div>
              {canManageUsers && !isAddingUser && !editingUser && (
                <button
                  type="button"
                  onClick={handleStartAdd}
                  className="flex items-center gap-1 text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  <UserPlus className="h-3.5 w-3.5" /> Thêm Tài Khoản Mới
                </button>
              )}
            </div>

            {userActionSuccess && (
              <div className="mb-4 rounded-lg border border-emerald-100 bg-[#f0fdf4] p-3 text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                {userActionSuccess}
              </div>
            )}

            {userActionError && (
              <div className="mb-4 rounded-lg border border-rose-100 bg-rose-50 p-3 text-xs font-semibold text-rose-800 flex items-center gap-1.5">
                <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
                {userActionError}
              </div>
            )}

            {/* Dynamic UI User Form */}
            {(isAddingUser || editingUser) ? (
              <form onSubmit={handleSaveUser} className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 space-y-4">
                <h3 className="text-xs font-bold text-gray-800 uppercase flex items-center gap-1">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  {isAddingUser ? 'Đăng Ký Tài Khoản Mới' : 'Cập Nhật Tài Khoản Người Dùng'}
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Mã đăng nhập (Username)</label>
                    <input
                      type="text"
                      required
                      disabled={!isAddingUser}
                      placeholder="vd: canbo_haiphong"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full rounded-lg border border-gray-250 bg-white/95 py-2 px-3 text-xs font-mono font-bold focus:border-emerald-500 focus:outline-none disabled:opacity-50"
                    />
                    {isAddingUser && (
                      <span className="text-[9.5px] text-gray-400 block mt-0.5">Viết liền, không dấu, không cách. Mật khẩu mặc định bằng Username.</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Họ và Tên đầy đủ</label>
                    <input
                      type="text"
                      required
                      placeholder="vd: Lý Tiểu Long"
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      className="w-full rounded-lg border border-gray-250 bg-white py-2 px-3 text-xs font-bold focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center justify-between">
                      <span>Mật Khẩu (Password)</span>
                      {userRole !== 'SUPER_ADMIN' && (
                        <span className="text-[8px] text-rose-600 bg-rose-50 px-1 py-0.5 rounded font-normal italic lowercase tracking-normal">
                          Chỉ Super Admin mới sửa được
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      required={isAddingUser}
                      placeholder={isAddingUser ? "mật khẩu mặc định bằng username" : "Nhập mật khẩu mới"}
                      disabled={userRole !== 'SUPER_ADMIN'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-lg border border-gray-250 bg-white py-2 px-3 text-xs font-mono font-bold focus:border-emerald-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-405 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Phân Phẩm Vai Trò</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as UserRole)}
                      className="w-full rounded-lg border border-gray-250 bg-white py-1.5 px-3 text-xs font-bold focus:border-emerald-500 focus:outline-none cursor-pointer"
                    >
                      <option value="VIEWER">VIEWER (Khách xem học phí)</option>
                      <option value="STAFF">STAFF (Điều phối viên bản tin)</option>
                      <option value="ADMIN">ADMIN (Thủ quỹ / Kế Toán Viên)</option>
                      <option value="SUPER_ADMIN">SUPER_ADMIN (Ban Giám Sát tối cao)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="userIsActive"
                      checked={newIsActive}
                      disabled={newUsername === 'superadmin'}
                      onChange={(e) => setNewIsActive(e.target.checked)}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
                    />
                    <label htmlFor="userIsActive" className="text-xs font-bold text-gray-750 cursor-pointer select-none">
                      Kích hoạt tài khoản chạy (Active)
                    </label>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCancelUserForm}
                    className="border border-gray-200 bg-white text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-50 transition cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition cursor-pointer shadow-xs shadow-emerald-250"
                  >
                    Xác nhận Lưu
                  </button>
                </div>
              </form>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-[#fcfdfd] border-b border-gray-100 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-2.5">Trực Bản (Username)</th>
                      <th className="px-4 py-2.5">Họ và Tên</th>
                      <th className="px-4 py-2.5">Mật Khẩu</th>
                      <th className="px-4 py-2.5">Vai Trò</th>
                      <th className="px-4 py-2.5">Trạng thái</th>
                      {canManageUsers && <th className="px-4 py-2.5 text-center">Thao Tác</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map(u => {
                      const isSelf = u.username === currentUser;
                      const isSystemPrimary = u.username === 'superadmin';
                      return (
                        <tr key={u.username} className={`hover:bg-gray-50/40 transition-colors ${isSelf ? 'bg-emerald-50/10' : ''}`}>
                          <td className="px-4 py-3 font-mono font-bold text-gray-800">
                            {u.username}
                            {isSelf && <span className="ml-1.5 px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-sans text-[8.5px] font-black uppercase">Bạn</span>}
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-700">{u.fullName}</td>
                          <td className="px-4 py-3 font-mono text-gray-500 font-bold">
                            <span className="bg-gray-50 border border-gray-150 px-1.5 py-0.5 rounded text-[11px]">
                              {u.password || u.username}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold font-mono text-[10.5px]">
                            <span className={`px-1.5 py-0.5 rounded ${u.role === 'SUPER_ADMIN' ? 'bg-[#f0fdf4] text-emerald-800 border border-emerald-100' : u.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-800' : u.role === 'STAFF' ? 'bg-amber-50 text-amber-800' : 'bg-gray-50 text-gray-700'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 font-bold text-[10px] ${u.isActive ? 'text-emerald-700' : 'text-rose-600'}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${u.isActive ? 'bg-emerald-600 animate-pulse' : 'bg-rose-500'}`}></span>
                              {u.isActive ? 'Hoạt động' : 'Tạm khóa'}
                            </span>
                          </td>
                          {canManageUsers && (
                            <td className="px-4 py-3 text-center">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(u)}
                                  className="p-1 rounded text-grey-550 hover:bg-gray-100 hover:text-gray-900 transition cursor-pointer"
                                  title="Chỉnh sửa thông tin thành viên"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                {!isSystemPrimary && !isSelf && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUser(u.username)}
                                    className="p-1 rounded text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                                    title="Xóa tài khoản"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 rounded-xl bg-gray-50 border border-gray-100 p-3.5">
              <h4 className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider flex items-center gap-1">
                📌 Lưu ý kiểm thử tài khoản
              </h4>
              <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-1">
                Tất cả tài khoản trong danh sách đều sử dụng cơ chế đăng nhập cực nhanh: <strong>mật khẩu trùng với mã đăng nhập (username)</strong>. Bạn có thể sử dụng biểu mẫu ở đầu trang (bên góc phải) để đăng xuất và thử đăng nhập dưới các tài khoản mới nộp để kiểm tra phân quyền tức thời!
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic User Permissions Simulator switcher */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs h-fit space-y-4">
          <div className="flex items-center gap-1.5 text-gray-800 font-bold text-xs uppercase border-b border-gray-100 pb-2">
            <Users className="h-4 w-4 text-emerald-600" />
            <span>Chuyển đổi Trực Bản nhanh</span>
          </div>

          <div className="rounded-lg bg-emerald-50/20 p-3 text-xs text-emerald-800 border border-emerald-50">
            Click vào tên bất kỳ để thay đổi vai trò đang hạch toán ngay lập tức (không cần gõ mật khẩu để rút ngắn thời gian kiểm thử):
          </div>

          <div className="space-y-2">
            {users.map((u) => {
              const isCurrent = u.username === currentUser;
              return (
                <button
                  key={u.username}
                  onClick={() => {
                    if (u.isActive) {
                      onSwitchUser(u.username);
                    } else {
                      alert('Tài khoản này đang bị khóa, không thể chuyển đổi nhanh!');
                    }
                  }}
                  className={`w-full text-left rounded-xl p-3 border transition-all flex items-center justify-between cursor-pointer ${isCurrent ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100' : 'bg-gray-50/30 text-gray-700 border-gray-100 hover:bg-gray-50/90'} ${!u.isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div>
                    <p className={`text-xs font-bold ${isCurrent ? 'text-white' : 'text-gray-900'}`}>{u.fullName}</p>
                    <p className={`text-[10px] ${isCurrent ? 'text-emerald-100' : 'text-gray-400'}`}>Mã đăng nhập: {u.username}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {!u.isActive && <span className="text-[8px] bg-rose-100 text-rose-700 px-1 rounded">Lock</span>}
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${isCurrent ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                      {u.role}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-gray-100">
            <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1">
              <Shield className="h-3 w-3" /> Chi tiết phân cấp vai trò
            </h4>
            <ul className="text-[10px] text-gray-500 space-y-1.5 mt-2.5 list-disc pl-3 font-medium">
              <li><strong className="text-gray-700">SUPER_ADMIN</strong>: Toàn quyền, cấu hình hệ thống, mở khóa tháng đã chốt.</li>
              <li><strong className="text-gray-700">ADMIN</strong>: Quản lý võ sinh, thu học phí đóng, xuất hóa đơn, xuất file chuyển GV.</li>
              <li><strong className="text-gray-700">STAFF</strong>: Phụ trách tạo thông báo, xem danh sách, xác định doanh số thù lao nhưng không được thu phí / thay đổi học viên.</li>
              <li><strong className="text-gray-700">VIEWER</strong>: Quyền xem học phí, thích hợp đại diện phụ huynh / thanh tra võ quán.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
