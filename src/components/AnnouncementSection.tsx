/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Pin, Trash2, Megaphone, Edit3, Plus, Calendar, PinOff, CheckCircle, ShieldAlert, X, Newspaper, Share2 } from 'lucide-react';
import { Announcement, UserRole } from '../types';
import { motion } from 'motion/react';

interface AnnouncementSectionProps {
  announcements: Announcement[];
  userRole: UserRole;
  currentUserName: string;
  onAddAnnouncement: (announcement: Omit<Announcement, 'announcementId' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateAnnouncement: (annId: string, updated: Partial<Announcement>) => void;
  onDeleteAnnouncement: (annId: string) => void;
  forceType?: 'internal' | 'news';
  targetAnnId?: string | null;
  onSelectAnnouncement?: (annId: string | null) => void;
}

export default function AnnouncementSection({
  announcements,
  userRole,
  currentUserName,
  onAddAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
  forceType,
  targetAnnId,
  onSelectAnnouncement
}: AnnouncementSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<'internal' | 'news'>(forceType || 'internal');
  const [expandedAnnIds, setExpandedAnnIds] = useState<Record<string, boolean>>({});

  const toggleExpandAnn = (id: string) => {
    const nextVal = !expandedAnnIds[id];
    setExpandedAnnIds(prev => ({
      ...prev,
      [id]: nextVal
    }));
    if (onSelectAnnouncement) {
      onSelectAnnouncement(nextVal ? id : null);
    }
  };

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [type, setType] = useState<'internal' | 'news'>(forceType || 'internal');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Synchronize expandedAnnIds on mount or when targetAnnId changes
  React.useEffect(() => {
    if (targetAnnId) {
      setExpandedAnnIds(prev => ({
        ...prev,
        [targetAnnId]: true
      }));

      // Find the target announcement to auto-sync activeSubTab with its type
      const matched = announcements.find(a => a.announcementId === targetAnnId);
      if (matched) {
        const matchedType = matched.type || 'internal';
        setActiveSubTab(matchedType);
      }

      // Smooth scroll to the direct-linked element
      setTimeout(() => {
        const el = document.getElementById(`ann-card-${targetAnnId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [targetAnnId, announcements]);

  // Sychronize activeSubTab with forceType if it changes
  React.useEffect(() => {
    if (forceType) {
      setActiveSubTab(forceType);
      setType(forceType);
    }
  }, [forceType]);

  const canWrite = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === 'STAFF';

  // Filter announcements by activeSubTab (missing type defaults to 'internal')
  const filteredAnnouncements = announcements.filter((ann) => {
    const annType = ann.type || 'internal';
    if (targetAnnId) {
      return ann.announcementId === targetAnnId;
    }
    return annType === activeSubTab;
  });

  // Sort: pinned first, then by date desc
  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleOpenCreateForm = () => {
    if (!canWrite) {
      setError(`Tài khoản của bạn không có đủ thẩm quyền viết ${activeSubTab === 'news' ? 'bài viết' : 'thông báo'} mới!`);
      return;
    }
    setEditingId(null);
    setTitle('');
    setContent('');
    setIsPinned(false);
    setType(activeSubTab);
    setIsFormOpen(true);
  };

  const handleEditClick = (ann: Announcement) => {
    if (!canWrite) return;
    setEditingId(ann.announcementId);
    setTitle(ann.title);
    setContent(ann.content);
    setIsPinned(ann.pinned);
    setType(ann.type || 'internal');
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
        type,
        updatedAt: new Date().toISOString()
      });
      setSuccess(type === 'news' ? 'Đã cập nhật bài viết thành công!' : 'Đã cập nhật thông báo thành công!');
    } else {
      onAddAnnouncement({
        title,
        content,
        createdBy: currentUserName,
        pinned: isPinned,
        type
      });
      setSuccess(type === 'news' ? 'Đã đăng tải bài viết mới lên hệ thống!' : 'Đã đăng tải thông báo mới lên hệ thống!');
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
    if (confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn ${activeSubTab === 'news' ? 'bài viết' : 'thông báo'} này không?`)) {
      onDeleteAnnouncement(annId);
      setSuccess(`Đã gỡ bỏ ${activeSubTab === 'news' ? 'bài viết' : 'bản tin thông báo'} thành công!`);
      setTimeout(() => setSuccess(''), 4000);
    }
  };

  const handleTogglePin = (ann: Announcement) => {
    if (!canWrite) return;
    onUpdateAnnouncement(ann.announcementId, { pinned: !ann.pinned });
    setSuccess(`Đã ${!ann.pinned ? 'Ghim' : 'Bỏ Ghim'} thành công!`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleCopyLink = (ann: Announcement) => {
    const prefix = ann.type === 'news' ? 'tin-tuc' : 'noi-bo';
    const link = `${window.location.origin}/#/${prefix}/${ann.announcementId}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).then(() => {
        setSuccess('Đã sao chép liên kết bài đăng vào bộ nhớ tạm!');
        setCopiedId(ann.announcementId);
        setTimeout(() => {
          setCopiedId(null);
          setSuccess('');
        }, 3000);
      }).catch(err => {
        console.error('Failed to copy', err);
        setError('Không thể tự động sao chép liên kết.');
      });
    } else {
      setError(`Sao chép liên kết thủ công: ${link}`);
    }
  };

  const internalCount = announcements.filter(a => !a.type || a.type === 'internal').length;
  const newsCount = announcements.filter(a => a.type === 'news').length;

  return (
    <div className="space-y-4">
      {/* Dynamic Navigation Subtabs */}
      {!forceType && (
        <div className="flex border-b border-gray-100 bg-white p-1 rounded-xl shadow-2xs gap-2">
          <button
            onClick={() => setActiveSubTab('internal')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'internal'
                ? 'bg-emerald-50 text-emerald-800 border-b-2 border-emerald-600 shadow-3xs'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Megaphone className="h-4 w-4 text-emerald-600" />
            Bảng Tin Nội Bộ
            <span className="text-[10px] bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded-full ml-1 font-extrabold">
              {internalCount}
            </span>
          </button>
          <button
            onClick={() => setActiveSubTab('news')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'news'
                ? 'bg-emerald-50 text-emerald-800 border-b-2 border-emerald-600 shadow-3xs'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Newspaper className="h-4 w-4 text-emerald-600" />
            Tin Tức - Bài Viết
            <span className="text-[10px] bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded-full ml-1 font-extrabold">
              {newsCount}
            </span>
          </button>
        </div>
      )}

      {/* Page Header with details */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-3xs">
        <div>
          <h1 className="text-lg font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            {activeSubTab === 'internal' ? (
              <>
                <Megaphone className="h-5 w-5 text-emerald-600 shrink-0 select-none" />
                Bảng Tin & Thông Báo Nội Bộ
              </>
            ) : (
              <>
                <Newspaper className="h-5 w-5 text-emerald-600 shrink-0 select-none" />
                Tin Tức - Bài Viết Linh Hoạt
              </>
            )}
          </h1>
          <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
            {activeSubTab === 'internal' 
              ? 'Truyền đạt lịch nghỉ lễ, kế hoạch đóng học phí, lịch bổ trợ và quy chế thi cử đến toàn thể học viên.'
              : 'Chia sẻ võ đạo tinh hoa, kỹ thuật Vịnh Xuân Quyền, tin tức hội thảo, sự kiện võ thuật nổi bật.'
            }
          </p>
        </div>

        {canWrite && (
          <button
            onClick={handleOpenCreateForm}
            className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-xs px-4 py-2.5 rounded-lg transition-all shadow-xs cursor-pointer select-none self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" /> 
            {activeSubTab === 'internal' ? 'Viết Bản Tin' : 'Viết Bài Viết'}
          </button>
        )}
      </div>

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2 pulse-active shadow-3xs animate-fade-in">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800 flex items-center gap-2 shadow-3xs">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Write/Edit Announcement Form. Type can be changed dynamically */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <motion.div 
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-xl flex flex-col bg-white border border-emerald-100 shadow-xl overflow-hidden"
          >
            <div className="flex items-center justify-between bg-emerald-50 px-5 py-3.5 border-b border-emerald-100/50">
              <span className="font-bold text-xs text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                {type === 'news' ? <Newspaper className="h-4 w-4 text-emerald-800" /> : <Megaphone className="h-4 w-4 text-emerald-800" />}
                {editingId 
                  ? (type === 'news' ? 'Chỉnh sửa bài viết tin tức' : 'Chỉnh sửa bản tin thông báo') 
                  : (type === 'news' ? 'Tạo bài viết tin tức mới' : 'Tạo thông báo nội bộ mới')
                }
              </span>
              <button onClick={() => setIsFormOpen(false)} className="rounded-full p-1 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              {/* Type Category selection */}
              {!forceType && (
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Mục đích phát hành</label>
                  <div className="flex gap-6 pt-1">
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="announcement-type"
                        checked={type === 'internal'}
                        onChange={() => setType('internal')}
                        className="h-4 w-4 accent-emerald-600 cursor-pointer"
                      />
                      📢 Thông báo nội bộ
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="announcement-type"
                        checked={type === 'news'}
                        onChange={() => setType('news')}
                        className="h-4 w-4 accent-emerald-600 cursor-pointer"
                      />
                      📰 Tin tức - Bài viết
                    </label>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Tiêu đề bài đăng</label>
                <input
                  type="text"
                  required
                  placeholder={type === 'news' ? "Ví dụ: Lịch sử hình thành tấn pháp Vịnh Xuân dòng Nam Anh" : "Ví dụ: Thông báo nghỉ lễ Quốc Khánh mùng 2 tháng 9"}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2.5 px-3 text-xs font-semibold focus:border-emerald-500 focus:outline-none focus:bg-white transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Nội dung chi tiết</label>
                <textarea
                  required
                  rows={6}
                  placeholder={
                    type === 'news' 
                    ? "Nhập nội dung bài luận truyền bá võ thuật, kỹ năng chiến đấu, rèn luyện tấn pháp..."
                    : "Nhập chi tiết nội dung thông báo, thời gian, quy chuẩn áp dụng..."
                  }
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-3 text-xs focus:border-emerald-500 focus:outline-none focus:bg-white transition"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-1.5">
                <input
                  type="checkbox"
                  id="pin-check"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="h-4 w-4 accent-emerald-600 rounded cursor-pointer"
                />
                <label htmlFor="pin-check" className="text-xs font-bold text-gray-600 select-none cursor-pointer flex items-center gap-1.5">
                  <Pin className="h-3.5 w-3.5 text-emerald-600" /> Ghim bài đăng lên đầu bảng mục này
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 mt-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer select-none"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer shadow-sm shadow-emerald-200 select-none"
                >
                  Lưu & Phát hành
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {targetAnnId && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-emerald-50/70 border border-emerald-100 px-5 py-4 rounded-xl shadow-3xs text-emerald-950">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold leading-normal">Bạn đang xem một bài viết/tin tức duy nhất qua liên kết trực tiếp</span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onSelectAnnouncement) {
                onSelectAnnouncement(null);
              }
            }}
            className="flex items-center gap-1 text-emerald-700 hover:text-emerald-950 underline hover:no-underline font-extrabold text-xs cursor-pointer select-none py-0.5"
          >
            ← Xem tất cả bài viết & thông báo
          </button>
        </div>
      )}

      {/* Stream list container */}
      <div className="space-y-3.5">
        {sortedAnnouncements.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-12 text-center shadow-3xs">
            {activeSubTab === 'news' ? (
              <Newspaper className="h-8 w-8 text-emerald-400 mx-auto opacity-70 animate-pulse" />
            ) : (
              <Megaphone className="h-8 w-8 text-emerald-400 mx-auto opacity-70 animate-pulse" />
            )}
            <p className="text-sm font-bold text-gray-700 mt-3">Mục {activeSubTab === 'news' ? 'Tin tức - Bài viết' : 'Thông báo nội bộ'} trống rỗng.</p>
            <p className="text-xs text-gray-400 mt-1">Hãy đăng bài đăng đầu tiên để ban truyền bá võ học võ quán hoạt động.</p>
          </div>
        ) : (
          sortedAnnouncements.map((ann) => (
            <div
              key={ann.announcementId}
              id={`ann-card-${ann.announcementId}`}
              className={`rounded-xl border border-gray-100 bg-white p-5 shadow-3xs relative overflow-hidden transition-all duration-300 hover:border-emerald-200 hover:shadow-xs 
                ${ann.pinned ? 'border-l-4 border-l-emerald-500 bg-emerald-50/5' : ''} 
                ${ann.announcementId === targetAnnId ? 'ring-2 ring-emerald-500 bg-emerald-50/20 scale-[1.01] shadow-md border-emerald-300/40' : ''}`}
            >
              {ann.pinned && (
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wide">
                  <Pin className="h-3 w-3 shrink-0" />
                  Ghim Tin Đầu
                </div>
              )}

              <div className="flex flex-col gap-1.5 pr-20 md:pr-24">
                <h3 
                  onClick={() => toggleExpandAnn(ann.announcementId)}
                  className="text-sm font-extrabold text-gray-900 leading-snug cursor-pointer hover:text-emerald-700 transition-colors"
                  title="Bấm để xem chi tiết & lấy đường dẫn"
                >
                  {ann.title}
                </h3>
                
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

              {/* Body Content */}
              <div className="mt-3.5 text-xs text-gray-650 leading-relaxed whitespace-pre-line">
                {(() => {
                  const bodyText = ann.content || '';
                  const isExpanded = !!expandedAnnIds[ann.announcementId];
                  const limit = 250;
                  if (bodyText.length <= limit) {
                    return bodyText;
                  }
                  if (isExpanded) {
                    return (
                      <div>
                        {bodyText}
                        <button
                          type="button"
                          onClick={() => toggleExpandAnn(ann.announcementId)}
                          className="mt-1.5 font-bold text-emerald-700 hover:text-emerald-950 inline-block cursor-pointer bg-transparent border-none p-0 focus:outline-none focus:ring-0"
                        >
                          Thu gọn ↑
                        </button>
                      </div>
                    );
                  } else {
                    return (
                      <div>
                        {bodyText.substring(0, limit)}...
                        <button
                          type="button"
                          onClick={() => toggleExpandAnn(ann.announcementId)}
                          className="mt-1.5 font-bold text-emerald-700 hover:text-emerald-950 inline-block cursor-pointer bg-transparent border-none p-0 focus:outline-none focus:ring-0"
                        >
                          Xem thêm ↓
                        </button>
                      </div>
                    );
                  }
                })()}
              </div>

              {/* Action and sharing footer controls */}
              <div className="flex items-center justify-between border-t border-gray-100/50 pt-3 mt-4 text-[11px] select-none">
                <button
                  type="button"
                  onClick={() => handleCopyLink(ann)}
                  className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-800 font-bold cursor-pointer transition-colors py-0.5"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  {copiedId === ann.announcementId ? 'Đã sao chép!' : 'Sao chép liên kết'}
                </button>

                {canWrite && (
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handleTogglePin(ann)}
                      className="flex items-center gap-1 text-gray-400 hover:text-emerald-700 font-bold cursor-pointer"
                    >
                      {ann.pinned ? 'Bỏ ghim' : 'Ghim'}
                    </button>
                    <span className="text-gray-200">|</span>
                    <button
                      onClick={() => handleEditClick(ann)}
                      className="flex items-center gap-1 text-gray-400 hover:text-amber-700 font-bold cursor-pointer"
                    >
                      Sửa
                    </button>
                    <span className="text-gray-200">|</span>
                    <button
                      onClick={() => handleDelete(ann.announcementId)}
                      className="flex items-center gap-1 text-gray-400 hover:text-rose-700 font-bold cursor-pointer"
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
