/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, Info, Users, Shield, CheckCircle, Trash2, Edit3, UserPlus, XCircle, LogIn, Database, CloudLightning, Copy, Check, Download, Upload, HelpCircle, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { AppConfig, User, UserRole, Student, TuitionPayment, BankTransfer, Announcement } from '../types';

interface ConfigSettingsProps {
  config: AppConfig;
  users: User[];
  userRole: UserRole;
  onUpdateConfig: (updated: Partial<AppConfig>) => void;
  onSwitchUser: (username: string) => void;
  currentUser: string;
  onUpdateUsers: (updatedUsers: User[]) => void;
  students: Student[];
  payments: TuitionPayment[];
  bankTransfers: BankTransfer[];
  announcements: Announcement[];
  onSyncImport: (data: {
    students?: Student[];
    payments?: TuitionPayment[];
    bankTransfers?: BankTransfer[];
    users?: User[];
    announcements?: Announcement[];
  }) => void;
}

export default function ConfigSettings({
  config,
  users,
  userRole,
  onUpdateConfig,
  onSwitchUser,
  currentUser,
  onUpdateUsers,
  students,
  payments,
  bankTransfers,
  announcements,
  onSyncImport
}: ConfigSettingsProps) {
  const [centerName, setCenterName] = useState(config.centerName);
  const [address, setAddress] = useState(config.address);
  const [phone, setPhone] = useState(config.phone);
  const [receiptPrefix, setReceiptPrefix] = useState(config.receiptPrefix);
  const [defaultTuitionFee, setDefaultTuitionFee] = useState(String(config.defaultTuitionFee));
  const [academicYear, setAcademicYear] = useState(String(config.academicYear));
  
  const [googleScriptsUrl, setGoogleScriptsUrl] = useState(config.googleScriptsUrl || '');
  const [googleScriptsId, setGoogleScriptsId] = useState(config.googleScriptsId || '');

  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

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
      academicYear: year,
      googleScriptsUrl,
      googleScriptsId
    });

    setSuccess('Đã cập nhật cấu hình võ quán thành công trên toàn hệ thống!');
    setTimeout(() => setSuccess(''), 4000);
  };

  const API_CODE = `// GOOGLE APPS SCRIPT DATABASE ENDPOINT
// Copy toàn bộ mã này dán vào và triển khai dạng Web App trên Google Sheets của bạn.

function doGet(e) {
  var action = e.parameter.action;
  if (action === "fetch") {
    try {
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        data: {
          users: readSheetData("Users"),
          students: readSheetData("Students"),
          tuitionPayments: readSheetData("TuitionPayments"),
          bankTransfers: readSheetData("BankTransfers"),
          announcements: readSheetData("Announcements")
        }
      })).setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Yêu cầu không hợp lệ" })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var payload = JSON.parse(rawData);
    var action = payload.action;
    
    if (action === "push") {
      var data = payload.data;
      if (data.users) writeSheetData("Users", data.users);
      if (data.students) writeSheetData("Students", data.students);
      if (data.tuitionPayments) writeSheetData("TuitionPayments", data.tuitionPayments);
      if (data.bankTransfers) writeSheetData("BankTransfers", data.bankTransfers);
      if (data.announcements) writeSheetData("Announcements", data.announcements);
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Đã đồng bộ dữ liệu thành công lên Google Sheets!"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Hành động không xác định" })).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function readSheetData(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error("Không tìm thấy Bảng tính liên kết. Tìm thấy null khi gọi getActiveSpreadsheet(). Điều này xảy ra nếu bạn tạo Apps Script Độc lập thay vì tạo từ menu 'Tiện ích mở rộng > Apps Script' bên trong chính file Google Sheets của bạn. Vui lòng bấm nút mở Trang tính trước rồi mới nhấn tạo Apps Script.");
  }
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  var headers = rows[0];
  var data = [];
  for (var i = 1; i < rows.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var cellVal = rows[i][j];
      if (cellVal instanceof Date) {
        cellVal = cellVal.toISOString().substring(0, 10);
      }
      obj[headers[j]] = cellVal;
    }
    data.push(obj);
  }
  return data;
}

function writeSheetData(sheetName, list) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error("Không tìm thấy Bảng tính liên kết. Tìm thấy null khi gọi getActiveSpreadsheet(). Điều này xảy ra nếu bạn tạo Apps Script Độc lập thay vì tạo từ menu 'Tiện ích mở rộng > Apps Script' bên trong chính file Google Sheets của bạn. Vui lòng bấm nút mở Trang tính trước rồi mới nhấn tạo Apps Script.");
  }
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  } else {
    sheet.clear();
  }
  if (!list || list.length === 0) return;

  var headersMap = {
    "Users": ["username", "fullName", "role", "isActive", "password"],
    "Students": ["studentId", "fullName", "nickname", "dateOfBirth", "gender", "parentName", "parentPhone", "phone", "address", "email", "classId", "tuitionFee", "discount", "note", "activeStatus", "enrollmentDate", "createdAt", "updatedAt"],
    "TuitionPayments": ["paymentId", "studentId", "classId", "month", "year", "amount", "paidStatus", "paidDate", "collectedBy", "receiptNo", "note", "createdAt", "updatedAt"],
    "BankTransfers": ["transferId", "studentId", "month", "year", "transferDate", "amount", "note", "createdBy", "createdAt"],
    "Announcements": ["announcementId", "type", "title", "content", "createdBy", "createdAt", "updatedAt", "pinned"]
  };

  var headers = headersMap[sheetName];
  if (!headers) {
    var keysSet = {};
    for (var i = 0; i < list.length; i++) {
      var keys = Object.keys(list[i]);
      for (var k = 0; k < keys.length; k++) {
        keysSet[keys[k]] = true;
      }
    }
    headers = Object.keys(keysSet);
  }

  sheet.appendRow(headers);
  var values = [];
  for (var i = 0; i < list.length; i++) {
    var row = [];
    for (var j = 0; j < headers.length; j++) {
      var val = list[i][headers[j]];
      if (val === undefined || val === null) {
        row.push("");
      } else {
        row.push(val);
      }
    }
    values.push(row);
  }
  sheet.getRange(2, 1, values.length, headers.length).setValues(values);
}`;

  const handleUpdateScriptsUrlAndId = (input: string) => {
    const value = input.trim();
    if (!value) {
      setGoogleScriptsUrl('');
      setGoogleScriptsId('');
      return;
    }
    if (value.startsWith('https://')) {
      setGoogleScriptsUrl(value);
      const match = value.match(/\/macros\/s\/([^\/]+)/);
      if (match && match[1]) {
        setGoogleScriptsId(match[1]);
      }
    } else {
      setGoogleScriptsId(value);
      setGoogleScriptsUrl(`https://script.google.com/macros/s/${value}/exec`);
    }
  };

  const handleSyncTest = async () => {
    if (!googleScriptsUrl) {
      setSyncStatus('error');
      setSyncMessage('Vui lòng cấu hình URL hoặc ID ứng dụng Web Google Apps Script trước!');
      return;
    }
    setSyncStatus('loading');
    setSyncMessage('Đang kết nối thử nghiệm đến Google Apps Script...');
    try {
      if (googleScriptsUrl.includes('/edit') || googleScriptsUrl.includes('/home/projects')) {
        throw new Error('Bạn đang dán nhầm liên kết trang chỉnh sửa Code Apps Script (đuôi /edit hoặc /home/projects) thay vì địa chỉ Web App thực thi (/exec). Vui lòng triển khai lại dạng Web App và sao chép đúng URL kết thúc bằng "/exec".');
      }

      const resp = await fetch(`${googleScriptsUrl}?action=fetch`, { method: 'GET', redirect: 'follow' });
      if (!resp.ok) {
        throw new Error(`Phản hồi mạng lỗi HTTP ${resp.status}`);
      }

      let result;
      try {
        result = await resp.json();
      } catch (jsonErr) {
        throw new Error('Dữ liệu phản hồi thu được là trang HTML/văn bản thay vì JSON. Nguyên nhân cao nhất là bạn CHƯA đồng ý cấp quyền truy cập tài khoản Google Sheets của mình (Authorize Access) trên Apps Script, hoặc chưa nhấn lưu và Triển khai dạng Web App.');
      }

      if (result.status === 'success') {
        setSyncStatus('success');
        setSyncMessage('Kết nối thành công! Đã kết nối thông suốt với Google Sheets.');
      } else {
        setSyncStatus('error');
        setSyncMessage(`Nhận kết quả lỗi từ Script: ${result.message || 'Hành động thất bại'}`);
      }
    } catch (e: any) {
      setSyncStatus('error');
      let customMsg = e.message || '';
      if (e.message && (e.message.includes('fetch') || e.message.includes('Failed to fetch') || e.message.includes('TypeError'))) {
        customMsg = 'Lỗi kết nối mạng hoặc CORS. Thường gặp khi bạn cấu hình quyền truy cập (Who has access) của Web App là "Only myself" (Chỉ mình tôi). Hãy đổi lại cấu hình triển khai thành "Anyone" (Bất kỳ ai / Bất kỳ ai, cả người ẩn danh) và thử lại.';
      }
      setSyncMessage(`Không thể kết nối. Chi tiết: ${customMsg}`);
    }
  };

  const handleSyncPull = async () => {
    if (!googleScriptsUrl) {
      setSyncStatus('error');
      setSyncMessage('Vui lòng cấu hình URL hoặc ID ứng dụng Web Google Apps Script!');
      return;
    }
    if (!window.confirm('Cảnh báo! Nhập dữ liệu từ Google Sheets sẽ thay thế danh sách Võ Sinh, Hóa Đơn, Chuyển Khoản hiện có trên trình duyệt của bạn. Bạn có muốn tiếp tục?')) {
      return;
    }
    setSyncStatus('loading');
    setSyncMessage('Đang tải dữ liệu từ Google Sheets về máy...');
    try {
      if (googleScriptsUrl.includes('/edit') || googleScriptsUrl.includes('/home/projects')) {
        throw new Error('Bạn đang dán nhầm liên kết trang chỉnh sửa Code Apps Script (đuôi /edit) thay vì URL Web App thực thi (/exec). Vui lòng triển khai lại dạng Web App và cấu hình đúng địa điểm.');
      }

      const resp = await fetch(`${googleScriptsUrl}?action=fetch`, { method: 'GET', redirect: 'follow' });
      if (!resp.ok) {
        throw new Error(`Phản hồi mạng lỗi HTTP ${resp.status}`);
      }

      let result;
      try {
        result = await resp.json();
      } catch (jsonErr) {
        throw new Error('Dữ liệu thu được không phải định dạng JSON hợp lệ (có thể là trang HTML lỗi hoặc trang login của Google). Hãy chắc chắn rằng bạn đã bấm cấp quyền "Authorize Access" khi chạy thử Script và Chọn mục "Anyone" (Bất kỳ ai) ở mục quyển truy cập.');
      }

      if (result.status === 'success' && result.data) {
        const d = result.data;
        
        const parsedStudents: Student[] = (d.students || []).map((s: any) => ({
          studentId: String(s.studentId || '').replace(/^STUD-/, 'VS-'),
          fullName: String(s.fullName || ''),
          nickname: s.nickname ? String(s.nickname) : undefined,
          dateOfBirth: String(s.dateOfBirth || ''),
          gender: s.gender === 'Female' || s.gender === 'Nữ' ? 'Female' : 'Male',
          parentName: String(s.parentName || ''),
          parentPhone: String(s.parentPhone || ''),
          phone: s.phone ? String(s.phone) : undefined,
          address: String(s.address || ''),
          email: String(s.email || ''),
          classId: s.classId ? String(s.classId) : undefined,
          tuitionFee: parseFloat(s.tuitionFee) || 0,
          discount: parseFloat(s.discount) || 0,
          note: String(s.note || ''),
          activeStatus: s.activeStatus === 'Inactive' ? 'Inactive' : s.activeStatus === 'Archived' ? 'Archived' : 'Active',
          enrollmentDate: String(s.enrollmentDate || ''),
          createdAt: String(s.createdAt || new Date().toISOString()),
          updatedAt: String(s.updatedAt || new Date().toISOString())
        }));

        const parsedPayments: TuitionPayment[] = (d.tuitionPayments || d.payments || []).map((p: any) => ({
          paymentId: String(p.paymentId || ''),
          studentId: String(p.studentId || '').replace(/^STUD-/, 'VS-'),
          classId: p.classId ? String(p.classId) : undefined,
          month: parseInt(p.month) || new Date().getMonth() + 1,
          year: parseInt(p.year) || new Date().getFullYear(),
          amount: parseFloat(p.amount) || 0,
          paidStatus: p.paidStatus === 'Unpaid' ? 'Unpaid' : p.paidStatus === 'Exempted' ? 'Exempted' : 'Paid',
          paidDate: p.paidDate ? String(p.paidDate) : undefined,
          collectedBy: p.collectedBy ? String(p.collectedBy) : undefined,
          receiptNo: String(p.receiptNo || ''),
          note: String(p.note || ''),
          createdAt: String(p.createdAt || new Date().toISOString()),
          updatedAt: String(p.updatedAt || new Date().toISOString())
        }));

        const parsedTransfers: BankTransfer[] = (d.bankTransfers || []).map((b: any) => ({
          transferId: String(b.transferId || ''),
          studentId: b.studentId ? String(b.studentId).replace(/^STUD-/, 'VS-') : undefined,
          month: parseInt(b.month) || new Date().getMonth() + 1,
          year: parseInt(b.year) || new Date().getFullYear(),
          transferDate: String(b.transferDate || ''),
          amount: parseFloat(b.amount) || 0,
          note: String(b.note || ''),
          createdBy: String(b.createdBy || ''),
          createdAt: String(b.createdAt || new Date().toISOString())
        }));

        const parsedUsers: User[] = (d.users || []).map((u: any) => {
          let role = u.role as UserRole;
          if (role === 'SUPPER_ADMIN') {
            role = 'SUPER_ADMIN';
          }
          return {
            username: String(u.username || ''),
            fullName: String(u.fullName || ''),
            role: role,
            isActive: String(u.isActive).toUpperCase() === 'TRUE' || u.isActive === true || u.isActive === 1,
            password: u.password ? String(u.password) : undefined
          };
        });

        const parsedAnnouncements: Announcement[] = (d.announcements || []).map((a: any) => ({
          announcementId: String(a.announcementId || ''),
          type: (a.type === 'news' || a.type === 'internal') ? a.type : 'internal',
          title: String(a.title || ''),
          content: String(a.content || ''),
          createdBy: String(a.createdBy || ''),
          createdAt: String(a.createdAt || new Date().toISOString()),
          updatedAt: String(a.updatedAt || new Date().toISOString()),
          pinned: String(a.pinned).toUpperCase() === 'TRUE' || a.pinned === true
        }));

        onSyncImport({
          students: parsedStudents,
          payments: parsedPayments,
          bankTransfers: parsedTransfers,
          users: parsedUsers.length > 0 ? parsedUsers : undefined,
          announcements: parsedAnnouncements.length > 0 ? parsedAnnouncements : undefined
        });

        setSyncStatus('success');
        setSyncMessage(`Đồng bộ TẢI VỀ hoàn tất! Đã cập nhật thành công ${parsedStudents.length} Võ sinh, ${parsedPayments.length} Hóa đơn, ${parsedTransfers.length} Giao dịch chuyển khoản thương ngân về máy.`);
      } else {
        setSyncStatus('error');
        setSyncMessage(`Lỗi tải dữ liệu: ${result.message || 'Cấu trúc phản hồi không hợp lệ'}`);
      }
    } catch (e: any) {
      setSyncStatus('error');
      let customMsg = e.message || '';
      if (e.message && (e.message.includes('fetch') || e.message.includes('Failed to fetch') || e.message.includes('TypeError'))) {
        customMsg = 'Lỗi kết nối mạng hoặc CORS. Thường xảy ra khi quyền truy cập Web App chưa chọn là "Anyone" (Bất kỳ ai), hoặc dùng nhầm link trang chỉnh sửa code /edit.';
      }
      setSyncMessage(`Lỗi trong lúc kết nối lấy dữ liệu: ${customMsg}`);
    }
  };

  const handleBackupDownload = async () => {
    setSyncStatus('loading');
    setSyncMessage('Đang kết nối để tải dữ liệu sao lưu (backup)...');
    try {
      let backupData: any = null;
      let pulledFromSheets = false;

      if (googleScriptsUrl) {
        try {
          if (!googleScriptsUrl.includes('/edit') && !googleScriptsUrl.includes('/home/projects')) {
            const resp = await fetch(`${googleScriptsUrl}?action=fetch`, { method: 'GET', redirect: 'follow' });
            if (resp.ok) {
              const result = await resp.json();
              if (result.status === 'success' && result.data) {
                backupData = result.data;
                pulledFromSheets = true;
              }
            }
          }
        } catch (err) {
          console.warn("Could not fetch remote sheet for backup, falling back to local data", err);
        }
      }

      if (!backupData) {
        // Fallback to current memory data
        backupData = {
          users,
          students,
          tuitionPayments: payments,
          bankTransfers,
          announcements
        };
      }

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const cleanCenterName = (config.centerName || 'Nam_Anh_Quang').replace(/[^a-zA-Z0-9]/g, '_');
      const dateStr = new Date().toISOString().substring(0, 10).replace(/-/g, '_');
      const timeStr = new Date().toTimeString().substring(0, 8).replace(/:/g, '');
      link.href = url;
      link.download = `backup_csdl_${cleanCenterName}_${dateStr}_${timeStr}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSyncStatus('success');
      setSyncMessage(
        `Đã xuất file sao lưu thành công tải về máy! ` +
        (pulledFromSheets 
          ? `Tải trọn vẹn dữ liệu từ Google Sheets làm bản sao lưu.` 
          : `Đã sao lưu tệp dữ liệu hoạt động tạm trên máy của bạn (Offline JSON Backup).`)
      );
    } catch (e: any) {
      setSyncStatus('error');
      setSyncMessage(`Lỗi trong lúc xuất tệp cấu trúc sao lưu: ${e.message}`);
    }
  };

  const handleSyncPush = async () => {
    if (!googleScriptsUrl) {
      setSyncStatus('error');
      setSyncMessage('Vui lòng cấu hình URL hoặc ID ứng dụng Web Google Apps Script!');
      return;
    }
    if (!window.confirm('Bạn có chắc chắn muốn xuất đẩy toàn bộ dữ liệu thiết bị hiện tại đè lên bảng dữ liệu Google Sheets của bạn không?')) {
      return;
    }
    setSyncStatus('loading');
    setSyncMessage('Đang truyền đẩy và ghi đè dữ liệu lên Google Sheets...');
    try {
      const payload = {
        action: 'push',
        data: {
          users,
          students,
          tuitionPayments: payments,
          bankTransfers,
          announcements
        }
      };

      const resp = await fetch(googleScriptsUrl, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        redirect: 'follow'
      });
      if (!resp.ok) {
        throw new Error(`Phản hồi mạng trả về mã lỗi HTTP ${resp.status}`);
      }

      let result;
      try {
        result = await resp.json();
      } catch (jsonErr) {
        throw new Error('Dữ liệu trả về bị lỗi phân tích JSON (nhận được trang HTML). Vui lòng đảm bảo bạn đã cấp quyền chạy Script truy cập Sheets đầy đủ.');
      }

      if (result.status === 'success') {
        setSyncStatus('success');
        setSyncMessage('Đồng bộ tải lên (PUSH) thành công rực rỡ! Bảng dữ liệu của bạn trên Google Sheets đã được cập nhật đồng bộ hoàn toàn.');
      } else {
        setSyncStatus('error');
        setSyncMessage(`Lỗi phản hồi từ máy chủ: ${result.message || 'Thất bại'}`);
      }
    } catch (e: any) {
      setSyncStatus('error');
      let customMsg = e.message || '';
      if (e.message && (e.message.includes('fetch') || e.message.includes('Failed to fetch') || e.message.includes('TypeError'))) {
        customMsg = 'Lỗi kết nối mạng hoặc CORS. Thường xảy ra khi cấu hình quyền truy cập (Who has access) của Web App chưa chọn là "Anyone" (Bất kỳ ai / Bất kỳ ai, cả người ẩn danh).';
      }
      setSyncMessage(`Lỗi đồng bộ đẩy dữ liệu: ${customMsg}`);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(API_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
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

    if (usernameToDelete === 'superadmin' || usernameToDelete === 'thuyethn') {
      setUserActionError('Tài khoản quản trị tối cao (superadmin/thuyethn) bắt buộc phải tồn tại!');
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

      <div className="space-y-4 max-w-5xl mx-auto">
          
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

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                    <CloudLightning className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Ứng dụng Web Google Apps Script (URL hoặc ID)</span>
                  </label>
                  <input
                    type="text"
                    disabled={!canEditConfig}
                    value={googleScriptsUrl || googleScriptsId}
                    onChange={(e) => handleUpdateScriptsUrlAndId(e.target.value)}
                    placeholder="Dán ID Web App (vd: AKfycb...) hoặc URL hoàn chỉnh (macros/s/.../exec)"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2 px-3 text-xs font-mono font-bold focus:border-emerald-500 focus:outline-none disabled:opacity-60"
                  />
                  <p className="text-[9.5px] text-gray-400 mt-1 leading-snug">
                    Liên kết hạch toán cơ sở dữ liệu Google Sheets của bạn. Hệ thống sẽ tự động ghép ID vào URL gọi API chuẩn.
                  </p>
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

          {/* =============================================================
              MODULE: GOOGLE SHEETS CLOUD SYNCHRONIZATION PANEL
              ============================================================= */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-xs font-sans">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-1.5 text-gray-800 font-bold text-xs uppercase">
                <Database className="h-4 w-4 text-emerald-600" />
                <span>🔌 Đồng Bộ Cơ sở dữ liệu Google Sheets Cloud</span>
              </div>
              <button
                type="button"
                onClick={() => setShowInstructions(!showInstructions)}
                className="flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1 rounded-lg transition"
              >
                <HelpCircle className="h-3.5 w-3.5" /> 
                {showInstructions ? 'Ẩn hướng dẫn cài đặt' : 'Mở hướng dẫn cấu hình'}
              </button>
            </div>

            {/* Config warning if no url */}
            {!config.googleScriptsUrl && (
              <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 text-xs text-amber-800 flex items-start gap-2 mb-4">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Chưa cấu hình Google Apps Script!</p>
                  <p className="mt-0.5">Vui lòng điền mã ID hoặc URL ứng dụng Web Apps Script vào biểu mẫu "Thông tin chi nhánh" phía trên và nhấn lưu cấu hình trước khi thực hiện đồng bộ.</p>
                </div>
              </div>
            )}

            {/* Status Banner */}
            {syncStatus !== 'idle' && (
              <div className={`rounded-lg border p-3.5 text-xs font-semibold flex items-start gap-2 mb-4 ${
                syncStatus === 'loading' ? 'bg-indigo-50 border-indigo-100 text-indigo-950' :
                syncStatus === 'success' ? 'bg-emerald-50 border-emerald-150 text-emerald-900' :
                'bg-rose-50 border-rose-150 text-rose-900'
              }`}>
                {syncStatus === 'loading' ? (
                  <RefreshCw className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5 animate-spin" />
                ) : syncStatus === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-bold uppercase tracking-wider text-[10px]">
                    {syncStatus === 'loading' ? '⏳ Hệ thống đang xử lý...' :
                     syncStatus === 'success' ? '✨ Thành công!' : '❌ Lỗi kết nối'}
                  </p>
                  <p className="mt-1 leading-relaxed font-medium">{syncMessage}</p>
                </div>
              </div>
            )}

            {/* Collapsible Apps Script Instructions */}
            {showInstructions && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-150 mb-5 space-y-4 text-xs text-gray-700">
                <h3 className="font-bold text-gray-950 text-sm border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
                  Hướng dẫn cấu hình kết nối Google Sheets làm Data Center:
                </h3>
                <ol className="list-decimal pl-4 space-y-2 leading-relaxed font-medium">
                  <li>Mở bảng tính Google Sheets của bạn. Đảm bảo bạn có các sheet theo hướng dẫn của hệ thống (<b>Users</b>, <b>Students</b>, <b>TuitionPayments</b>, <b>BankTransfers</b>, <b>Announcements</b>).</li>
                  <li>Nhấp vào <b>Tiện ích mở rộng (Extensions)</b> ở menu trên cùng &gt; chọn <b>Apps Script</b>.</li>
                  <li>Xóa tất cả mã hiện tại trong trình biên tập Apps Script, sau đó <b>dán mã Javascript ở ô dưới đây</b> vào.</li>
                  <li>Click nút <b>Lưu (Save icon / Cmd+S)</b>.</li>
                  <li>Nhấn nút <b>Triển khai (Deploy)</b> ở góc trên bên phải &gt; Chọn <b>Triển khai mới (New deployment)</b>.</li>
                  <li>Nhấn vào bánh răng cấu hình cạnh chữ Select type &gt; Chọn <b>Ứng dụng web (Web app)</b>.</li>
                  <li>Điền Mô tả bất kỳ, ở ô <b>Quyền truy cập (Who has access)</b>, chọn bắt buộc là: <b>Bất kỳ ai (Anyone)</b>. Nhấn <b>Triển khai (Deploy)</b>.</li>
                  <li>Bấm nút <b>Cấp quyền truy cập (Authorize access)</b>, chọn tài khoản Gmail của bạn, click <b>Advanced</b> &gt; chọn <b>Go to Untitled project (unsafe)</b> và bấm <b>Allow</b> để đồng ý cấp quyền.</li>
                  <li>Sao chép <b>URL Ứng dụng web</b> hoặc <b>ID triển khai</b> (đoạn mã AKfycb... dài dặc) và dán nó vào biểu mẫu "Thông tin chi nhánh" phía trên rồi nhấn <b>Lưu</b>.</li>
                </ol>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-slate-800">
                    <span className="font-bold text-[10.5px] uppercase tracking-wider">Mã nguồn Google Apps Script:</span>
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="flex items-center gap-1 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded transition"
                    >
                      {copiedCode ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedCode ? 'Đã sao chép!' : 'Sao chếpmã'}
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-950 text-[#10b981] font-mono text-[10.5px] rounded-lg max-h-60 overflow-y-auto overflow-x-auto select-all leading-relaxed whitespace-pre font-medium border border-slate-800 shadow-inner">
                    {API_CODE}
                  </pre>
                </div>
              </div>
            )}

            {/* Database Metrics Dashboard */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
              <div className="bg-gray-50/65 border border-gray-150 rounded-xl p-3 text-center">
                <span className="text-[10px] font-extrabold tracking-wider text-gray-400 uppercase">Võ sinh</span>
                <p className="text-xl font-extrabold text-[#0f766e] mt-1">{students.length}</p>
                <p className="text-[9px] text-gray-400 font-semibold mt-0.5">Hồ sơ tập luyện</p>
              </div>
              <div className="bg-gray-50/65 border border-gray-150 rounded-xl p-3 text-center">
                <span className="text-[10px] font-extrabold tracking-wider text-gray-400 uppercase">Hóa đơn thu</span>
                <p className="text-xl font-extrabold text-[#0f766e] mt-1">{payments.length}</p>
                <p className="text-[9px] text-gray-400 font-semibold mt-0.5">Biên lai ghi nhận</p>
              </div>
              <div className="bg-gray-50/65 border border-gray-150 rounded-xl p-3 text-center">
                <span className="text-[10px] font-extrabold tracking-wider text-gray-400 uppercase">Giao dịch bank</span>
                <p className="text-xl font-extrabold text-[#0f766e] mt-1">{bankTransfers.length}</p>
                <p className="text-[9px] text-gray-400 font-semibold mt-0.5">Chuyển khoản quỹ</p>
              </div>
              <div className="bg-gray-50/65 border border-gray-150 rounded-xl p-3 text-center">
                <span className="text-[10px] font-extrabold tracking-wider text-gray-400 uppercase">Tài khoản</span>
                <p className="text-xl font-extrabold text-[#0f766e] mt-1">{users.length}</p>
                <p className="text-[9px] text-gray-400 font-semibold mt-0.5">Người hạch toán</p>
              </div>
              <div className="bg-gray-50/65 border border-gray-150 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
                <span className="text-[10px] font-extrabold tracking-wider text-gray-400 uppercase">Thông báo</span>
                <p className="text-xl font-extrabold text-[#0f766e] mt-1">{announcements.length}</p>
                <p className="text-[9px] text-gray-400 font-semibold mt-0.5">Bản tin thông đạt</p>
              </div>
            </div>

            {/* Sync trigger actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={handleBackupDownload}
                disabled={syncStatus === 'loading'}
                className="flex items-center justify-center gap-1.5 font-bold text-sky-850 bg-sky-50 hover:bg-sky-100 disabled:opacity-50 border border-sky-200 px-4 py-2 rounded-lg transition cursor-pointer"
              >
                <Database className="h-4 w-4 text-sky-600" />
                💾 Sao lưu CSDL (BACKUP)
              </button>

              <button
                type="button"
                onClick={handleSyncTest}
                className="flex items-center justify-center gap-1.5 font-bold text-gray-650 hover:text-gray-900 border border-gray-250 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg transition cursor-pointer"
              >
                <CloudLightning className="h-4 w-4 text-amber-500" />
                Kiểm tra kết nối
              </button>

              <button
                type="button"
                onClick={handleSyncPull}
                disabled={!config.googleScriptsUrl || syncStatus === 'loading'}
                className="flex items-center justify-center gap-1.5 font-bold text-teal-800 bg-[#ccfbf1] hover:bg-[#99f6e4] disabled:opacity-50 border border-[#99f6e4] px-4 py-2 rounded-lg transition cursor-pointer"
              >
                <Download className="h-4 w-4 text-teal-700" />
                📥 Tải dữ liệu về máy (PULL)
              </button>

              <button
                type="button"
                onClick={handleSyncPush}
                disabled={!config.googleScriptsUrl || syncStatus === 'loading' || userRole !== 'SUPER_ADMIN'}
                className="flex items-center justify-center gap-1.5 font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-4 py-2 rounded-lg transition cursor-pointer shadow-sm shadow-emerald-250"
              >
                <Upload className="h-4 w-4 text-white" />
                📤 Đẩy dữ liệu lên Cloud (PUSH)
              </button>
            </div>

            {userRole !== 'SUPER_ADMIN' && (
              <p className="text-[10.5px] text-gray-400 text-right mt-2 italic">
                * Chỉ có vai trò <b>SUPER_ADMIN</b> mới được quyền Đẩy dữ liệu ghi đè lên Google Sheets (PUSH). Các vai trò khác vẫn được phép Tải dữ liệu về máy (PULL) để tra cứu.
              </p>
            )}
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
                      disabled={newUsername === 'superadmin' || newUsername === 'thuyethn'}
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
                      const isSystemPrimary = u.username === 'superadmin' || u.username === 'thuyethn';
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
      </div>
    );
  }
