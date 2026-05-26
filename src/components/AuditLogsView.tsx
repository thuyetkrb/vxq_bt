/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Search, Filter, RefreshCw, Download, FileSpreadsheet } from 'lucide-react';
import { AuditLog } from '../types';
import { exportToCSV, buildFilename } from '../utils';

interface AuditLogsViewProps {
  logs: AuditLog[];
}

export default function AuditLogsView({ logs }: AuditLogsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.modifiedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.newValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.oldValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEntity = entityFilter === 'ALL' || log.entityType === entityFilter;
    const matchesAction = actionFilter === 'ALL' || matchesActionFilter(actionFilter, log);

    return matchesSearch && matchesEntity && matchesAction;
  });

  function matchesActionFilter(filter: string, log: AuditLog): boolean {
    return log.action === filter;
  }

  const handleExportLogs = () => {
    const prepareData = filteredLogs.map(l => ({
      'Mã Logs': l.auditId,
      'Đối tượng': l.entityType,
      'ID Đối tượng': l.entityId,
      'Hành động': l.action,
      'Giá trị cũ': l.oldValue,
      'Giá trị mới': l.newValue,
      'Người sửa': l.modifiedBy,
      'Thời gian': l.modifiedAt
    }));
    exportToCSV(
      prepareData,
      ['Mã Logs', 'Đối tượng', 'ID Đối tượng', 'Hành động', 'Giá trị cũ', 'Giá trị mới', 'Người sửa', 'Thời gian'],
      buildFilename('nhat_ky_he_thong', 'csv')
    );
  };

  const getEntityBadge = (type: string) => {
    switch (type) {
      case 'STUDENT': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'TUITION': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'TRANSFER': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'CLASS': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'CONFIGURATION': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'BASELINE': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'ANNOUNCEMENT': return 'bg-sky-50 text-sky-700 border-sky-100';
      case 'AUTH': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE': return 'text-emerald-700 bg-emerald-100/65';
      case 'UPDATE': return 'text-amber-700 bg-amber-100/65';
      case 'DELETE': return 'text-rose-700 bg-rose-100/65';
      case 'LOGIN': return 'text-purple-700 bg-purple-100/65';
      case 'LOGOUT': return 'text-gray-700 bg-gray-100/65';
      case 'BASELINE_CREATE': return 'text-cyan-700 bg-cyan-100/65';
      case 'MONTH_LOCK': return 'text-red-700 bg-red-100/65';
      case 'MONTH_UNLOCK': return 'text-emerald-700 bg-emerald-100/65';
      default: return 'text-gray-700 bg-gray-100/65';
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Nhật ký Hệ thống & Kiểm toán</h1>
          <p className="text-xs text-gray-500 mt-1">Ghi lại toàn bộ thao tác thêm, sửa, xóa học phí và phân quyền nội bộ.</p>
        </div>
        
        <button
          onClick={handleExportLogs}
          disabled={filteredLogs.length === 0}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100/80 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Xuất Nhật Ký (CSV)
        </button>
      </div>

      {/* Control Filters panel */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Search text */}
          <div className="relative">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm hành động, người sửa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2 pl-9 pr-4 text-xs focus:border-emerald-500 focus:outline-none transition-all"
            />
          </div>

          {/* Type dropdown */}
          <div className="flex items-center gap-1 bg-gray-50/50 border border-gray-200 rounded-lg px-2">
            <span className="text-[10px] text-gray-400 font-medium uppercase px-1">Khối:</span>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="flex-1 bg-transparent py-1.5 text-xs font-medium text-gray-700 focus:outline-none"
            >
              <option value="ALL">Tất cả đối tượng</option>
              <option value="STUDENT">Học sinh (STUDENT)</option>
              <option value="TUITION">Học phí (TUITION)</option>
              <option value="TRANSFER">Chi lương (TRANSFER)</option>
              <option value="CLASS">Lớp học (CLASS)</option>
              <option value="ANNOUNCEMENT">Thông báo (ANNOUNCEMENT)</option>
              <option value="CONFIGURATION">Cấu hình (CONFIG)</option>
              <option value="BASELINE">Điểm neo (BASELINE)</option>
              <option value="AUTH">Hệ thống (AUTH)</option>
            </select>
          </div>

          {/* Action dropdown */}
          <div className="flex items-center gap-1 bg-gray-50/50 border border-gray-200 rounded-lg px-2">
            <span className="text-[10px] text-gray-400 font-medium uppercase px-1">Lệnh:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="flex-1 bg-transparent py-1.5 text-xs font-medium text-gray-700 focus:outline-none"
            >
              <option value="ALL">Tất cả lệnh</option>
              <option value="CREATE">Thêm mới (CREATE)</option>
              <option value="UPDATE">Cập nhật (UPDATE)</option>
              <option value="DELETE">Xóa (DELETE)</option>
              <option value="LOGIN">Đăng nhập</option>
              <option value="BASELINE_CREATE">Chốt số</option>
              <option value="MONTH_LOCK">Khóa sổ</option>
              <option value="MONTH_UNLOCK">Mở sổ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Primary logs table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-gray-600">
            <thead className="bg-[#f3fbf5] text-[10px] uppercase tracking-wider text-emerald-900 font-bold border-b border-gray-100">
              <tr>
                <th className="px-4 py-3">Mã log</th>
                <th className="px-4 py-3">Danh mục</th>
                <th className="px-4 py-3">Hành động</th>
                <th className="px-4 py-3">Hồ sơ đối chiếu</th>
                <th className="px-4 py-3">Nhật trình thay đổi</th>
                <th className="px-4 py-3">Người sửa</th>
                <th className="px-4 py-3 text-right">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    Không tìm thấy nhật ký kiểm toán phù hợp.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.auditId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-[10px] text-gray-400">{log.auditId}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold border ${getEntityBadge(log.entityType)}`}>
                        {log.entityType}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block rounded-md px-1.5 py-0.5 text-[10px] font-bold ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-gray-500 font-medium">{log.entityId}</td>
                    <td className="px-4 py-3.5 max-w-sm">
                      <div className="space-y-1">
                        {log.oldValue && (
                          <div className="text-gray-400 line-through truncate text-[11px]">
                            Cũ: {log.oldValue}
                          </div>
                        )}
                        <div className="text-gray-900 font-medium line-clamp-2">
                          {log.newValue}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-gray-700">{log.modifiedBy}</td>
                    <td className="px-4 py-3.5 text-right text-gray-400 font-mono text-[10px]">
                      {log.modifiedAt.replace('T', ' ').replace('Z', '').substring(0, 19)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Counter footer */}
        <div className="border-t border-gray-100 px-4 py-2.5 bg-gray-50/50 flex justify-between items-center text-[11px] text-gray-500">
          <span>Đang hiển thị {filteredLogs.length} / {logs.length} sự kiện kiểm toán</span>
          <span className="font-mono text-emerald-800">Cơ chế an ninh nội bộ được kích hoạt</span>
        </div>
      </div>
    </div>
  );
}
