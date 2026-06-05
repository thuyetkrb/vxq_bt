/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Lock, Unlock, Calendar, Plus, Printer, CheckCircle, Database, ShieldAlert, Award, FileDown } from 'lucide-react';
import { Baseline, Student, TuitionPayment, TeacherTransfer, UserRole } from '../types';
import { formatVND, getMonthName } from '../utils';

interface BaselineViewProps {
  baselines: Baseline[];
  students: Student[];
  payments: TuitionPayment[];
  transfers: TeacherTransfer[];
  selectedMonth: number;
  selectedYear: number;
  userRole: UserRole;
  currentUserName: string;
  onCreateBaseline: (month: number, year: number) => void;
  onLockBaseline: (baselineId: string) => void;
  onUnlockBaseline: (baselineId: string) => void;
}

export default function BaselineView({
  baselines,
  students,
  payments,
  transfers,
  selectedMonth,
  selectedYear,
  userRole,
  currentUserName,
  onCreateBaseline,
  onLockBaseline,
  onUnlockBaseline
}: BaselineViewProps) {
  const [activeBaselineTab, setActiveBaselineTab] = useState<'current' | 'history'>('current');
  const [successMsg, setSuccessMsg] = useState('');

  // Find baseline for selected period
  const activeBaseline = baselines.find(b => b.month === selectedMonth && b.year === selectedYear);

  // Compute stats for selected period
  const activeStudentsCount = students.filter(s => s.activeStatus === 'Active').length;
  const collectedPayments = payments.filter(p => p.month === selectedMonth && p.year === selectedYear && p.paidStatus === 'Paid' && students.some(s => s.studentId === p.studentId && s.activeStatus === 'Active'));
  const unpaidPayments = payments.filter(p => p.month === selectedMonth && p.year === selectedYear && p.paidStatus === 'Unpaid' && students.some(s => s.studentId === p.studentId && s.activeStatus === 'Active'));
  
  const totalCollectedAmount = collectedPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalUnpaidAmount = unpaidPayments.reduce((sum, p) => {
    const s = students.find(stud => stud.studentId === p.studentId);
    return sum + (s ? s.tuitionFee : p.amount);
  }, 0);

  const monthTransfers = transfers.filter(t => t.month === selectedMonth && t.year === selectedYear);
  const totalTransferredAmount = monthTransfers.reduce((sum, t) => sum + t.transferAmount, 0);
  
  const remainingCalculated = totalCollectedAmount - totalTransferredAmount;

  const handleCreate = () => {
    onCreateBaseline(selectedMonth, selectedYear);
    setSuccessMsg(`Đã khởi tạo chốt số thành công cho tháng ${selectedMonth}/${selectedYear}`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleToggleLock = (bl: Baseline) => {
    if (bl.status === 'LOCKED') {
      if (userRole !== 'SUPER_ADMIN') {
        alert('Chỉ quản lý cấp cao (SUPER_ADMIN) mới có quyền mở khóa dữ liệu tháng đã chốt!');
        return;
      }
      onUnlockBaseline(bl.baselineId);
    } else {
      onLockBaseline(bl.baselineId);
    }
  };

  const handleTriggerPrint = () => {
    const area = document.getElementById('report-baseline-a4-surface');
    if (!area) return;
    const orig = document.body.innerHTML;
    document.body.innerHTML = area.innerHTML;
    window.print();
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Chốt Số & Lưu Trữ Điểm Neo</h1>
        <p className="text-xs text-gray-500 mt-1">Lưu trữ ảnh chụp nhanh (snapshot) số liệu kế toán hàng tháng và đóng băng dữ liệu học phí.</p>
      </div>

      {successMsg && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2 pulse-active">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveBaselineTab('current')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${activeBaselineTab === 'current' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          Kỳ kế toán hiện tại ({selectedMonth}/{selectedYear})
        </button>
        <button
          onClick={() => setActiveBaselineTab('history')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${activeBaselineTab === 'history' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          Lịch sử lưu trữ ({baselines.length} bản ghi)
        </button>
      </div>

      {activeBaselineTab === 'current' ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Main Stats Comparison panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Database className="h-4.5 w-4.5 text-emerald-600" />
                  <span className="font-bold text-gray-800 text-sm">Điểm neo tháng {selectedMonth}/{selectedYear}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-block rounded px-2.5 py-1 text-[11px] font-bold ${activeBaseline?.status === 'LOCKED' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                    {activeBaseline?.status === 'LOCKED' ? 'ĐÃ KHÓA SỔ' : 'ĐANG MỞ'}
                  </span>
                </div>
              </div>

              {/* Status information warning */}
              <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600 border border-gray-200 mb-6">
                Khi trạng thái là <strong className="text-red-700">ĐÃ KHÓA SỔ (LOCKED)</strong>, không ai có thể sửa đổi hay thu thêm học phí của tháng này. Điều này giúp ngăn ngừa gian lận hoặc sai lệch số sách cũ. 
                {userRole !== 'SUPER_ADMIN' && <span className="block mt-1 font-semibold text-emerald-800">Lưu ý: Bạn cần vai trò SUPER_ADMIN để mở khóa.</span>}
              </div>

              {/* Snapshot form status / details */}
              {activeBaseline ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 bg-emerald-50/20 rounded-xl p-4 border border-emerald-100/50">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Học sinh tích cực</span>
                    <p className="text-lg font-extrabold text-emerald-950">{activeBaseline.totalStudents} em</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Đã thu học phí</span>
                    <p className="text-emerald-700 font-bold text-sm tracking-tight">{formatVND(activeBaseline.totalCollected)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Đã chuyển GV</span>
                    <p className="text-amber-700 font-bold text-sm tracking-tight">{formatVND(activeBaseline.totalTransferred)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">Quỹ tồn dư</span>
                    <p className="text-gray-900 font-bold text-sm tracking-tight">{formatVND(activeBaseline.remainingAmount)}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">Bạn chưa chốt hạ số liệu kế toán của tháng {selectedMonth}/{selectedYear}.</p>
                  <button
                    onClick={handleCreate}
                    className="mt-3 inline-flex items-center gap-1 bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-lg hover:bg-emerald-700 transition cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Chốt hạ số liệu tự động
                  </button>
                </div>
              )}

              {/* Footer controls */}
              {activeBaseline && (
                <div className="mt-6 flex flex-wrap gap-2 justify-end">
                  <button
                    onClick={() => handleToggleLock(activeBaseline)}
                    className={`flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeBaseline.status === 'LOCKED' ? 'bg-red-50 text-red-800 hover:bg-red-100 border border-red-200' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'}`}
                  >
                    {activeBaseline.status === 'LOCKED' ? (
                      <>
                        <Unlock className="h-3.5 w-3.5" />
                        Mở Khóa Tháng (Yêu cầu S.Admin)
                      </>
                    ) : (
                      <>
                        <Lock className="h-3.5 w-3.5" />
                        Khóa Chặt Sổ (Lock Month)
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleTriggerPrint}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    In Báo Cáo Chốt Số
                  </button>
                </div>
              )}
            </div>

            {/* Hidden printable A4 report area */}
            {activeBaseline && (
              <div id="report-baseline-a4-surface" className="hidden">
                <div className="p-8 max-w-2xl mx-auto bg-white font-sans text-black">
                  <div className="text-center font-bold text-lg border-b pb-4 mb-6">
                    BÁO CÁO CHỐT SỐ LIỆU TÀI CHÍNH NỘI BỘ
                    <div className="text-sm font-normal text-gray-500 mt-1 uppercase">Kỳ hạch toán: {getMonthName(selectedMonth)} / Năm {selectedYear}</div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <p><strong>Ngày lập báo cáo:</strong> {new Date().toLocaleDateString('vi-VN')}</p>
                    <p><strong>Người lập:</strong> {activeBaseline.createdBy} (Hệ thống tự động chụp nhanh)</p>
                    <p><strong>Trạng thái bảo an:</strong> {activeBaseline.status === 'LOCKED' ? 'ĐA KHÓA CỨNG (LOCKED)' : 'ĐANG MỞ CHỜ KIỂM'}</p>
                    
                    <div className="my-6 border-t border-b py-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Tổng học sinh theo dõi:</span>
                        <strong>{activeBaseline.totalStudents} học sinh</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Tổng học phí thực tế đã thu:</span>
                        <strong>{formatVND(activeBaseline.totalCollected)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Lương / Thù lao giáo viên đã chi:</span>
                        <strong>{formatVND(activeBaseline.totalTransferred)}</strong>
                      </div>
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <span>Số dư tích lũy hiện hữu bàn giao:</span>
                        <strong className="text-lg">{formatVND(activeBaseline.remainingAmount)}</strong>
                      </div>
                    </div>

                    <h3 className="font-bold border-b pb-1 mt-6">Chi tiết công nợ chưa thu</h3>
                    <table className="w-full text-xs mt-3 text-left">
                      <thead>
                        <tr className="border-b">
                          <th className="pb-1 text-gray-500">Mã học sinh</th>
                          <th className="pb-1 text-gray-500">Họ tên học sinh</th>
                          <th className="pb-1 text-gray-500 text-right">Học phí nợ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unpaidPayments.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="py-2 text-center text-gray-400">Không có công nợ tồn đọng trong tháng. Hoàn thành 100%!</td>
                          </tr>
                        ) : (
                          unpaidPayments.map(p => {
                            const stud = students.find(s => s.studentId === p.studentId);
                            return (
                              <tr key={p.paymentId} className="border-b">
                                <td className="py-2">{p.studentId}</td>
                                <td className="py-2 font-medium">{stud?.fullName || 'Học viên ẩn'}</td>
                                <td className="py-2 text-right">{formatVND(stud ? stud.tuitionFee : p.amount)}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>

                    <div className="mt-16 text-center italic text-xs text-gray-400">
                      Báo cáo điện tử tự động kết toán nội bộ - Không sửa đổi.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Current list of outstanding debts right panel of baseline screen */}
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-1.5 text-gray-800 font-bold text-xs uppercase border-b border-gray-100 pb-2 mb-3">
                <ShieldAlert className="h-4 w-4 text-red-600" />
                <span>Danh sách công nợ nợ phí</span>
              </div>

              {unpaidPayments.length === 0 ? (
                <div className="text-center py-6">
                  <Award className="h-8 w-8 text-amber-500 mx-auto opacity-75" />
                  <p className="text-xs text-emerald-800 font-bold mt-2">Đã thu đủ 100% học phí</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Không tồn đọng hóa đơn trễ</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  <div className="text-[11px] text-gray-400 mb-1">
                    Tổng cộng: <strong className="text-red-700">{unpaidPayments.length} học sinh</strong> chưa đóng học phí. (Tổng thất thu: {formatVND(totalUnpaidAmount)})
                  </div>
                  {unpaidPayments.map(pay => {
                    const stud = students.find(s => s.studentId === pay.studentId);
                    return (
                      <div key={pay.paymentId} className="flex justify-between items-center rounded-lg border border-red-50 bg-red-50/20 p-2.5">
                        <div>
                          <p className="text-xs font-bold text-gray-800">{stud?.fullName || 'N/A'}</p>
                          <p className="text-[10px] text-gray-400">SĐT: {stud?.parentPhone || 'Chưa cung cấp'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-red-700">{formatVND(stud ? stud.tuitionFee : pay.amount)}</p>
                          <span className="text-[9px] px-1 bg-red-100/70 text-red-800 rounded font-semibold">Chờ đóng</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* History Archive Section */
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-gray-600">
              <thead className="bg-[#f0f9f3] text-[10px] uppercase font-bold text-[#14532d] border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3">Danh mục Điểm Neo</th>
                  <th className="px-4 py-3">Thời điểm chốt</th>
                  <th className="px-4 py-3">Sĩ số theo dõi</th>
                  <th className="px-4 py-3">Danh số thực thu</th>
                  <th className="px-4 py-3">Tổng chuyển GV</th>
                  <th className="px-4 py-3">Còn lại thặng dư</th>
                  <th className="px-4 py-3">Lập bởi</th>
                  <th className="px-4 py-3 text-right">Bảo an</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {baselines.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                      Chưa lưu trữ bất kì bản chốt số liệu quá khứ nào.
                    </td>
                  </tr>
                ) : (
                  baselines.map(bl => (
                    <tr key={bl.baselineId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-gray-800">
                        {getMonthName(bl.month)} / Năm {bl.year}
                      </td>
                      <td className="px-4 py-3.5 text-gray-400">{bl.createdAt.substring(0, 10)}</td>
                      <td className="px-4 py-3.5 font-medium text-gray-950">{bl.totalStudents} em</td>
                      <td className="px-4 py-3.5 font-bold text-emerald-800">{formatVND(bl.totalCollected)}</td>
                      <td className="px-4 py-3.5 font-bold text-amber-800">{formatVND(bl.totalTransferred)}</td>
                      <td className="px-4 py-3.5 text-gray-900 font-bold">{formatVND(bl.remainingAmount)}</td>
                      <td className="px-4 py-3.5 text-gray-500">{bl.createdBy}</td>
                      <td className="px-4 py-3.5 text-right">
                        <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${bl.status === 'LOCKED' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {bl.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
