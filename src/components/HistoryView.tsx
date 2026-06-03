/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Clock, User, FileSpreadsheet, RefreshCw, Calendar, ClipboardList } from 'lucide-react';
import { HistoryRecord } from '../types';
import { exportToCSV, buildFilename } from '../utils';

interface HistoryViewProps {
  historyRecords: HistoryRecord[];
}

export default function HistoryView({ historyRecords }: HistoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Filter records
  const filteredRecords = historyRecords.filter(record => {
    const matchesSearch = 
      record.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !dateFilter || record.date.includes(dateFilter);

    return matchesSearch && matchesDate;
  });

  const handleExportHistory = () => {
    const prepareData = filteredRecords.map(r => ({
      'Thời gian': r.date,
      'Người thực hiện': r.user,
      'Nội dung thay đổi': r.content
    }));
    exportToCSV(
      prepareData,
      ['Thời gian', 'Người thực hiện', 'Nội dung thay đổi'],
      buildFilename('lich_su_hoat_dong', 'csv')
    );
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-emerald-600" />
            Lịch Sử Hoạt Động (History Log)
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Ghi nhận toàn bộ vết lịch sử cập nhật giao dịch, hồ sơ võ sinh, bài viết và cấu hình từ Google Sheets.
          </p>
        </div>
        
        <button
          onClick={handleExportHistory}
          disabled={filteredRecords.length === 0}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100/80 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed no-print"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Xuất Lịch Sử (CSV)
        </button>
      </div>

      {/* Control Filters panel */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-2xs no-print">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Search text */}
          <div className="relative">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm nội dung, người tác động..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-1.5 pl-9 pr-4 text-xs focus:border-emerald-500 focus:outline-none transition-all-150 font-medium"
            />
          </div>

          {/* Date Filter input */}
          <div className="relative">
            <Calendar className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Lọc theo ngày (YYYY-MM-DD)..."
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-1.5 pl-9 pr-4 text-xs focus:border-emerald-500 focus:outline-none transition-all-150 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Primary History table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-gray-600">
            <thead className="bg-[#f3fbf5] text-[10px] uppercase tracking-wider text-emerald-900 font-bold border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 w-48">Thời gian</th>
                <th className="px-5 py-3 w-48">Người thực hiện</th>
                <th className="px-5 py-3">Nội dung hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-12 text-center text-gray-400">
                    Chưa ghi nhận sự kiện lịch sử kiểm toán nào.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec, index) => (
                  <tr key={index} className="hover:bg-gray-50/40 transition-colors">
                    {/* Time */}
                    <td className="px-5 py-3 text-gray-500 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>{rec.date}</span>
                      </div>
                    </td>
                    {/* User */}
                    <td className="px-5 py-3 font-semibold text-gray-800">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] uppercase font-bold shrink-0">
                          {rec.user ? rec.user.charAt(0) : 'U'}
                        </div>
                        <span className="truncate max-w-[150px]">{rec.user || 'Hệ thống'}</span>
                      </div>
                    </td>
                    {/* Details */}
                    <td className="px-5 py-3 text-gray-750 font-medium whitespace-pre-line leading-relaxed">
                      {rec.content}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footnotes */}
        <div className="border-t border-gray-100 px-5 py-2.5 bg-gray-50/50 flex justify-between items-center text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
          <span>Tổng số: {filteredRecords.length} dòng sự kiện</span>
          <span className="font-mono text-emerald-800 text-[9px] uppercase font-bold">Lịch sử tự động đồng bộ thời gian thực</span>
        </div>
      </div>
    </div>
  );
}
