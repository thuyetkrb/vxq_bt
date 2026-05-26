/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Pin, Trash2, Megaphone, Edit3, Plus, Calendar, PinOff, CheckCircle, ShieldAlert, X } from 'lucide-react';
import { Announcement, UserRole } from '../types';
import { motion } from 'motion/react';

interface AnnouncementSectionProps {
  announcements: Announcement[];
  userRole: UserRole;
  currentUserName: string;
  onAddAnnouncement: (announcement: Omit<Announcement, 'announcementId' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateAnnouncement: (annId: string, updated: Partial<Announcement>) => void;
  onDeleteAnnouncement: (annId: string) => void;
}

export default function AnnouncementSection({
  announcements,
  userRole,
  currentUserName,
  onAddAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement
}: AnnouncementSectionProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const canWrite = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'STAFF';

  // Sort: pinned first, then by date desc
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleOpenCreateForm = () => {
    if (!canWrite) {
      setError('Tài khoản của bạn không có đủ thẩm quyền viết thông báo mới!');
      return;
    }
    setEditingId(null);
    setTitle('');
    setContent('');
    setIsPinned(false);
    setIsFormOpen(true);
  };

  const handleEditClick = (ann: Announcement) => {
    if (!canWrite) return;
    setEditingId(ann.announcementId);
    setTitle(ann.title);
    setContent(ann.content);
    setIsPinned(ann.pinned);
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim() || !content.trim()) {
      setError('Vui lòng điền đầy đủ tiêu đề và nội dung.');
      return;
    }

    if (editingId) {
      onUpdateAnnouncement(editingId, {
        title,
        content,
        pinned: isPinned,
        updatedAt: new Date().toISOString()
      });
      setSuccess('Đã cập nhật thông báo thành công!');
    } else {
      onAddAnnouncement({
        title,
        content,
        createdBy: currentUserName,
        pinned: isPinned
      });
      setSuccess('Đã đăng tải thông báo mới lên hệ thống!');
    }

    setIsFormOpen(false);
    setTitle('');
    setContent('');
    setIsPinned(false);
    setEditingId(null);

    setTimeout(() => setSuccess(''), 4000);
  };

  const handleDelete = (annId: string) => {
    if (!canWrite) return;
    if (confirm('Bạn có chắc chắn muốn xóa vĩnh viễn thông báo này không?')) {
      onDeleteAnnouncement(annId);
      setSuccess('Đã gỡ bỏ bản tin thông báo tải xuống!');
      setTimeout(() => setSuccess(''), 4000);
    }
  };

  const handleTogglePin = (ann: Announcement) => {
    if (!canWrite) return;
    onUpdateAnnouncement(ann.announcementId, { pinned: !ann.pinned });
    setSuccess(`Đã ${!ann.pinned ? 'Ghim' : 'Bỏ Ghim'} thông báo thành công!`);
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Bảng Tin & Thông Báo Nội Bộ</h1>
          <p className="text-xs text-gray-500 mt-1">Truyền đạt lịch nghỉ lễ, kế hoạch đóng học phí, lịch bổ trợ và quy chế thi cử.</p>
        </div>

        {canWrite && (
          <button
            onClick={handleOpenCreateForm}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-xs px-3.5 py-2 rounded-lg transition-all shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Viết Bản Tin
          </button>
        )}
      </div>

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2 pulse-active">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Write/Edit Announcement Drawer or Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <motion.div 
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-xl flex flex-col bg-white border border-emerald-100 shadow-xl overflow-hidden"
          >
            <div className="flex items-center justify-between bg-emerald-50 px-5 py-3 border-b border-emerald-100/50">
              <span className="font-bold text-xs text-emerald-950 uppercase tracking-wider">
                {editingId ? 'Chỉnh sửa bản tin thông báo' : 'Tạo mới thông báo nội bộ'}
              </span>
              <button onClick={() => setIsFormOpen(false)} className="rounded-full p-1 text-emerald-700 hover:bg-emerald-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Tiêu đề bản tin</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Lịch bồi dưỡng IELTS Reading thứ 7 tuần này"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2 px-3 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Nội dung chi tiết</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Nhập nội dung thông báo đầy đủ gửi tặng phụ huynh và học sinh..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-3 text-xs focus:border-emerald-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-1.5 focus:outline-none">
                <input
                  type="checkbox"
                  id="pin-check"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="h-4 w-4 accent-emerald-600 rounded"
                />
                <label htmlFor="pin-check" className="text-xs font-semibold text-gray-600 select-none cursor-pointer flex items-center gap-1">
                  <Pin className="h-3 w-3 text-emerald-600" /> Ghim lên đầu tin tức (Pinned announcement)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 mt-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer shadow-sm shadow-emerald-200"
                >
                  Lưu & Phát hành
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Announcements Stream List */}
      <div className="space-y-3.5">
        {sortedAnnouncements.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-12 text-center">
            <Megaphone className="h-8 w-8 text-emerald-400 mx-auto opacity-70" />
            <p className="text-sm text-gray-500 mt-3 font-medium">Bảng tin hệ thống trống rỗng.</p>
            <p className="text-xs text-gray-400">Hãy thêm thông báo đầu tiên để ban truyền thông trung tâm hoạt động.</p>
          </div>
        ) : (
          sortedAnnouncements.map((ann) => (
            <div
              key={ann.announcementId}
              className={`rounded-xl border border-gray-100 bg-white p-5 shadow-xs relative overflow-hidden transition-all hover:border-emerald-200 hover:shadow-sm ${ann.pinned ? 'border-l-4 border-l-emerald-500 bg-emerald-50/10' : ''}`}
            >
              {ann.pinned && (
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  <Pin className="h-3 w-3 shrink-0" />
                  Ghim đầu bảng
                </div>
              )}

              <div className="flex flex-col gap-1.5 pr-20 md:pr-24">
                <h3 className="text-sm font-bold text-gray-900 leading-snug">{ann.title}</h3>
                
                {/* Meta details row */}
                <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    {ann.createdAt.substring(0, 10)}
                  </span>
                  <span>•</span>
                  <span>Đăng bởi: <strong className="text-gray-600">{ann.createdBy}</strong></span>
                </div>
              </div>

              {/* Body Text */}
              <div className="mt-3.5 text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                {ann.content}
              </div>

              {/* Action permissions controls */}
              {canWrite && (
                <div className="flex items-center justify-end gap-2 border-t border-gray-50/50 pt-3 mt-4 text-[11px]">
                  <button
                    onClick={() => handleTogglePin(ann)}
                    className="flex items-center gap-1 text-gray-400 hover:text-emerald-700 font-semibold cursor-pointer"
                  >
                    {ann.pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                    {ann.pinned ? 'Bỏ ghim' : 'Ghim'}
                  </button>
                  <span className="text-gray-200">|</span>
                  <button
                    onClick={() => handleEditClick(ann)}
                    className="flex items-center gap-1 text-gray-400 hover:text-amber-700 font-semibold cursor-pointer"
                  >
                    <Edit3 className="h-3 w-3" />
                    Sửa
                  </button>
                  <span className="text-gray-200">|</span>
                  <button
                    onClick={() => handleDelete(ann.announcementId)}
                    className="flex items-center gap-1 text-gray-400 hover:text-rose-700 font-semibold cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                    Xóa
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
