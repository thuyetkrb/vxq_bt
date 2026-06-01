/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  CreditCard,
  CircleDollarSign,
  Megaphone,
  Newspaper,
  History,
  Settings,
  Menu,
  Landmark,
  X,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserCheck,
  Download,
  Lock,
  CalendarDays,
  CheckCircle,
  XCircle,
  Check,
  Printer,
  AlertTriangle,
  UserMinus,
  FileSpreadsheet,
  Building,
  Edit,
  NotebookTabs,
  Trash2,
  LockKeyhole,
  Phone,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import {
  Class,
  Student,
  TuitionPayment,
  TeacherTransfer,
  Announcement,
  AuditLog,
  Baseline,
  AppConfig,
  User,
  UserRole,
  BankTransfer
} from './types';

import {
  MOCK_USERS,
  INITIAL_CONFIG,
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  INITIAL_PAYMENTS,
  INITIAL_TRANSFERS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_BASELINES,
  INITIAL_BANK_TRANSFERS
} from './initialData';

import { formatVND, exportToCSV, getMonthName, buildFilename } from './utils';

const getMonthRange = (currentM: number, currentY: number, beforeCount: number, afterCount: number) => {
  const range = [];
  
  // Calculate months before
  for (let i = beforeCount; i >= 1; i--) {
    let m = currentM - i;
    let y = currentY;
    while (m <= 0) {
      m += 12;
      y -= 1;
    }
    range.push({ month: m, year: y });
  }
  
  // Current month
  range.push({ month: currentM, year: currentY });
  
  // Calculate months after
  for (let i = 1; i <= afterCount; i++) {
    let m = currentM + i;
    let y = currentY;
    while (m > 12) {
      m -= 12;
      y += 1;
    }
    range.push({ month: m, year: y });
  }
  
  return range;
};

// Import our modular components
import ReceiptModal from './components/ReceiptModal';
import AnnouncementSection from './components/AnnouncementSection';
import ConfigSettings from './components/ConfigSettings';
import BankTransferView from './components/BankTransferView';

export default function App() {
  // Mobile Navigation Drawer Toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Active Sidebar Tab Tracker
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'students' | 'tuition' | 'news' | 'announcements' | 'config' | 'bank_transfers'
  >('dashboard');

  // Accounts list state with Local Storage persistence
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('vxq_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.some((u: any) => u.username === 'superadmin' && u.fullName === 'thuyethn')) {
          localStorage.setItem('vxq_users', JSON.stringify(MOCK_USERS));
          return MOCK_USERS;
        }
        return parsed;
      } catch (e) {
        console.error('Error hydrating vxq_users', e);
      }
    }
    localStorage.setItem('vxq_users', JSON.stringify(MOCK_USERS));
    return MOCK_USERS;
  });

  // Multi-user & Login state simulator with Credentials Persistence
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('vxq_remembered_auth') !== null;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('vxq_remembered_auth');
    const savedUsersStr = localStorage.getItem('vxq_users');
    let list: User[] = MOCK_USERS;
    if (savedUsersStr) {
      try {
        list = JSON.parse(savedUsersStr);
      } catch (e) {
        console.error('Error parsing vxq_users in currentUser initialization', e);
      }
    }
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const match = list.find(u => u.username === parsed.username);
        const correctPassword = match ? (match.password || match.username) : '';
        if (match && parsed.password === correctPassword && match.isActive) {
          return match;
        }
      } catch (e) {
        console.error('Error parsing stored login credentials', e);
      }
    }
    return list.find(u => u.username === 'viewer') || list[3] || MOCK_USERS[3]; // Fallback to 'viewer' by default if not logged in
  });

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');

  // Calendar Period (Accounting month and year)
  const [currentMonth, setCurrentMonth] = useState<number>(5); // May
  const [currentYear, setCurrentYear] = useState<number>(2026);

  // States fetched/stored in Local Storage
  const [classes, setClasses] = useState<Class[]>(() => INITIAL_CLASSES);
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<TuitionPayment[]>([]);
  const [transfers, setTransfers] = useState<TeacherTransfer[]>([]);
  const [bankTransfers, setBankTransfers] = useState<BankTransfer[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [config, setConfig] = useState<AppConfig>(INITIAL_CONFIG);

  // Database connectivity health states
  const [dbHealth, setDbHealth] = useState<'checking' | 'connected' | 'error' | 'noconfig'>('checking');
  const [dbErrorMsg, setDbErrorMsg] = useState<string>('');

  // CRUD & Search Helper states
  const [searchClass, setSearchClass] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const [dashboardSearch, setDashboardSearch] = useState('');
  const [monthsBefore, setMonthsBefore] = useState<number>(2);
  const [monthsAfter, setMonthsAfter] = useState<number>(2);
  const [statusFilterStudent, setStatusFilterStudent] = useState<string>('Active');
  const [classFilterStudent, setClassFilterStudent] = useState<string>('ALL');

  // Form Modals Toggles
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payingStudentId, setPayingStudentId] = useState<string | null>(null);
  const [isFreeExempt, setIsFreeExempt] = useState(false);
  const [paidAmountVal, setPaidAmountVal] = useState<string | number>('');

  useEffect(() => {
    if (isPayModalOpen && payingStudentId) {
      if (isFreeExempt) {
        setPaidAmountVal(0);
      } else {
        const match = students.find(s => s.studentId === payingStudentId);
        if (match) {
          setPaidAmountVal(match.tuitionFee);
        }
      }
    }
  }, [isPayModalOpen, payingStudentId, isFreeExempt, students]);

  // Active Receipt Modal visualization
  const [activeReceiptPayment, setActiveReceiptPayment] = useState<TuitionPayment | null>(null);
  const [receiptStudent, setReceiptStudent] = useState<Student | null>(null);

  // Local Storage synchronizer & hydration
  useEffect(() => {
    // Hydro students
    const lcStudents = localStorage.getItem('mec_students');
    let useInitialStudents = false;
    if (lcStudents) {
      try {
        const parsed = JSON.parse(lcStudents);
        if (parsed.some((s: any) => s.studentId && s.studentId.startsWith('STUD-'))) {
          useInitialStudents = true;
        } else {
          setStudents(parsed);
        }
      } catch (e) {
        useInitialStudents = true;
      }
    } else {
      useInitialStudents = true;
    }

    if (useInitialStudents) {
      setStudents(INITIAL_STUDENTS);
      localStorage.setItem('mec_students', JSON.stringify(INITIAL_STUDENTS));
      setPayments(INITIAL_PAYMENTS);
      localStorage.setItem('mec_payments', JSON.stringify(INITIAL_PAYMENTS));
      setBankTransfers(INITIAL_BANK_TRANSFERS);
      localStorage.setItem('mec_bank_transfers', JSON.stringify(INITIAL_BANK_TRANSFERS));
    } else {
      // Hydro payments
      const lcPayments = localStorage.getItem('mec_payments');
      if (lcPayments) {
        try {
          setPayments(JSON.parse(lcPayments));
        } catch (e) {
          setPayments(INITIAL_PAYMENTS);
        }
      } else {
        setPayments(INITIAL_PAYMENTS);
        localStorage.setItem('mec_payments', JSON.stringify(INITIAL_PAYMENTS));
      }

      // Hydro bank transfers
      const lcBankTransfers = localStorage.getItem('mec_bank_transfers');
      if (lcBankTransfers) {
        try {
          setBankTransfers(JSON.parse(lcBankTransfers));
        } catch (e) {
          setBankTransfers(INITIAL_BANK_TRANSFERS);
        }
      } else {
        setBankTransfers(INITIAL_BANK_TRANSFERS);
        localStorage.setItem('mec_bank_transfers', JSON.stringify(INITIAL_BANK_TRANSFERS));
      }
    }

    // Hydro transfers
    const lcTransfers = localStorage.getItem('mec_transfers');
    if (lcTransfers) {
      try {
        setTransfers(JSON.parse(lcTransfers));
      } catch (e) {
        setTransfers(INITIAL_TRANSFERS);
      }
    } else {
      setTransfers(INITIAL_TRANSFERS);
      localStorage.setItem('mec_transfers', JSON.stringify(INITIAL_TRANSFERS));
    }

    // Hydro announcements
    const lcAnns = localStorage.getItem('mec_announcements');
    if (lcAnns) {
      try {
        setAnnouncements(JSON.parse(lcAnns));
      } catch (e) {
        setAnnouncements(INITIAL_ANNOUNCEMENTS);
      }
    } else {
      setAnnouncements(INITIAL_ANNOUNCEMENTS);
      localStorage.setItem('mec_announcements', JSON.stringify(INITIAL_ANNOUNCEMENTS));
    }

    // Hydro configs
    const lcConfig = localStorage.getItem('mec_config');
    if (lcConfig) {
      try {
        let parsed = JSON.parse(lcConfig);
        // Migrate old English center data to Vịnh Xuân Quyền - Nam Anh Quang
        let needsSave = false;
        if (
          !parsed.centerName ||
          parsed.centerName.includes('Minh Đức') || 
          parsed.centerName.includes('MEC') || 
          parsed.address?.includes('Đường Láng') || 
          parsed.phone === '0987.654.321' ||
          parsed.centerName.includes('Bình Tân (Nam Anh Quang)')
        ) {
          parsed = {
            ...parsed,
            centerName: 'Vịnh Xuân Quyền - Nam Anh Quang',
            address: 'Khu Mua Sắm Anh Hào, 666 Đường Số 1, Bình Hưng Hòa B, Bình Tân, TP.HCM',
            phone: '0938 372 286',
            receiptPrefix: 'VXQ'
          };
          needsSave = true;
        }

        // Migrate to newly deployed Google Scripts macro
        if (
          !parsed.googleScriptsUrl || 
          parsed.googleScriptsId === 'AKfycbzAvMiTSvOInEbHkjwrnD_lrHVDjXqHm4ai5IhGNYaRorfsh8Rhl-cbMGqLz3QQLB-G_Q' ||
          parsed.googleScriptsUrl.includes('AKfycbzAvMiTSvOInEbHkjwrnD_lrHVDjXqHm4ai5IhGNYaRorfsh8Rhl-cbMGqLz3QQLB-G_Q') ||
          parsed.googleScriptsId === 'AKfycbxBmxCrsH_0_9Bg2ibX7m7iBF4hlK7q7-yavRP4ZWtLoIU3f_AaqJrdTQnZeuV71-JVAQ' ||
          parsed.googleScriptsUrl.includes('AKfycbxBmxCrsH_0_9Bg2ibX7m7iBF4hlK7q7-yavRP4ZWtLoIU3f_AaqJrdTQnZeuV71-JVAQ')
        ) {
          parsed = {
            ...parsed,
            googleScriptsUrl: 'https://script.google.com/macros/s/AKfycbwm8Kbjky4oFi3F6Xo9iMF3kFjYka_Oht02gUBq1TeAE-7oM2rMvzPW3oJXObFa5_4B7A/exec',
            googleScriptsId: 'AKfycbwm8Kbjky4oFi3F6Xo9iMF3kFjYka_Oht02gUBq1TeAE-7oM2rMvzPW3oJXObFa5_4B7A'
          };
          needsSave = true;
        }

        if (needsSave) {
          localStorage.setItem('mec_config', JSON.stringify(parsed));
        }
        setConfig(parsed);
      } catch (e) {
        setConfig(INITIAL_CONFIG);
        localStorage.setItem('mec_config', JSON.stringify(INITIAL_CONFIG));
      }
    } else {
      setConfig(INITIAL_CONFIG);
      localStorage.setItem('mec_config', JSON.stringify(INITIAL_CONFIG));
    }
  }, []);

  // Sync helpers to keep local storage up to scratch
  const updateLocalStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Perform background connection verify test with the configured Google Apps Script Web App Google DB link
  useEffect(() => {
    if (!config.googleScriptsUrl) {
      setDbHealth('noconfig');
      return;
    }

    let isMounted = true;
    setDbHealth('checking');

    const checkGoogleDb = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout trigger

        const resp = await fetch(`${config.googleScriptsUrl}?action=fetch`, {
          method: 'GET',
          redirect: 'follow',
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!resp.ok) {
          throw new Error(`Phản hồi mạng lỗi HTTP ${resp.status}`);
        }

        let resData;
        try {
          resData = await resp.json();
        } catch (jsonErr) {
          throw new Error('Lỗi cú pháp phản hồi (JSON parse error). Script đang trả về trang HTML/văn bản thay vì dữ liệu JSON. Thường là do bạn chưa cấp quyền "Authorize Access" khi chạy thử Script hoặc chưa đồng ý phân quyền kết nối tài khoản Google Sheets của mình.');
        }

        if (resData.status === 'success') {
          if (isMounted) {
            setDbHealth('connected');
            setDbErrorMsg('');
          }
        } else {
          throw new Error(resData.message || 'Script báo lỗi phản hồi');
        }
      } catch (err: any) {
        if (isMounted) {
          setDbHealth('error');
          let customMsg = err.message || '';
          if (err.name === 'AbortError') {
            customMsg = 'Thời gian kết nối quá hạn (Hơn 8 giây). Script của bạn không phản hồi hoặc URL cấu hình bị sai.';
          } else if (err.message && (err.message.includes('fetch') || err.message.includes('NetworkError') || err.message.includes('Failed to fetch'))) {
            customMsg = 'Lỗi mạng hoặc chặn CORS. Hãy chắc chắn rằng bạn đã: 1) Chọn cấu hình quyền truy cập (Who has access) của Web App là "Anyone" (Bất kỳ ai), KHÔNG chọn "Only myself"; 2) ID/URL Web App triển khai chính xác dạng kết thúc bằng "/exec", không phải liên kết trang chỉnh sửa "/edit".';
          }
          setDbErrorMsg(customMsg || 'Không thể kết nối hoặc thiết lập phân quyền "Anyone" chưa đúng.');
        }
      }
    };

    checkGoogleDb();

    // Recheck again after 5 minutes to ensure connection is steady
    const intervalId = setInterval(checkGoogleDb, 300000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [config.googleScriptsUrl]);

  // Redirect protection for unauthorized or non-admin users
  useEffect(() => {
    if (!isLoggedIn) {
      if (activeTab !== 'dashboard' && activeTab !== 'news') {
        setActiveTab('dashboard');
      }
    } else {
      const isAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN';
      if (!isAdmin && (activeTab === 'config' || activeTab === 'bank_transfers')) {
        setActiveTab('dashboard');
      }
    }
  }, [isLoggedIn, activeTab, currentUser]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const matchedUser = users.find(u => u.username === loginUsername.trim().toLowerCase());
    
    const correctPassword = matchedUser ? (matchedUser.password || matchedUser.username) : '';
    if (matchedUser && loginPassword === correctPassword) {
      if (!matchedUser.isActive) {
        setLoginError('Tài khoản này hiện đang bị khóa!');
        return;
      }
      setCurrentUser(matchedUser);
      setIsLoggedIn(true);
      
      if (rememberMe) {
        localStorage.setItem('vxq_remembered_auth', JSON.stringify({
          username: matchedUser.username,
          password: loginPassword,
        }));
      } else {
        localStorage.removeItem('vxq_remembered_auth');
      }
      
      appendAuditLog('AUTH', matchedUser.username, 'LOGIN', '', `Đăng nhập thành công thành ${matchedUser.fullName}`);
    } else {
      setLoginError('Vui lòng kiểm tra lại tài khoản và mật khẩu!');
    }
  };

  const handleLogout = () => {
    const prevUsername = currentUser.username;
    const prevFullName = currentUser.fullName;
    
    setIsLoggedIn(false);
    const viewerFallback = users.find(u => u.username === 'viewer') || MOCK_USERS[3];
    setCurrentUser(viewerFallback); // reset to viewer fallback
    setLoginUsername('');
    setLoginPassword('');
    localStorage.removeItem('vxq_remembered_auth');
    setActiveTab('dashboard');
    
    appendAuditLog('AUTH', prevUsername, 'LOGOUT', `Cựu: ${prevFullName}`, 'Đăng xuất thành công ra khỏi hệ thống');
  };

  // Helper: Log audit trail to the system
  const appendAuditLog = (type: any, id: string, action: any, oldValue: string, newValue: string) => {
    // Audit logs disabled per user request
  };

  // -------------------------------------------------------------
  // AUTOMATED BILLING GENERATOR (Requirement 11)
  // Whenever the Month/Year changes or a Student/Payment is hydrated,
  // we check if an active student doesn't have a TuitionPayment slot
  // for the selected Month/Year. If not, we automatically initialize
  // it as UNPAID with their customized discounted tuition fee.
  // -------------------------------------------------------------
  useEffect(() => {
    if (students.length === 0) return;

    let hasCreatedAnyBill = false;
    const freshPayments = [...payments];

    students.forEach(std => {
      // Only bill Active students
      if (std.activeStatus !== 'Active') return;

      const hasBill = freshPayments.some(
        pay => pay.studentId === std.studentId && pay.month === currentMonth && pay.year === currentYear
      );

      if (!hasBill) {
        hasCreatedAnyBill = true;
        const autoPayment: TuitionPayment = {
          paymentId: `PAY-${String(currentYear).substring(2)}${String(currentMonth).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`,
          studentId: std.studentId,
          classId: std.classId,
          month: currentMonth,
          year: currentYear,
          amount: std.tuitionFee, // using student specific fee reflecting custom discount
          paidStatus: 'Unpaid',
          receiptNo: '',
          note: 'Học phí tự dựng hàng tháng',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        freshPayments.push(autoPayment);
      }
    });

    if (hasCreatedAnyBill) {
      setPayments(freshPayments);
      updateLocalStorage('mec_payments', freshPayments);
    }
  }, [students, payments, currentMonth, currentYear]);

  // Is current hạch toán period baseline locked?
  const isPeriodLocked = false;

  // Month navigation buttons handler
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // -------------------------------------------------------------
  // CLASS ACTIONS
  // -------------------------------------------------------------
  const handleSaveClass = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentUser.role === 'VIEWER') {
      alert('Tài khoản của bạn chỉ có quyền Đọc (VIEWER), không thể khởi phát thao tác này!');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const classNameVal = formData.get('className') as string;
    const teacherNameVal = formData.get('teacherName') as string;
    const scheduleVal = formData.get('schedule') as string;
    const roomVal = formData.get('room') as string;
    const tuitionVal = parseFloat(formData.get('tuitionDefault') as string) || config.defaultTuitionFee;
    const noteVal = formData.get('note') as string;
    const statusVal = formData.get('activeStatus') as Class['activeStatus'];

    if (editingClass) {
      // Edit class
      const oldValSummary = JSON.stringify(editingClass);
      const updatedClasses = classes.map(c => 
        c.classId === editingClass.classId 
          ? { 
              ...c, 
              className: classNameVal, 
              teacherName: teacherNameVal, 
              schedule: scheduleVal, 
              room: roomVal, 
              tuitionDefault: tuitionVal, 
              note: noteVal, 
              activeStatus: statusVal, 
              updatedAt: new Date().toISOString() 
            }
          : c
      );
      setClasses(updatedClasses);
      updateLocalStorage('mec_classes', updatedClasses);
      
      const updatedObj = updatedClasses.find(c => c.classId === editingClass.classId)!;
      appendAuditLog('CLASS', editingClass.classId, 'UPDATE', oldValSummary, JSON.stringify(updatedObj));
    } else {
      // Add Class
      const newId = `CLASS-${String(classes.length + 1).padStart(2, '0')}`;
      const freshClass: Class = {
        classId: newId,
        className: classNameVal,
        teacherName: teacherNameVal,
        schedule: scheduleVal,
        room: roomVal,
        tuitionDefault: tuitionVal,
        note: noteVal,
        activeStatus: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updated = [...classes, freshClass];
      setClasses(updated);
      updateLocalStorage('mec_classes', updated);
      appendAuditLog('CLASS', newId, 'CREATE', '', JSON.stringify(freshClass));
    }

    setIsClassModalOpen(false);
    setEditingClass(null);
  };

  const handleArchiveClass = (clazz: Class) => {
    if (currentUser.role === 'VIEWER') return;
    const oldSum = JSON.stringify(clazz);
    const updated = classes.map(c => 
      c.classId === clazz.classId 
        ? { ...c, activeStatus: 'Archived' as const, updatedAt: new Date().toISOString() } 
        : c
    );
    setClasses(updated);
    updateLocalStorage('mec_classes', updated);
    appendAuditLog('CLASS', clazz.classId, 'UPDATE', oldSum, 'Trạng thái: ARCHIVED (Soft delete)');
  };

  // -------------------------------------------------------------
  // STUDENT ACTIONS
  // -------------------------------------------------------------
  const handleSaveStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentUser.role === 'VIEWER') return;

    const formData = new FormData(e.currentTarget);
    const fullNameVal = formData.get('fullName') as string;
    const nicknameVal = formData.get('nickname') as string;
    const dobVal = formData.get('dateOfBirth') as string;
    const genderVal = formData.get('gender') as Student['gender'];
    const phoneVal = (formData.get('phone') as string) || '';
    const parentNameVal = formData.get('parentName') as string;
    const parentPhoneVal = formData.get('parentPhone') as string;
    const addressVal = formData.get('address') as string;
    const emailVal = formData.get('email') as string;
    const classIdVal = classes[0]?.classId || 'CLASS-01';
    const tuitionFeeVal = parseFloat(formData.get('tuitionFee') as string) || config.defaultTuitionFee;
    const discountVal = 0;
    const noteVal = formData.get('note') as string;
    const statusVal = formData.get('activeStatus') as Student['activeStatus'];

    const actualFee = tuitionFeeVal;

    if (editingStudent) {
      // Edit student
      const oldValStr = JSON.stringify(editingStudent);
      const updated = students.map(s => 
        s.studentId === editingStudent.studentId
          ? {
              ...s,
              fullName: fullNameVal,
              nickname: nicknameVal,
              dateOfBirth: dobVal,
              gender: genderVal,
              phone: phoneVal,
              parentName: parentNameVal,
              parentPhone: parentPhoneVal,
              address: addressVal,
              email: emailVal,
              classId: classIdVal,
              tuitionFee: actualFee,
              discount: discountVal,
              note: noteVal,
              activeStatus: statusVal,
              updatedAt: new Date().toISOString()
            }
          : s
      );
      setStudents(updated);
      updateLocalStorage('mec_students', updated);
      
      const newObj = updated.find(s => s.studentId === editingStudent.studentId)!;
      appendAuditLog('STUDENT', editingStudent.studentId, 'UPDATE', oldValStr, JSON.stringify(newObj));
    } else {
      // Create student
      const newId = `STUD-${String(students.length + 1).padStart(3, '0')}`;
      const freshStud: Student = {
        studentId: newId,
        fullName: fullNameVal,
        nickname: nicknameVal,
        dateOfBirth: dobVal,
        gender: genderVal,
        phone: phoneVal,
        parentName: parentNameVal,
        parentPhone: parentPhoneVal,
        address: addressVal,
        email: emailVal,
        classId: classIdVal,
        tuitionFee: actualFee,
        discount: discountVal,
        note: noteVal,
        activeStatus: 'Active',
        enrollmentDate: new Date().toISOString().substring(0, 10),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updated = [...students, freshStud];
      setStudents(updated);
      updateLocalStorage('mec_students', updated);

      appendAuditLog('STUDENT', newId, 'CREATE', '', JSON.stringify(freshStud));
    }

    setIsStudentModalOpen(false);
    setEditingStudent(null);
  };

  const handleArchiveStudent = (stud: Student) => {
    if (currentUser.role === 'VIEWER') return;
    const oldSum = JSON.stringify(stud);
    const updated = students.map(s => 
      s.studentId === stud.studentId 
        ? { ...s, activeStatus: 'Archived' as const, updatedAt: new Date().toISOString() } 
        : s
    );
    setStudents(updated);
    updateLocalStorage('mec_students', updated);
    appendAuditLog('STUDENT', stud.studentId, 'UPDATE', oldSum, 'Trạng thái: ARCHIVED (Soft delete student)');
  };

  // -------------------------------------------------------------
  // TUITION / COLLECTION MODULE
  // -------------------------------------------------------------
  const handleMarkPaidSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentUser.role === 'VIEWER' || currentUser.role === 'STAFF') {
      alert('Tài khoản của bạn không được phân quyền thu học phí sỹ sớ!');
      return;
    }

    if (isPeriodLocked) {
      alert('Tháng này đã được KHÓA SỔ từ Điểm Neo Điểm Kế toán. Không thể cập nhật học phí đóng!');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const paidAmt = parseFloat(formData.get('paidAmount') as string) || 0;
    const paidDateVal = formData.get('paidDate') as string;
    const noteVal = formData.get('note') as string;
    const collectorVal = formData.get('collectedBy') as string;

    const matchStudent = students.find(s => s.studentId === payingStudentId)!;
    const oldBill = payments.find(p => p.studentId === payingStudentId && p.month === currentMonth && p.year === currentYear);
    const oldSum = oldBill ? JSON.stringify(oldBill) : '';

    const finalStatus = isFreeExempt ? 'Exempted' as const : 'Paid' as const;
    const finalAmt = isFreeExempt ? 0 : paidAmt;

    const sequence = payments.filter(p => p.month === currentMonth && p.year === currentYear && p.paidStatus !== 'Unpaid').length + 1;
    const receiptGenerated = isFreeExempt 
      ? `EX-${config.receiptPrefix}${String(currentYear).substring(2)}${String(currentMonth).padStart(2, '0')}${String(sequence).padStart(3, '0')}`
      : `${config.receiptPrefix}${String(currentYear).substring(2)}${String(currentMonth).padStart(2, '0')}${String(sequence).padStart(3, '0')}`;

    let updated;
    const existingIndex = payments.findIndex(p => p.studentId === payingStudentId && p.month === currentMonth && p.year === currentYear);
    if (existingIndex >= 0) {
      updated = payments.map(p => {
        if (p.studentId === payingStudentId && p.month === currentMonth && p.year === currentYear) {
          return {
            ...p,
            amount: finalAmt,
            paidStatus: finalStatus,
            paidDate: paidDateVal,
            collectedBy: collectorVal,
            receiptNo: receiptGenerated,
            note: noteVal,
            updatedAt: new Date().toISOString()
          };
        }
        return p;
      });
    } else {
      const newBill: TuitionPayment = {
        paymentId: `PAY-${String(currentYear).substring(2)}${String(currentMonth).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`,
        studentId: payingStudentId!,
        classId: matchStudent?.classId || 'CLASS-01',
        month: currentMonth,
        year: currentYear,
        amount: finalAmt,
        paidStatus: finalStatus,
        paidDate: paidDateVal,
        collectedBy: collectorVal,
        receiptNo: receiptGenerated,
        note: noteVal,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      updated = [...payments, newBill];
    }

    setPayments(updated);
    updateLocalStorage('mec_payments', updated);

    appendAuditLog(
      'TUITION', 
      payingStudentId || 'N/A', 
      'UPDATE', 
      oldSum, 
      isFreeExempt
        ? `Xác nhận Miễn học phí, Phiếu: ${receiptGenerated}, Lý do: ${noteVal}, Ghi bởi: ${collectorVal}`
        : `Xác nhận đóng Học phí: ${formatVND(finalAmt)}, Phiếu: ${receiptGenerated}, Thu bởi: ${collectorVal}`
    );

    // Auto-trigger visual receipt display immediately
    const foundPayment = updated.find(p => p.studentId === payingStudentId && p.month === currentMonth && p.year === currentYear)!;
    setReceiptStudent(matchStudent);
    setActiveReceiptPayment(foundPayment);

    setIsPayModalOpen(false);
    setPayingStudentId(null);
    setIsFreeExempt(false);
  };

  const handleMarkUnpaid = (pay: TuitionPayment) => {
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ADMIN') {
      alert('Bạn cần vai trò ADMIN hoặc ban quản trị tối cao để hủy xác nhận thanh toán này!');
      return;
    }

    if (isPeriodLocked) {
      alert('Tháng hạch toán đã bị KHÓA SỔ. Mở khóa từ mục Chốt số trước khi hủy phí!');
      return;
    }

    if (confirm('Bạn có hoàn tất hủy xác nhận đóng học phí này? Trạng thái sẽ trở về UNPAID.')) {
      const oldSum = JSON.stringify(pay);
      const updated = payments.map(p => 
        p.paymentId === pay.paymentId 
          ? { ...p, paidStatus: 'Unpaid' as const, receiptNo: '', paidDate: '', collectedBy: '', note: 'Đã hủy hoàn phí', updatedAt: new Date().toISOString() }
          : p
      );
      setPayments(updated);
      updateLocalStorage('mec_payments', updated);

      appendAuditLog('TUITION', pay.studentId, 'UPDATE', oldSum, 'Hủy xác nhận thu học phí - Quay lại UNPAID');
    }
  };

  // -------------------------------------------------------------
  // INTER-COMPONENT CHANNELS & STATE UPDATE INJECTORS
  // -------------------------------------------------------------
  const handleAddNewAnnouncement = (newAnn: Omit<Announcement, 'announcementId' | 'createdAt' | 'updatedAt'>) => {
    const freshId = `ANN-${Date.now().toString().substring(8)}`;
    const fullAnn: Announcement = {
      ...newAnn,
      announcementId: freshId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [fullAnn, ...announcements];
    setAnnouncements(updated);
    updateLocalStorage('mec_announcements', updated);

    appendAuditLog('ANNOUNCEMENT', freshId, 'CREATE', '', JSON.stringify(fullAnn));
  };

  const handleUpdateAnnouncement = (annId: string, updatedFields: Partial<Announcement>) => {
    const target = announcements.find(a => a.announcementId === annId);
    const oldSum = target ? JSON.stringify(target) : '';

    const updated = announcements.map(a => 
      a.announcementId === annId ? { ...a, ...updatedFields, updatedAt: new Date().toISOString() } : a
    );
    setAnnouncements(updated);
    updateLocalStorage('mec_announcements', updated);

    appendAuditLog('ANNOUNCEMENT', annId, 'UPDATE', oldSum, JSON.stringify(updatedFields));
  };

  const handleDeleteAnnouncement = (annId: string) => {
    const target = announcements.find(a => a.announcementId === annId);
    const oldSum = target ? JSON.stringify(target) : '';

    const updated = announcements.filter(a => a.announcementId !== annId);
    setAnnouncements(updated);
    updateLocalStorage('mec_announcements', updated);

    appendAuditLog('ANNOUNCEMENT', annId, 'DELETE', oldSum, 'Tháo gỡ tin thông báo');
  };

  const handleAddTransfer = (newTransfer: Omit<TeacherTransfer, 'transferId' | 'createdAt'>) => {
    const xferId = `XFER-${Date.now().toString().substring(8)}`;
    const fullXfer: TeacherTransfer = {
      ...newTransfer,
      transferId: xferId,
      createdAt: new Date().toISOString()
    };
    const updated = [fullXfer, ...transfers];
    setTransfers(updated);
    updateLocalStorage('mec_transfers', updated);

    appendAuditLog('TRANSFER', xferId, 'CREATE', '', JSON.stringify(fullXfer));
  };

  const handleAddBankTransfer = (newTransfer: Omit<BankTransfer, 'transferId' | 'createdAt'>) => {
    const trfId = `BT-${Date.now().toString().substring(8)}`;
    const fullTrf: BankTransfer = {
      ...newTransfer,
      transferId: trfId,
      createdAt: new Date().toISOString()
    };
    const updated = [fullTrf, ...bankTransfers];
    setBankTransfers(updated);
    updateLocalStorage('mec_bank_transfers', updated);

    appendAuditLog('TRANSFER', trfId, 'CREATE', '', `Ghi nhận chuyển khoản: ${newTransfer.amount}đ cho T.${newTransfer.month}/${newTransfer.year}`);
  };

  const handleUpdateBankTransfer = (updatedTrf: BankTransfer) => {
    const oldVal = JSON.stringify(bankTransfers.find(t => t.transferId === updatedTrf.transferId) || '');
    const updated = bankTransfers.map(t => t.transferId === updatedTrf.transferId ? updatedTrf : t);
    setBankTransfers(updated);
    updateLocalStorage('mec_bank_transfers', updated);

    appendAuditLog('TRANSFER', updatedTrf.transferId, 'UPDATE', oldVal, JSON.stringify(updatedTrf));
  };

  const handleDeleteBankTransfer = (trfId: string) => {
    const oldVal = JSON.stringify(bankTransfers.find(t => t.transferId === trfId) || '');
    const updated = bankTransfers.filter(t => t.transferId !== trfId);
    setBankTransfers(updated);
    updateLocalStorage('mec_bank_transfers', updated);

    appendAuditLog('TRANSFER', trfId, 'DELETE', oldVal, 'Xóa bản ghi nhận chuyển khoản khỏi sổ sách');
  };



  const handleUpdateConfig = (newCfg: Partial<AppConfig>) => {
    const oldSum = JSON.stringify(config);
    const updated = { ...config, ...newCfg };
    setConfig(updated);
    updateLocalStorage('mec_config', updated);

    appendAuditLog('CONFIGURATION', 'CENTER_CONFIG', 'UPDATE', oldSum, JSON.stringify(newCfg));
  };

  const handleSyncImport = (data: {
    students?: Student[];
    payments?: TuitionPayment[];
    bankTransfers?: BankTransfer[];
    users?: User[];
    announcements?: Announcement[];
  }) => {
    if (data.students) {
      setStudents(data.students);
      localStorage.setItem('mec_students', JSON.stringify(data.students));
    }
    if (data.payments) {
      setPayments(data.payments);
      localStorage.setItem('mec_payments', JSON.stringify(data.payments));
    }
    if (data.bankTransfers) {
      setBankTransfers(data.bankTransfers);
      localStorage.setItem('mec_bank_transfers', JSON.stringify(data.bankTransfers));
    }
    if (data.users) {
      setUsers(data.users);
      localStorage.setItem('vxq_users', JSON.stringify(data.users));
    }
    if (data.announcements) {
      setAnnouncements(data.announcements);
      localStorage.setItem('mec_announcements', JSON.stringify(data.announcements));
    }

    appendAuditLog('CONFIGURATION', 'GOOGLE_SHEETS_SYNC', 'UPDATE', 'Thao tác kéo dữ liệu từ mây (PULL)', 'Thành công đồng bộ dữ liệu từ Google Sheets');
  };

  const handleSwitchUser = (uname: string) => {
    const match = users.find(u => u.username === uname);
    if (match) {
      const prevName = currentUser.fullName;
      setCurrentUser(match);
      appendAuditLog('AUTH', match.username, 'LOGIN', `Cựu: ${prevName}`, `Thay đổi phiên chuyển đổi nội bộ thành ${match.fullName}`);
    }
  };

  const handleUpdateUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    localStorage.setItem('vxq_users', JSON.stringify(updatedUsers));
    
    // Auto-sync or log out if the current logged-in user changes
    const updatedSelf = updatedUsers.find(u => u.username === currentUser.username);
    if (updatedSelf) {
      if (!updatedSelf.isActive) {
        handleLogout();
      } else {
        setCurrentUser(updatedSelf);
      }
    }
  };

  // -------------------------------------------------------------
  // EXPORTS
  // -------------------------------------------------------------
  const handleExportStudents = () => {
    const dataToExport = students.filter(s => {
      const matchSearch = s.fullName.toLowerCase().includes(searchStudent.toLowerCase()) || 
                          s.parentPhone.includes(searchStudent) || 
                          (s.phone && s.phone.includes(searchStudent));
      const matchStatus = s.activeStatus === statusFilterStudent;
      return matchSearch && matchStatus;
    }).map(s => {
      return {
        'Mã định danh': s.studentId,
        'Họ và tên': s.fullName,
        'Gọi tên': s.nickname || '',
        'SĐT học viên': s.phone || '',
        'Tên phụ huynh': s.parentName,
        'SĐT Phụ huynh': s.parentPhone,
        'Địa chỉ': s.address,
        'Học phí mỗi tháng': s.tuitionFee,
        'Ngày ghi danh': s.enrollmentDate,
        'Trạng thái': s.activeStatus
      };
    });

    exportToCSV(
      dataToExport,
      ['Mã định danh', 'Họ và tên', 'Gọi tên', 'SĐT học viên', 'Tên phụ huynh', 'SĐT Phụ huynh', 'Địa chỉ', 'Học phí mỗi tháng', 'Ngày ghi danh', 'Trạng thái'],
      buildFilename('danh_sach_hoc_sinh', 'csv')
    );
    appendAuditLog('EXPORT', 'STUDENTS', 'EXPORT', '', 'Xuất danh sách học viên chọn lọc ra tập tin CSV thành công.');
  };

  const handleExportTuitionReport = () => {
    const reportList = payments.filter(p => p.month === currentMonth && p.year === currentYear).map(p => {
      const std = students.find(s => s.studentId === p.studentId);
      return {
        'Mã Phiếu': p.paymentId,
        'Học sinh': std?.fullName || 'Ẩn danh',
        'Thời kỳ': `${getMonthName(p.month)}/${p.year}`,
        'Khoản thực thu': p.amount,
        'Trạng thái thu': p.paidStatus === 'Paid' ? 'ĐÃ ĐÓNG' : 'CHƯA ĐÓNG',
        'Số Biên Lai': p.receiptNo,
        'Ngày thu': p.paidDate || '',
        'Người thu': p.collectedBy || '',
        'Mô tả': p.note
      };
    });

    exportToCSV(
      reportList,
      ['Mã Phiếu', 'Học sinh', 'Thời kỳ', 'Khoản thực thu', 'Trạng thái thu', 'Số Biên Lai', 'Ngày thu', 'Người thu', 'Mô tả'],
      buildFilename('bao_cao_hoc_phi', 'csv', currentMonth, currentYear)
    );
    appendAuditLog('EXPORT', 'TUITION', 'EXPORT', '', `Xuất báo cáo biên lai thanh toán tháng ${currentMonth}/${currentYear}`);
  };

  // -------------------------------------------------------------
  // ANALYTICAL METRICS
  // -------------------------------------------------------------
  const allCurrentPayments = payments.filter(p => p.month === currentMonth && p.year === currentYear);
  const paidCurrentCount = allCurrentPayments.filter(p => p.paidStatus === 'Paid').length;
  const unpaidCurrentCount = allCurrentPayments.filter(p => p.paidStatus === 'Unpaid').length;

  const currentCollectedAmountSum = allCurrentPayments.filter(p => p.paidStatus === 'Paid').reduce((sum, p) => sum + p.amount, 0);
  const currentUnpaidAmountSum = allCurrentPayments.filter(p => p.paidStatus === 'Unpaid').reduce((sum, p) => sum + p.amount, 0);

  // Bank transfer metrics
  const currentBankTransferSum = bankTransfers.filter(t => t.month === currentMonth && t.year === currentYear).reduce((sum, t) => sum + t.amount, 0);
  const currentMonthTotalTuition = currentCollectedAmountSum + currentUnpaidAmountSum;
  const currentMonthRemaining = currentMonthTotalTuition - currentBankTransferSum;

  const currentTransferredTotal = transfers.filter(t => t.month === currentMonth && t.year === currentYear).reduce((sum, t) => sum + t.transferAmount, 0);
  const currentRemainingQuo = currentCollectedAmountSum - currentTransferredTotal;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-emerald-50/45 text-emerald-950 font-sans">
      
      {/* ----------------- MOBILE TOPBAR ----------------- */}
      <header className="md:hidden flex items-center justify-between border-b border-emerald-100 bg-emerald-50 px-4 py-3 sticky top-0 z-40 no-print">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-emerald-600 text-white">
            <Building className="h-4.5 w-4.5" />
          </span>
          <span className="font-bold text-xs tracking-tight text-emerald-950 uppercase">VXQ_PORTAL</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1 rounded bg-white border border-emerald-100 text-emerald-900"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* ----------------- SIDEBAR ----------------- */}
      {/* Sidebar Overlay and Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#d1fae5] transform transition-transform duration-300 md:translate-x-0 md:static md:flex md:flex-col shrink-0 no-print
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Banner */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-emerald-50/60 bg-emerald-50/10">
          <span className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold shadow-xs">
            <GraduationCap className="h-5 w-5 text-white" />
          </span>
          <div>
            <span className="font-display font-extrabold text-emerald-950 tracking-tight text-base block">VXQ BÌNH TÂN</span>
            <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest font-mono leading-none block mt-1">Võ Quán Nam Anh Quang</span>
          </div>
        </div>

        {/* Sidebar Tabs Links */}
        <nav className="flex-1 px-4 py-4 space-y-1 block">
          {[
            { id: 'dashboard', label: 'Tổng Quan', icon: LayoutDashboard },
            ...(isLoggedIn ? [
              { id: 'tuition', label: 'Quản Lý Học Phí', icon: CreditCard },
              { id: 'students', label: 'DS Võ Sinh', icon: Users }
            ] : []),
            { id: 'news', label: 'Tin Tức - Bài Viết', icon: Newspaper },
            ...(isLoggedIn ? [
              { id: 'announcements', label: 'Bản Tin Nội Bộ', icon: Megaphone }
            ] : []),
            ...(isLoggedIn && (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN') ? [
              { id: 'bank_transfers', label: 'Chuyển Khoản', icon: Landmark },
              { id: 'config', label: 'Cấu Hình', icon: Settings }
            ] : [])
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setIsMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-2 text-left text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer rounded-lg
                  ${isActive 
                    ? 'bg-emerald-500 text-white shadow-sm font-bold' 
                    : 'text-emerald-700 hover:bg-emerald-50 hover:text-emerald-950'
                  }
                `}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-emerald-500/80'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer info containing active User card */}
        <div className="p-4 border-t border-emerald-50 bg-emerald-50/20">
          <div className="flex items-center gap-3 p-2 bg-emerald-50 rounded-xl border border-emerald-100/50">
            <div className="w-9 h-9 rounded-full bg-emerald-200 border-2 border-white overflow-hidden shrink-0 flex items-center justify-center font-bold text-emerald-700 font-display text-sm">
              {currentUser.fullName ? currentUser.fullName.split(' ').pop()?.substring(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-extrabold text-emerald-900 truncate leading-tight">{currentUser.fullName}</p>
              <p className="text-[9px] text-emerald-600 uppercase tracking-widest font-bold leading-none mt-1">{currentUser.role}</p>
            </div>
          </div>
          <div className="text-center text-[9px] text-emerald-400 font-bold uppercase tracking-widest mt-3 border-t border-emerald-50/60 pt-3.5">
             {config.centerName}
          </div>
        </div>
      </aside>

      {/* Behind mask for mobile drawer */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)} 
          className="fixed inset-0 z-30 bg-black/45 md:hidden no-print"
        ></div>
      )}

      {/* ----------------- CORE MAIN PANEL ----------------- */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* TOP SYSTEM HEADBAND PANEL */}
        <header className="bg-white border-b border-[#d1fae5] px-6 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sticky top-0 z-10 shadow-xs no-print">
          
          {/* Calendar Accounting indicator */}
          <div className="flex items-center gap-3">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
              <CalendarDays className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-widest leading-none">Kỳ hạch toán hiện tại</p>
              <div className="flex items-center gap-2 mt-1">
                <button 
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-full hover:bg-emerald-50 transition-colors cursor-pointer text-emerald-700"
                  title="Tháng trước"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="font-extrabold text-xs text-[#064e3b] uppercase tracking-wide font-display">Tháng {currentMonth} / {currentYear}</span>
                <button 
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-full hover:bg-emerald-50 transition-colors cursor-pointer text-emerald-700"
                  title="Tháng sau"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Active user selection & Signout indicator */}
          <div className="flex items-center gap-3.5 self-end sm:self-auto select-none no-print">
            {/* Live Database Connectivity indicator badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-100/60 bg-white text-emerald-950 text-[10px] font-semibold shadow-3xs cursor-pointer select-none" title="Trạng thái kết nối Google Sheets" onClick={() => setActiveTab('config')}>
              {dbHealth === 'checking' && (
                <>
                  <span className="flex h-1.5 w-1.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                  </span>
                  <span className="text-gray-500 font-medium">Đang kiểm tra DB...</span>
                </>
              )}
              {dbHealth === 'connected' && (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-emerald-800">Google Sheets: Đã kết nối</span>
                </>
              )}
              {dbHealth === 'error' && (
                <>
                  <span className="flex h-1.5 w-1.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-600"></span>
                  </span>
                  <span className="text-rose-700">Google Sheets: Lỗi kết nối</span>
                </>
              )}
              {dbHealth === 'noconfig' && (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                  <span className="text-gray-500 font-medium font-mono text-[9px]">Chưa cấu hình Google DB</span>
                </>
              )}
            </div>

            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                {/* User credentials fast indicator switcher */}
                <div className="flex items-center gap-1 border border-emerald-100 bg-white rounded-lg p-1 shadow-2xs">
                  <span className="p-1 rounded bg-emerald-50 text-emerald-700">
                    <UserCheck className="h-3.5 w-3.5" />
                  </span>
                  <div className="text-left px-1.5 py-0.5">
                    <p className="text-[11px] font-extrabold text-emerald-950 leading-3">{currentUser.fullName}</p>
                    <span className="text-[9px] text-[#059669] font-bold font-mono uppercase">
                      {currentUser.role === 'SUPER_ADMIN' ? 'Ban Giám Sát' : currentUser.role === 'ADMIN' ? 'Quản Trị Viên' : currentUser.role === 'STAFF' ? 'Nhân Viên' : 'Người Xem'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-100 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs shadow-3xs hover:shadow-2xs transition-all cursor-pointer"
                  title="Đăng xuất khỏi hệ thống"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Đăng xuất</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-end gap-1">
                <form onSubmit={handleLoginSubmit} className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    placeholder="Tài khoản"
                    value={loginUsername}
                    onChange={(e) => { setLoginUsername(e.target.value); setLoginError(''); }}
                    required
                    className="w-24 sm:w-28 bg-gray-50 border border-emerald-100/70 p-1 py-1 text-xs rounded-lg font-bold text-emerald-950 focus:outline-none focus:border-emerald-500 placeholder:text-gray-400 placeholder:font-normal"
                  />
                  <input
                    type="password"
                    placeholder="Mật khẩu"
                    value={loginPassword}
                    onChange={(e) => { setLoginPassword(e.target.value); setLoginError(''); }}
                    required
                    className="w-24 sm:w-28 bg-gray-50 border border-emerald-100/70 p-1 py-1 text-xs rounded-lg font-bold text-emerald-950 focus:outline-none focus:border-emerald-500 placeholder:text-gray-400 placeholder:font-normal"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-3 w-3 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 animate-none cursor-pointer"
                    />
                    <label htmlFor="rememberMe" className="text-[10px] text-gray-500 font-bold whitespace-nowrap cursor-pointer">
                      Ghi nhớ
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1 rounded-lg border border-emerald-600 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                  >
                    Đăng nhập
                  </button>
                </form>
                {loginError ? (
                  <span className="text-[10px] text-rose-600 font-bold bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded leading-none">{loginError}</span>
                ) : (
                  <span className="text-[8.5px] text-emerald-700/80 font-bold leading-none mr-2">
                    💡 Thử đăng nhập: <strong className="font-extrabold underline text-emerald-900">staff</strong> / <strong className="font-extrabold underline text-emerald-900">admin</strong> / <strong className="font-extrabold underline text-emerald-900">superadmin</strong> (Mật khẩu giống tài khoản)
                  </span>
                )}
              </div>
            )}
          </div>
        </header>

        {/* ----------------- CORE VIEWS MAIN SPACE ----------------- */}
        <section className="flex-1 p-5 md:p-6 select-none bg-emerald-50/10 animate-fade-in">
          
          {/* Dynamic Google Database Error notification banner */}
          {dbHealth === 'error' && (
            <div className="mb-5 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in no-print">
              <div className="flex items-start gap-3">
                <span className="p-2 rounded-lg bg-rose-100 text-rose-700 shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="font-extrabold text-xs tracking-tight uppercase text-rose-950">
                    LỖI KẾT NỐI DATABASE GOOGLE SHEETS
                  </h4>
                  <p className="text-[11px] text-rose-700/90 leading-relaxed font-semibold mt-0.5">
                    Không thể kết nối hoặc tải cơ sở dữ liệu từ ứng dụng Google Apps Script Web App của bạn. Chi tiết: <span className="underline">{dbErrorMsg}</span>. 
                    Mọi dữ liệu hoặc thay đổi sẽ tạm thời lưu trữ ngoại tuyến bằng Bộ nhớ dự phòng trên Trình duyệt (Offline Cache).
                  </p>
                </div>
              </div>
              {isLoggedIn && (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN') && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setActiveTab('config');
                    }}
                    className="bg-[#be123c] hover:bg-[#9f1239] text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm cursor-pointer select-none transition-all"
                  >
                    Cấu hình kết nối
                  </button>
                </div>
              )}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              
              {/* ==============================================================
                  MODULE 2: ANALYTICAL DASHBOARD OVERVIEW (Simplified)
                  ============================================================== */}
              {activeTab === 'dashboard' && (() => {
                const isAdminOrSuperAdmin = isLoggedIn && (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN');
                return (
                  <div className="space-y-6">
                    {/* Title and Top Description */}
                    <div className="bg-white rounded-xl border border-emerald-100 p-5 shadow-2xs">
                      <h2 className="text-base font-extrabold text-emerald-950 uppercase tracking-wide">BÁO CÁO HOẠT ĐỘNG CHUNG</h2>
                      <p className="text-xs text-emerald-800/80 mt-1">
                        Chào mừng đến với hệ thống quản lý học phí võ quán. Dưới đây là thống kê sỹ số và chi tiết tình trạng nộp học phí của võ sinh trong <strong>Tháng {currentMonth}/{currentYear}</strong>.
                      </p>
                    </div>

                    {/* Top Simple Counters Grid */}
                    <div className={`grid grid-cols-2 gap-2.5 ${isAdminOrSuperAdmin ? 'sm:grid-cols-2 lg:grid-cols-5' : 'sm:grid-cols-3'}`}>
                    {/* Stat Active Students */}
                    <div className="bg-white rounded-lg border border-gray-100 p-2.5 sm:p-3 shadow-3xs flex items-center justify-between gap-2.5">
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider font-sans">Sĩ số hoạt động</p>
                        <h3 className="text-sm font-extrabold text-emerald-950 mt-0.5">{students.filter(s => s.activeStatus === 'Active').length} võ sinh</h3>
                        <p className="text-[8.5px] text-gray-400 mt-0.5">Sỹ số tích cực</p>
                      </div>
                      <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <Users className="h-4 w-4" />
                      </div>
                    </div>

                    {isAdminOrSuperAdmin ? (
                      <>
                        {/* Stat Total Collected in CURRENT month */}
                        <div className="bg-white rounded-lg border border-gray-100 p-2.5 sm:p-3 shadow-3xs flex items-center justify-between gap-2.5">
                          <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider font-sans">Đã thu tháng {currentMonth}</p>
                            <h3 className="text-sm font-black text-emerald-950 mt-0.5">{formatVND(currentCollectedAmountSum)}</h3>
                            <p className="text-[8.5px] text-emerald-600 font-bold mt-0.5 font-sans">Đã đóng: {paidCurrentCount} võ sinh</p>
                          </div>
                          <div className="h-8 w-8 rounded-lg bg-emerald-50/55 text-emerald-750 flex items-center justify-center shrink-0">
                            <CheckCircle className="h-4 w-4" />
                          </div>
                        </div>

                        {/* Stat Outstanding Unpaid */}
                        <div className="bg-white rounded-lg border border-gray-100 p-2.5 sm:p-3 shadow-3xs flex items-center justify-between gap-2.5">
                          <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider font-sans">Chờ thu tháng {currentMonth}</p>
                            <h3 className="text-sm font-black text-rose-700 mt-0.5">{formatVND(currentUnpaidAmountSum)}</h3>
                            <p className="text-[8.5px] text-rose-600 font-bold mt-0.5 font-sans">Còn lại: {unpaidCurrentCount} võ sinh</p>
                          </div>
                          <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
                            <XCircle className="h-4 w-4" />
                          </div>
                        </div>

                        {/* Stat Bank Transfers in CURRENT month */}
                        <div className="bg-white rounded-lg border border-gray-100 p-2.5 sm:p-3 shadow-3xs flex items-center justify-between gap-2.5">
                          <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider font-sans">Đã chuyển tháng {currentMonth}</p>
                            <h3 className="text-sm font-black text-sky-850 mt-0.5">{formatVND(currentBankTransferSum)}</h3>
                            <p className="text-[8.5px] text-sky-650 font-bold mt-0.5 font-sans">Hạch toán chuyển khoản</p>
                          </div>
                          <div className="h-8 w-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                            <Landmark className="h-4 w-4" />
                          </div>
                        </div>

                        {/* Stat Remaining Current month */}
                        <div className="bg-white rounded-lg border border-gray-100 p-2.5 sm:p-3 shadow-3xs flex items-center justify-between gap-2.5">
                          <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider font-sans">Còn lại tháng {currentMonth}</p>
                            <h3 className={`text-sm font-black mt-0.5 ${currentMonthRemaining > 0 ? 'text-rose-650' : 'text-emerald-850'}`}>
                              {formatVND(currentMonthRemaining)}
                            </h3>
                            <p className="text-[8.5px] text-gray-400 mt-0.5 font-sans">Số dư cần thu nợ</p>
                          </div>
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${currentMonthRemaining > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-850'}`}>
                            <CircleDollarSign className="h-4 w-4" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="col-span-1 sm:col-span-2 bg-gradient-to-r from-emerald-50 to-emerald-100/30 rounded-xl border border-[#d1fae5] p-5 shadow-2xs flex items-center justify-between">
                        <div>
                          <p className="text-[9px] font-extrabold text-emerald-800 uppercase tracking-widest font-sans">🔒 BÁO CÁO TÀI CHÍNH BẢO MẬT</p>
                          <h3 className="text-sm font-extrabold text-emerald-950 mt-1">Doanh Thu & Công Nợ</h3>
                          <p className="text-[11px] text-emerald-800/80 font-medium mt-0.5">
                            {isLoggedIn ? (
                              "Yêu cầu quyền Quản trị viên (ADMIN) hoặc Ban Giám Sát (SUPER_ADMIN) để mở khóa báo cáo tài chính."
                            ) : (
                              "Vui lòng đăng nhập hệ thống ở góc trên bên phải bằng tài khoản Quản trị viên để mở khóa báo cáo."
                            )}
                          </p>
                        </div>
                        <div className="h-10 w-10 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center shrink-0">
                          <Lock className="h-4.5 w-4.5" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Multi-month Advanced Tuition Status Matrix Block */}
                  {isAdminOrSuperAdmin ? (
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-2xs space-y-4 font-sans">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-gray-100 pb-4">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                            📋 BÁO CÁO HỌC PHÍ
                          </h4>
                        <p className="text-[11px] text-gray-400">
                          Ma trận giám sát lịch sử đóng học phí mở rộng giúp dễ dàng đối chiếu đóng học kỳ trước và kế tiếp.
                        </p>
                      </div>

                      {/* Interactive Configuration Toolbar */}
                      <div className="flex flex-wrap items-center gap-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-xs shadow-3xs">
                        <div className="flex items-center gap-1.5">
                          <label className="text-gray-400 font-bold text-[10px] uppercase">Quá khứ:</label>
                          <select
                            value={monthsBefore}
                            onChange={(e) => setMonthsBefore(parseInt(e.target.value) || 0)}
                            className="bg-white border border-gray-200 rounded px-1.5 py-1 text-[11px] font-bold focus:outline-none focus:border-emerald-500 cursor-pointer text-gray-700"
                          >
                            <option value="0">0 tháng</option>
                            <option value="1">1 tháng trước</option>
                            <option value="2">2 tháng trước</option>
                            <option value="3">3 tháng trước</option>
                            <option value="4">4 tháng trước</option>
                            <option value="5">5 tháng trước</option>
                            <option value="6">6 tháng trước</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-1.5 border-l border-gray-200 pl-3">
                          <label className="text-gray-400 font-bold text-[10px] uppercase">Tương lai:</label>
                          <select
                            value={monthsAfter}
                            onChange={(e) => setMonthsAfter(parseInt(e.target.value) || 0)}
                            className="bg-white border border-gray-200 rounded px-1.5 py-1 text-[11px] font-bold focus:outline-none focus:border-emerald-500 cursor-pointer text-gray-700"
                          >
                            <option value="0">0 tháng</option>
                            <option value="1">1 tháng sau</option>
                            <option value="2">2 tháng sau</option>
                            <option value="3">3 tháng sau</option>
                            <option value="4">4 tháng sau</option>
                            <option value="5">5 tháng sau</option>
                            <option value="6">6 tháng sau</option>
                          </select>
                        </div>

                        <div className="relative border-l border-gray-200 pl-3">
                          <Search className="absolute top-2 left-5 h-3.5 w-3.5 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Lọc võ sinh..."
                            value={dashboardSearch}
                            onChange={(e) => setDashboardSearch(e.target.value)}
                            className="w-40 sm:w-48 rounded bg-white border border-gray-200 py-1 pl-8 pr-2 text-[11px] focus:outline-none focus:border-emerald-500 text-gray-700 font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Matrix table representation */}
                    <div className="overflow-x-auto">
                      {(() => {
                        const computedRange = getMonthRange(currentMonth, currentYear, monthsBefore, monthsAfter);
                        return (
                          <table className="w-full text-xs text-left border-collapse border border-gray-100">
                            <thead className="bg-[#f0f9f3] text-[10px] uppercase font-bold text-[#14532d] sticky top-0 border-b border-gray-200">
                              <tr>
                                <th className="px-3 py-3 font-semibold text-center border-r border-gray-100">ID</th>
                                <th className="px-4 py-3 font-bold border-r border-gray-100">Họ & Tên Võ Sinh</th>
                                <th className="px-3 py-3 border-r border-gray-100">SĐT Võ Sinh</th>
                                <th className="px-3 py-3 border-r border-gray-100">Phụ Huynh / SĐT</th>
                                {computedRange.map(item => {
                                  const isCurrent = item.month === currentMonth && item.year === currentYear;
                                  return (
                                    <th 
                                      key={`${item.month}-${item.year}`} 
                                      className={`px-2 py-3 text-center border-r border-gray-100 ${isCurrent ? 'bg-[#d1fae5] border-l-2 border-r-2 border-[#10b981] text-emerald-950 font-black' : 'font-semibold'}`}
                                    >
                                      T.{item.month}/{item.year}
                                      {isCurrent && <span className="block text-[8px] text-[#065f46] font-normal normal-case animate-none">Kỳ này</span>}
                                    </th>
                                  );
                                })}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {students.filter(s => {
                                const matchSearch = s.fullName.toLowerCase().includes(dashboardSearch.toLowerCase()) || 
                                                    s.parentPhone.includes(dashboardSearch) || 
                                                    (s.phone && s.phone.includes(dashboardSearch));
                                const matchStatus = s.activeStatus === 'Active';
                                return matchSearch && matchStatus;
                              }).length === 0 ? (
                                <tr>
                                  <td colSpan={4 + computedRange.length} className="px-4 py-8 text-center text-gray-400">
                                    Không tìm thấy võ sinh nào hoạt động thỏa mãn tìm kiếm.
                                  </td>
                                </tr>
                              ) : (
                                students.filter(s => {
                                  const matchSearch = s.fullName.toLowerCase().includes(dashboardSearch.toLowerCase()) || 
                                                      s.parentPhone.includes(dashboardSearch) || 
                                                      (s.phone && s.phone.includes(dashboardSearch));
                                  const matchStatus = s.activeStatus === 'Active';
                                  return matchSearch && matchStatus;
                                }).map((st) => {
                                  return (
                                    <tr key={st.studentId} className="hover:bg-gray-50/20 transition-colors">
                                      <td className="px-3 py-3.5 font-mono text-[9.5px] text-gray-400 text-center border-r border-gray-100 font-bold">{st.studentId}</td>
                                      <td className="px-4 py-3.5 font-bold text-gray-900 border-r border-gray-100">
                                        <p>{st.fullName}</p>
                                      </td>
                                      <td className="px-3 py-3.5 font-mono text-[11px] text-gray-700 border-r border-gray-100">
                                        {st.phone || <span className="text-gray-300 italic font-normal text-[10px]">Trống</span>}
                                      </td>
                                      <td className="px-3 py-3.5 border-r border-gray-100 text-gray-600">
                                        <p className="font-semibold text-[11.5px]">{st.parentName}</p>
                                        <span className="text-[10px] text-gray-405 font-mono">{st.parentPhone}</span>
                                      </td>
                                      {computedRange.map(item => {
                                        const cellPay = payments.find(p => p.studentId === st.studentId && p.month === item.month && p.year === item.year);
                                        const isCellPaid = cellPay?.paidStatus === 'Paid';
                                        const isCellExempt = cellPay?.paidStatus === 'Exempted';
                                        const isCurrent = item.month === currentMonth && item.year === currentYear;

                                        // Check if student joined yet based on enrollmentDate ("YYYY-MM-DD")
                                        let hasJoined = true;
                                        if (st.enrollmentDate) {
                                          const parts = st.enrollmentDate.split('-');
                                          if (parts.length >= 2) {
                                            const enrollYear = parseInt(parts[0], 10);
                                            const enrollMonth = parseInt(parts[1], 10);
                                            if (!isNaN(enrollYear) && !isNaN(enrollMonth)) {
                                              if (item.year < enrollYear || (item.year === enrollYear && item.month < enrollMonth)) {
                                                hasJoined = false;
                                              }
                                            }
                                          }
                                        }

                                        if (!hasJoined) {
                                          return (
                                            <td 
                                              key={`${st.studentId}-${item.month}-${item.year}`}
                                              className={`px-2 py-3.5 text-center border-r border-gray-100 bg-[#f9fafb]/60 select-none text-gray-400 ${isCurrent ? 'bg-gray-100/30' : ''}`}
                                            >
                                              <div className="inline-flex flex-col items-center justify-center p-1 bg-gray-100/60 border border-gray-200/50 text-gray-400 rounded min-w-[80px] w-full text-center">
                                                <span className="text-[10px] font-bold text-gray-400/80">Trống</span>
                                                <span className="text-[8px] text-gray-450 font-bold mt-0.5">Chưa tham gia</span>
                                              </div>
                                            </td>
                                          );
                                        }

                                        return (
                                          <td 
                                            key={`${st.studentId}-${item.month}-${item.year}`}
                                            className={`px-2 py-3.5 text-center border-r border-gray-100 ${isCurrent ? 'bg-emerald-50/20 font-semibold' : ''}`}
                                          >
                                            {isCellExempt ? (<div className="inline-flex flex-col items-center justify-center p-1 bg-cyan-50 border border-cyan-200 text-cyan-800 rounded min-w-[80px] w-full text-center"><span className="text-[10px] font-bold flex items-center justify-center gap-0.5 text-cyan-700">✨ Miễn học phí</span>{cellPay?.note ? (<span className="text-[8.5px] font-bold text-cyan-600 mt-0.5 block truncate max-w-[80px] w-full" title={cellPay.note}>{cellPay.note}</span>) : (<span className="text-[8px] text-cyan-500 mt-0.5 italic block">Không cần đóng</span>)}<button onClick={() => { setReceiptStudent(st); setActiveReceiptPayment(cellPay); }} className="mt-1 text-[8.5px] text-cyan-800 hover:text-cyan-950 underline bg-transparent cursor-pointer font-bold block" title="Xem chi tiết miễn đóng">Chi Tiết</button></div>) : isCellPaid ? (
                                              <div className="inline-flex flex-col items-center justify-center p-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded min-w-[80px] w-full text-center">
                                                <span className="text-[10px] font-bold flex items-center justify-center gap-0.5 text-emerald-700">
                                                  <Check className="h-3 w-3" /> Đã nộp
                                                </span>
                                                {cellPay.paidDate && (
                                                  <span className="text-[8px] mt-0.5 opacity-80 text-emerald-600 block">
                                                    {cellPay.paidDate.substring(8, 10)}/{cellPay.paidDate.substring(5, 7)}
                                                  </span>
                                                )}
                                                <button
                                                  onClick={() => {
                                                    setReceiptStudent(st);
                                                    setActiveReceiptPayment(cellPay);
                                                  }}
                                                  className="mt-1 text-[8.5px] text-emerald-800 hover:text-emerald-950 underline bg-transparent cursor-pointer font-bold block"
                                                  title="Xem & in biên lai"
                                                >
                                                  Xem Biên Lai
                                                </button>
                                              </div>
                                            ) : (
                                              <div className="inline-flex flex-col items-center justify-center w-full">
                                                {currentUser.role !== 'VIEWER' ? (
                                                  <button
                                                    onClick={() => {
                                                      setCurrentMonth(item.month);
                                                      setCurrentYear(item.year);
                                                      setPayingStudentId(st.studentId);
                                                      setIsPayModalOpen(true);
                                                    }}
                                                    className="flex flex-col items-center justify-center p-1 bg-rose-50 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 text-rose-800 rounded min-w-[80px] w-full transition cursor-pointer"
                                                  >
                                                    <span className="text-[10px] font-bold">Chưa nộp</span>
                                                    <span className="text-[8px] underline text-rose-600 mt-0.5 font-semibold">Thu đóng</span>
                                                  </button>
                                                ) : (
                                                  <span className="inline-block px-2.5 py-1 bg-gray-50 border border-gray-100 text-gray-400 rounded text-[9.5px]">
                                                    Chưa nộp
                                                  </span>
                                                )}
                                              </div>
                                            )}
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                            <tfoot className="bg-emerald-50/15 border-t border-gray-200 font-bold select-none text-gray-800">
                              {/* Row 1: Tổng học phí theo tháng */}
                              <tr className="bg-slate-50/50 border-b border-gray-100/80">
                                <td colSpan={4} className="px-4 py-3 text-right font-black text-[10px] text-emerald-950 uppercase tracking-wide">
                                  Tổng học phí theo tháng
                                </td>
                                {computedRange.map(item => {
                                  const colActiveStudents = students.filter(s => {
                                    if (s.activeStatus !== 'Active') return false;
                                    if (s.enrollmentDate) {
                                      const parts = s.enrollmentDate.split('-');
                                      if (parts.length >= 2) {
                                        const enrollYear = parseInt(parts[0], 10);
                                        const enrollMonth = parseInt(parts[1], 10);
                                        if (!isNaN(enrollYear) && !isNaN(enrollMonth)) {
                                          if (item.year < enrollYear || (item.year === enrollYear && item.month < enrollMonth)) {
                                            return false;
                                          }
                                        }
                                      }
                                    }
                                    return true;
                                  });
                                  const colTotalTuitionExpected = colActiveStudents.reduce((sum, st) => {
                                    const cellPay = payments.find(p => p.studentId === st.studentId && p.month === item.month && p.year === item.year);
                                    const isCellExempt = cellPay?.paidStatus === 'Exempted';
                                    if (isCellExempt) return sum;
                                    const amt = cellPay ? cellPay.amount : st.tuitionFee;
                                    return sum + amt;
                                  }, 0);

                                  return (
                                    <td key={`total-tuition-${item.month}-${item.year}`} className="px-2 py-3 text-center border-r border-gray-100 font-extrabold text-emerald-900 font-mono">
                                      {formatVND(colTotalTuitionExpected)}
                                    </td>
                                  );
                                })}
                              </tr>

                              {/* Row 2: Đã chuyển khoản */}
                              <tr className="bg-sky-50/10 border-b border-gray-100/80">
                                <td colSpan={4} className="px-4 py-3 text-right font-black text-[10px] text-sky-950 uppercase tracking-wide">
                                  Đã chuyển khoản
                                </td>
                                {computedRange.map(item => {
                                  const colBankTransferSum = bankTransfers
                                    .filter(t => t.month === item.month && t.year === item.year)
                                    .reduce((sum, t) => sum + t.amount, 0);

                                  return (
                                    <td key={`bank-trf-${item.month}-${item.year}`} className="px-2 py-3 text-center border-r border-gray-100 font-extrabold text-sky-700 font-mono">
                                      {formatVND(colBankTransferSum)}
                                    </td>
                                  );
                                })}
                              </tr>

                              {/* Row 3: Còn lại */}
                              <tr className="bg-rose-50/10 border-b border-gray-100/80">
                                <td colSpan={4} className="px-4 py-3 text-right font-black text-[10px] text-rose-950 uppercase tracking-wide">
                                  Còn lại
                                </td>
                                {computedRange.map(item => {
                                  const colActiveStudents = students.filter(s => {
                                    if (s.activeStatus !== 'Active') return false;
                                    if (s.enrollmentDate) {
                                      const parts = s.enrollmentDate.split('-');
                                      if (parts.length >= 2) {
                                        const enrollYear = parseInt(parts[0], 10);
                                        const enrollMonth = parseInt(parts[1], 10);
                                        if (!isNaN(enrollYear) && !isNaN(enrollMonth)) {
                                          if (item.year < enrollYear || (item.year === enrollYear && item.month < enrollMonth)) {
                                            return false;
                                          }
                                        }
                                      }
                                    }
                                    return true;
                                  });
                                  const colTotalTuitionExpected = colActiveStudents.reduce((sum, st) => {
                                    const cellPay = payments.find(p => p.studentId === st.studentId && p.month === item.month && p.year === item.year);
                                    const isCellExempt = cellPay?.paidStatus === 'Exempted';
                                    if (isCellExempt) return sum;
                                    const amt = cellPay ? cellPay.amount : st.tuitionFee;
                                    return sum + amt;
                                  }, 0);

                                  const colBankTransferSum = bankTransfers
                                    .filter(t => t.month === item.month && t.year === item.year)
                                    .reduce((sum, t) => sum + t.amount, 0);

                                  const colRemaining = colTotalTuitionExpected - colBankTransferSum;

                                  return (
                                    <td 
                                      key={`rem-${item.month}-${item.year}`} 
                                      className={`px-2 py-3 text-center border-r border-gray-100 font-extrabold font-mono ${colRemaining > 0 ? 'text-rose-600' : 'text-emerald-700'}`}
                                    >
                                      {formatVND(colRemaining)}
                                    </td>
                                  );
                                })}
                              </tr>
                            </tfoot>
                          </table>
                        );
                      })()}
                    </div>
                  </div>
                ) : (
                    <div className="bg-white rounded-xl border border-[#d1fae5]/70 p-8 shadow-3xs text-center space-y-4 max-w-lg mx-auto">
                      <div className="mx-auto w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
                        <LockKeyhole className="h-7 w-7 text-emerald-650 animate-pulse" />
                      </div>
                      <h3 className="text-emerald-950 font-extrabold text-sm uppercase tracking-wider">
                        {isLoggedIn ? "THIẾU QUYỀN TRUY CẬP BÁO CÁO" : "YÊU CẦU ĐĂNG NHẬP HỆ THỐNG"}
                      </h3>
                      <p className="text-xs text-emerald-800/80 leading-relaxed">
                        {isLoggedIn ? (
                          "Tính năng và ma trận phân tích báo cáo học phí chi tiết này chỉ dành riêng cho Ban Giám Sát (SUPER_ADMIN) và Quản Trị Viên (ADMIN). Tài khoản nhân viên của bạn hiện không có đủ thẩm quyền truy cập."
                        ) : (
                          "Bạn chưa đăng nhập hoặc phiên đã hết hạn. Vui lòng điền thông tin tài khoản và mật khẩu ở bảng góc trên bên phải để mở khóa ma trận báo cáo học phí và chức năng quản lý."
                        )}
                      </p>
                      
                      {!isLoggedIn && (
                        <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100/50 max-w-sm mx-auto text-left">
                          <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-emerald-800 block mb-1">💡 Thông tin tài khoản Demo:</span>
                          <code className="text-[10.5px] font-mono text-emerald-900 block font-bold">Tài khoản: <span className="underline">staff</span> (Mật khẩu: staff)</code>
                          <code className="text-[10.5px] font-mono text-emerald-900 block font-bold">Tài khoản: <span className="underline">admin</span> (Mật khẩu: admin)</code>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                );
              })()}


              {/* ==============================================================
                  MODULE 4: STUDENT MANAGEMENT SCREEN
                  ============================================================== */}
              {activeTab === 'students' && (
                <div className="space-y-4">
                  {/* Header page student control */}
                  <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h1 className="text-xl font-bold text-gray-900 tracking-tight">Danh Sách Võ Sinh</h1>
                      <p className="text-xs text-gray-500 mt-1">Cập nhật sỹ số võ sinh, thông tin cha mẹ, chiết khấu phần trăm ưu đãi và địa chỉ nhà.</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={handleExportStudents}
                        className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100/70 transition cursor-pointer"
                      >
                        <Download className="h-4 w-4" /> Xuất Excel / CSV
                      </button>

                      {currentUser.role !== 'VIEWER' && (
                        <button
                          onClick={() => {
                            setEditingStudent(null);
                            setIsStudentModalOpen(true);
                          }}
                          className="flex items-center gap-1 bg-emerald-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg hover:bg-emerald-700 transition cursor-pointer shadow-xs shadow-emerald-200"
                        >
                          <Plus className="h-4 w-4" /> Thêm Võ Sinh Mới
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filters and search blocks */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 rounded-xl border border-gray-100 bg-white p-4 shadow-2xs">
                    {/* Search student input */}
                    <div className="relative sm:col-span-3">
                      <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Tìm võ sinh, nickname, SĐT phụ huynh, SĐT võ sinh..."
                        value={searchStudent}
                        onChange={(e) => setSearchStudent(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-1.5 pl-9 pr-4 text-xs focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* Status student selector */}
                    <select
                      value={statusFilterStudent}
                      onChange={(e) => setStatusFilterStudent(e.target.value)}
                      className="rounded-lg border border-gray-200 bg-gray-50/50 px-3.5 py-1.5 text-xs text-gray-700 focus:border-emerald-500 focus:outline-none font-medium"
                    >
                      <option value="Active">Đang đi học (Active)</option>
                      <option value="Inactive">Nghỉ tạm thời (Inactive)</option>
                      <option value="Archived">Đã lưu trữ (Archived / Soft delete)</option>
                    </select>
                  </div>

                  {/* Student list table container */}
                  <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left text-gray-600">
                        <thead className="bg-[#f0f9f3] text-[10px] uppercase font-bold text-[#14532d] border-b border-gray-100">
                          <tr>
                            <th className="px-4 py-3">Danh xưng ID</th>
                            <th className="px-4 py-3">Họ và Tên Võ Sinh</th>
                            <th className="px-4 py-3">SĐT Võ Sinh</th>
                            <th className="px-4 py-3">Phụ huynh & SĐT</th>
                            <th className="px-4 py-3">Học phí mỗi tháng</th>
                            <th className="px-4 py-3">Ngày nhập học</th>
                            <th className="px-4 py-3">Hành động</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {students.filter(s => {
                            const matchSearch = s.fullName.toLowerCase().includes(searchStudent.toLowerCase()) || 
                                                s.parentPhone.includes(searchStudent) || 
                                                (s.phone && s.phone.includes(searchStudent));
                            const matchStatus = s.activeStatus === statusFilterStudent;
                            return matchSearch && matchStatus;
                          }).length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                                Không tìm thấy hồ sơ võ sinh nào khớp với tiêu chuẩn đề ra.
                              </td>
                            </tr>
                          ) : (
                            students.filter(s => {
                              const matchSearch = s.fullName.toLowerCase().includes(searchStudent.toLowerCase()) || 
                                                  s.parentPhone.includes(searchStudent) || 
                                                  (s.phone && s.phone.includes(searchStudent));
                              const matchStatus = s.activeStatus === statusFilterStudent;
                              return matchSearch && matchStatus;
                            }).map((st) => {
                              return (
                                <tr key={st.studentId} className="hover:bg-gray-50/50 transition-colors">
                                  <td className="px-4 py-3 font-mono text-[10px] text-gray-400 font-bold">{st.studentId}</td>
                                  <td className="px-4 py-3">
                                    <p className="font-bold text-gray-950 text-xs">{st.fullName}</p>
                                    <span className="text-[10px] text-emerald-800 italic">Gọi tên: {st.nickname || 'Không'}</span>
                                  </td>
                                  <td className="px-4 py-3 font-semibold text-gray-700">
                                    {st.phone || <span className="text-gray-300 italic font-normal">Chưa cập nhật</span>}
                                  </td>
                                  <td className="px-4 py-3">
                                    <p className="font-semibold text-gray-700">{st.parentName}</p>
                                    <span className="text-[10px] text-gray-400 font-bold">{st.parentPhone}</span>
                                  </td>
                                  <td className="px-4 py-3 font-extrabold text-[#111827]">{formatVND(st.tuitionFee)}</td>
                                  <td className="px-4 py-3 text-gray-400 font-mono">{st.enrollmentDate}</td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        onClick={() => {
                                          setEditingStudent(st);
                                          setIsStudentModalOpen(true);
                                        }}
                                        className="rounded border border-gray-200 bg-white p-1 text-gray-500 hover:text-emerald-700 cursor-pointer"
                                        title="Chỉnh hồ sơ học sinh"
                                      >
                                        <Edit className="h-3.5 w-3.5" />
                                      </button>
                                      
                                      {currentUser.role !== 'VIEWER' && st.activeStatus === 'Active' && (
                                        <button
                                          onClick={() => handleArchiveStudent(st)}
                                          className="rounded border border-red-100 bg-red-50/50 p-1 text-red-500 hover:bg-rose-100 cursor-pointer"
                                          title="Tạm ngừng học"
                                        >
                                          <UserMinus className="h-3.5 w-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Add Student Modal dialog Form */}
                  {isStudentModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-lg rounded-xl bg-white shadow-xl overflow-hidden border border-emerald-100"
                      >
                        <div className="flex items-center justify-between border-b border-gray-100 bg-emerald-50 px-5 py-3.5">
                          <span className="font-bold text-xs uppercase tracking-wider text-emerald-950">
                            {editingStudent ? 'Cập nhật hồ sơ võ sinh' : 'Ghi danh võ sinh mới'}
                          </span>
                          <button onClick={() => setIsStudentModalOpen(false)} className="rounded-full p-1 text-emerald-700 hover:bg-emerald-100 font-bold">
                            <X className="h-4.5 w-4.5" />
                          </button>
                        </div>

                        <form onSubmit={handleSaveStudent} className="p-5 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-500 uppercase">Họ và Tên võ sinh</label>
                              <input
                                type="text"
                                name="fullName"
                                required
                                placeholder="Ví dụ: Nguyễn Văn Hải"
                                defaultValue={editingStudent?.fullName || ''}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-1.5 px-3.5 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-500 uppercase">Biệt danh / Gọi tên</label>
                              <input
                                type="text"
                                name="nickname"
                                placeholder="Ví dụ: Hải Nguyễn"
                                defaultValue={editingStudent?.nickname || ''}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-1.5 px-3.5 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1 col-span-2">
                              <label className="text-[10px] font-bold text-gray-500 uppercase">Ngày tháng năm sinh</label>
                              <input
                                type="date"
                                name="dateOfBirth"
                                required
                                defaultValue={editingStudent?.dateOfBirth || '2015-01-01'}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-1.5 px-3.5 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-500 uppercase">Giới tính võ sinh</label>
                              <select
                                name="gender"
                                defaultValue={editingStudent?.gender || 'Male'}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-1.5 px-3.5 text-xs focus:border-emerald-500 focus:outline-none font-semibold text-gray-700"
                              >
                                <option value="Male">Nam (Male)</option>
                                <option value="Female">Nữ (Female)</option>
                                <option value="Other">Khác</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-500 uppercase">Số điện thoại học viên</label>
                              <input
                                type="text"
                                name="phone"
                                placeholder="Ví dụ: 0987333444"
                                defaultValue={editingStudent?.phone || ''}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-1.5 px-3.5 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-500 uppercase">SĐT di động Phụ huynh</label>
                              <input
                                type="text"
                                name="parentPhone"
                                required
                                placeholder="Ví dụ: 0987111222"
                                defaultValue={editingStudent?.parentPhone || ''}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-1.5 px-3.5 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-500 uppercase">Họ tên phụ mẫu bảo hộ</label>
                              <input
                                type="text"
                                name="parentName"
                                required
                                placeholder="Ví dụ: Nguyễn Minh Hùng"
                                defaultValue={editingStudent?.parentName || ''}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-1.5 px-3.5 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-500 uppercase">Email cha mẹ báo học tập</label>
                              <input
                                type="email"
                                name="email"
                                placeholder="vui_long_nhap_email@gmail.com"
                                defaultValue={editingStudent?.email || ''}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-1.5 px-3.5 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1 col-span-2">
                              <label className="text-[10px] font-bold text-gray-500 uppercase">Địa chỉ nhà võ sinh</label>
                              <input
                                type="text"
                                name="address"
                                required
                                placeholder="Số nhà, ngõ, nẻo..."
                                defaultValue={editingStudent?.address || ''}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-1.5 px-3.5 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1 font-sans">
                              <label className="text-[10px] font-bold text-gray-500 uppercase">Học phí mỗi tháng (VND)</label>
                              <input
                                type="number"
                                name="tuitionFee"
                                required
                                placeholder="Ví dụ: 1500000"
                                defaultValue={editingStudent?.tuitionFee || config.defaultTuitionFee}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-1.5 px-3.5 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Ghi chú</label>
                            <textarea
                              name="note"
                              rows={2}
                              defaultValue={editingStudent?.note || ''}
                              placeholder="Trình độ khởi đầu, thể trạng năng khiếu, ghi chú khác..."
                              className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2 text-xs focus:border-emerald-500 focus:outline-none"
                            ></textarea>
                          </div>

                          <input type="hidden" name="activeStatus" defaultValue={editingStudent?.activeStatus || 'Active'} />

                          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                            <button
                              type="button"
                              onClick={() => {
                                setIsStudentModalOpen(false);
                                setEditingStudent(null);
                              }}
                              className="rounded-lg border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                            >
                              Hủy bỏ tuyển sinh
                            </button>
                            <button
                              type="submit"
                              className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer"
                            >
                              Hoàn thành đăng ký
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    </div>
                  )}
                </div>
              )}

              {/* ==============================================================
                  MODULE 5: TUITION MANAGEMENT SCREEN
                  ============================================================== */}
              {activeTab === 'tuition' && (
                <div className="space-y-4">
                  {/* Page header */}
                  <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h1 className="text-xl font-bold text-gray-900 tracking-tight">Sổ Theo Dõi Học Phí Chi Tiết</h1>
                      <p className="text-xs text-gray-500 mt-1">Hệ thống tạo hạch toán học phí hàng tháng tự động. Thu tiền mặt hoặc ngân hàng tiện lợi.</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={handleExportTuitionReport}
                        className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100/70 transition cursor-pointer shadow-2xs"
                      >
                        <FileSpreadsheet className="h-4 w-4" /> Xuất bảng kê (Học phí)
                      </button>
                    </div>
                  </div>

                  {/* Billing table details */}
                  <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left text-gray-600">
                        <thead className="bg-[#f0f9f3] text-[10px] uppercase font-bold text-[#14532d] border-b border-gray-100">
                          <tr>
                            <th className="px-4 py-3.5">Mã sỹ sớ</th>
                            <th className="px-4 py-3.5">Học sinh đăng ký</th>
                            <th className="px-4 py-3.5">Phụ huynh liên lạc</th>
                            <th className="px-4 py-3.5">Nghĩa vụ học phí</th>
                            <th className="px-4 py-3.5">Biên Lai hóa đơn</th>
                            <th className="px-4 py-3.5">Trạng thái thu phí</th>
                            <th className="px-4 py-3.5 text-right">Thao tác thu đóng</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {payments.filter(p => p.month === currentMonth && p.year === currentYear).length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                                Chưa có hồ sơ nghĩa vụ học phí khởi tạo cho tháng này.
                              </td>
                            </tr>
                          ) : (
                            payments.filter(p => p.month === currentMonth && p.year === currentYear).map((pay) => {
                              const stud = students.find(s => s.studentId === pay.studentId);
                              
                              return (
                                <tr key={pay.paymentId} className="hover:bg-gray-50/50 transition-colors">
                                  <td className="px-4 py-3.5 font-mono text-[10px] text-gray-400">{pay.paymentId}</td>
                                  <td className="px-4 py-3.5">
                                    <p className="font-bold text-gray-900 leading-tight">{stud ? stud.fullName : 'Học viên ẩn danh'}</p>
                                    <span className="text-[10px] text-gray-400 font-mono italic">Mã: {pay.studentId}</span>
                                  </td>
                                  <td className="px-4 py-3.5">
                                    <p className="text-gray-700 font-semibold">{stud ? stud.parentName : 'Không có'}</p>
                                    <span className="text-[10px] text-gray-400 font-bold">{stud ? stud.parentPhone : 'N/A'}</span>
                                  </td>
                                  <td className="px-4 py-3.5 font-extrabold text-emerald-900">{formatVND(pay.amount)}</td>
                                  <td className="px-4 py-3.5">
                                    {pay.paidStatus === 'Paid' ? (
                                      <div>
                                        <p className="font-mono text-[10.5px] font-black text-gray-800 bg-[#eefaf2] px-1 border border-emerald-100 rounded w-fit">{pay.receiptNo}</p>
                                        <span className="text-[9px] text-gray-400 block pt-0.5">Ngày nộp: {pay.paidDate}</span>
                                      </div>
                                    ) : pay.paidStatus === 'Exempted' ? (
                                      <div>
                                        <p className="font-mono text-[10.5px] font-bold text-cyan-800 bg-cyan-50 px-1 border border-cyan-100 rounded w-fit">{pay.receiptNo || 'EXEMPTED'}</p>
                                        <p className="text-[10px] text-cyan-600 font-extrabold italic mt-0.5 animate-pulse" title={pay.note}>Lý do: {pay.note || 'Không cần nộp'}</p>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400 text-[10px] italic">Chờ xuất phiếu...</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3.5 select-none">
                                    <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-extrabold ${pay.paidStatus === 'Paid' ? 'bg-[#e0ffd5] text-[#1c640e]' : pay.paidStatus === 'Exempted' ? 'bg-cyan-100 text-cyan-800' : 'bg-rose-100 text-rose-700 pulse-active'}`}>
                                      {pay.paidStatus === 'Paid' ? 'ĐÃ ĐÓNG SỔ (Paid)' : pay.paidStatus === 'Exempted' ? 'MIỄN HỌC PHÍ (Exempted)' : 'CHƯA ĐÓNG'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3.5 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {pay.paidStatus === 'Paid' ? (
                                        <>
                                          <button
                                            onClick={() => {
                                              setReceiptStudent(stud || null);
                                              setActiveReceiptPayment(pay);
                                            }}
                                            className="rounded font-bold bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border-emerald-100 border text-[10px] px-2.5 py-1 cursor-pointer"
                                            title="Xem hồ sơ / In biên lai"
                                          >
                                            In Biên Lai (Receipt)
                                          </button>
                                          
                                          {currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN' ? (
                                            <button
                                              onClick={() => handleMarkUnpaid(pay)}
                                              className="p-1 rounded bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-[10px] cursor-pointer"
                                              title="Hủy thanh toán / Reset"
                                            >
                                              Hủy Đóng
                                            </button>
                                          ) : null}
                                        </>
                                      ) : pay.paidStatus === 'Exempted' ? (
                                        <>
                                          <button
                                            onClick={() => {
                                              setReceiptStudent(stud || null);
                                              setActiveReceiptPayment(pay);
                                            }}
                                            className="rounded font-bold bg-cyan-50 hover:bg-cyan-100/80 text-cyan-800 border-cyan-100 border text-[10px] px-2.5 py-1 cursor-pointer"
                                            title="Xem lý do miễn nộp"
                                          >
                                            Chi Tiết Miễn Đóng
                                          </button>
                                          
                                          {currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN' ? (
                                            <button
                                              onClick={() => handleMarkUnpaid(pay)}
                                              className="p-1 rounded bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-[10px] cursor-pointer"
                                              title="Hủy trạng thái miễn đóng / Reset"
                                            >
                                              Hủy Miễn Đóng
                                            </button>
                                          ) : null}
                                        </>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            if (isPeriodLocked) {
                                              alert('Kỳ hạch toán này hiện đang KHÓA SỔ. Mở khóa Điểm neo trước!');
                                              return;
                                            }
                                            setPayingStudentId(pay.studentId);
                                            setIsPayModalOpen(true);
                                          }}
                                          disabled={isPeriodLocked || currentUser.role === 'VIEWER' || currentUser.role === 'STAFF'}
                                          className="rounded font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] px-3 py-1 cursor-pointer disabled:opacity-50"
                                        >
                                          Nhận Đóng Học Phí
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                        <tfoot className="bg-emerald-50/15 border-t border-gray-200 font-bold select-none text-gray-800">
                          {/* Row 1: Tổng học phí theo tháng */}
                          <tr className="bg-slate-50/50 border-b border-gray-100/80">
                            <td colSpan={3} className="px-4 py-3 text-right font-black text-[10px] text-emerald-950 uppercase tracking-wide">
                              Tổng học phí theo tháng
                            </td>
                            <td className="px-4 py-3 font-extrabold text-emerald-900 font-mono text-[12.5px]">
                              {formatVND(currentMonthTotalTuition)}
                            </td>
                            <td colSpan={3} className="px-4 py-3"></td>
                          </tr>

                          {/* Row 2: Đã chuyển khoản */}
                          <tr className="bg-sky-50/10 border-b border-gray-100/80">
                            <td colSpan={3} className="px-4 py-3 text-right font-black text-[10px] text-sky-950 uppercase tracking-wide">
                              Đã chuyển khoản
                            </td>
                            <td className="px-4 py-3 font-extrabold text-sky-700 font-mono text-[12.5px]">
                              {formatVND(currentBankTransferSum)}
                            </td>
                            <td colSpan={3} className="px-4 py-3"></td>
                          </tr>

                          {/* Row 3: Còn lại */}
                          <tr className="bg-rose-50/10 border-b border-gray-100/80">
                            <td colSpan={3} className="px-4 py-3 text-right font-black text-[10px] text-rose-950 uppercase tracking-wide">
                              Còn lại
                            </td>
                            <td className={`px-4 py-3 font-extrabold font-mono text-[12.5px] ${currentMonthRemaining > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                              {formatVND(currentMonthRemaining)}
                            </td>
                            <td colSpan={3} className="px-4 py-3"></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Mark Paid Detailed popup Dialogue Form */}
                  {isPayModalOpen && payingStudentId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-sm rounded-xl bg-white border border-emerald-100 shadow-xl overflow-hidden"
                      >
                        <div className="flex items-center justify-between bg-emerald-50 border-b border-gray-100 px-5 py-3.5">
                          <span className="font-bold text-xs uppercase tracking-wider text-emerald-950">Biểu mẫu thu Ngũ Quỹ học phí</span>
                          <button onClick={() => {
                            setIsPayModalOpen(false);
                            setPayingStudentId(null);
                            setIsFreeExempt(false);
                          }} className="text-emerald-800 rounded-full p-1 hover:bg-emerald-100 font-bold">
                            <X className="h-4.5 w-4.5" />
                          </button>
                        </div>

                        {(() => {
                          const stdMatch = students.find(s => s.studentId === payingStudentId)!;
                          return (
                            <form onSubmit={handleMarkPaidSubmit} className="p-5 space-y-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Võ sinh nộp học phí</label>
                                <p className="text-xs font-bold text-gray-900">{stdMatch.fullName} ({stdMatch.nickname || 'Không biệt danh'})</p>
                                <p className="text-[10px] text-[#0f766e] font-extrabold">📍 {config.centerName} • Học phí gốc: {formatVND(stdMatch.tuitionFee)}</p>
                              </div>

                              {/* Lựa chọn Miễn Phí hoặc Đóng học phí */}
                              <div className="space-y-1.5 p-2.5 rounded-lg border border-emerald-100 bg-emerald-50/20">
                                <label className="text-[10px] font-bold text-emerald-800 uppercase block">Trạng thái hạch toán</label>
                                <div className="flex flex-col gap-1.5">
                                  <label className="flex items-center gap-2 text-xs text-gray-700 font-bold cursor-pointer">
                                    <input 
                                      type="radio" 
                                      name="paymentType" 
                                      value="Paid"
                                      checked={!isFreeExempt}
                                      onChange={() => setIsFreeExempt(false)}
                                      className="text-emerald-600 focus:ring-emerald-500" 
                                    />
                                    <span>Đóng học phí bình thường</span>
                                  </label>
                                  <label className="flex items-center gap-2 text-xs text-rose-800 font-bold cursor-pointer">
                                    <input 
                                      type="radio" 
                                      name="paymentType" 
                                      value="Exempted"
                                      checked={isFreeExempt}
                                      onChange={() => setIsFreeExempt(true)}
                                      className="text-rose-600 focus:ring-rose-500" 
                                    />
                                    <span>Miễn học phí / Không cần đóng</span>
                                  </label>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Số học phí thực đóng (VNĐ)</label>
                                <input
                                  type="number"
                                  name="paidAmount"
                                  required
                                  value={paidAmountVal}
                                  onChange={(e) => setPaidAmountVal(e.target.value)}
                                  disabled={isFreeExempt}
                                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-1.5 px-3.5 text-xs font-extrabold text-emerald-950 focus:border-emerald-500 focus:outline-none disabled:opacity-75 disabled:bg-gray-100"
                                />
                                {isFreeExempt && (
                                  <span className="text-[9px] text-emerald-700 font-bold block mt-1">✨ Miễn đóng học phí: Số tiền tự động điều chỉnh về 0đ</span>
                                )}
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Ngày hoàn thành thu nộp / ghi nhận</label>
                                <input
                                  type="date"
                                  name="paidDate"
                                  required
                                  defaultValue={new Date().toISOString().substring(0, 10)}
                                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-1.5 px-3.5 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">
                                  {isFreeExempt ? 'LÝ DO MIỄN PHÍ / KHÔNG CẦN ĐÓNG (Bắt buộc)' : 'Nội dung chi đóng / Sổ ghi biên lai'}
                                </label>
                                <input
                                  type="text"
                                  name="note"
                                  required={isFreeExempt}
                                  placeholder={isFreeExempt ? 'Ghi rõ lý do miễn học phí (Bắt buộc)...' : 'Ví dụ: Đóng tiền mặt tại VP, Chuyển khoản Techcombank'}
                                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-1.5 px-3.5 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Nhân viên thu ngân lập phiếu</label>
                                <input
                                  type="text"
                                  name="collectedBy"
                                  required
                                  defaultValue={currentUser.fullName}
                                  className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-1.5 px-3.5 text-xs font-semibold focus:border-emerald-500 focus:outline-none"
                                />
                              </div>

                              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 mt-4">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsPayModalOpen(false);
                                    setPayingStudentId(null);
                                    setIsFreeExempt(false);
                                  }}
                                  className="rounded-lg border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                                >
                                  Hủy đóng
                                </button>
                                <button
                                  type="submit"
                                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition cursor-pointer"
                                >
                                  Xác nhận thu nộp
                                </button>
                              </div>
                            </form>
                          );
                        })()}
                      </motion.div>
                    </div>
                  )}
                </div>
              )}

              {/* ==============================================================
                  NEWS-ARTICLES MODULE
                  ============================================================== */}
              {activeTab === 'news' && (
                <AnnouncementSection
                  announcements={announcements}
                  userRole={currentUser.role}
                  currentUserName={currentUser.fullName}
                  onAddAnnouncement={handleAddNewAnnouncement}
                  onUpdateAnnouncement={handleUpdateAnnouncement}
                  onDeleteAnnouncement={handleDeleteAnnouncement}
                  forceType="news"
                />
              )}

              {/* ==============================================================
                  MODULE 7: ANNOUNCEMENTS OUTLINE BOARD
                  ============================================================== */}
              {activeTab === 'announcements' && (
                <AnnouncementSection
                  announcements={announcements}
                  userRole={currentUser.role}
                  currentUserName={currentUser.fullName}
                  onAddAnnouncement={handleAddNewAnnouncement}
                  onUpdateAnnouncement={handleUpdateAnnouncement}
                  onDeleteAnnouncement={handleDeleteAnnouncement}
                  forceType="internal"
                />
              )}



              {/* ==============================================================
                  MODULE 29: RECEIVED BANK TRANSFERS LOG VIEW
                  ============================================================== */}
              {activeTab === 'bank_transfers' && (
                <BankTransferView
                  transfers={bankTransfers}
                  userRole={currentUser.role}
                  currentUserName={currentUser.fullName}
                  onAddTransfer={handleAddBankTransfer}
                  onUpdateTransfer={handleUpdateBankTransfer}
                  onDeleteTransfer={handleDeleteBankTransfer}
                />
              )}

              {/* ==============================================================
                  MODULE 10 & 28: CONFIGURATION PAGE & INSTANT TEST USER SWAP
                  ============================================================== */}
               {activeTab === 'config' && (
                <ConfigSettings
                  config={config}
                  users={users}
                  userRole={currentUser.role}
                  currentUser={currentUser.username}
                  onUpdateConfig={handleUpdateConfig}
                  onSwitchUser={handleSwitchUser}
                  onUpdateUsers={handleUpdateUsers}
                  students={students}
                  payments={payments}
                  bankTransfers={bankTransfers}
                  announcements={announcements}
                  onSyncImport={handleSyncImport}
                />
              )}

            </motion.div>
          </AnimatePresence>
        </section>

        {/* Persistent Võ Quán Profile Banner — Bên dưới trang web */}
        <footer className="no-print px-5 md:px-6 pb-6 pt-2 select-none">
          <div className="bg-[#f0fdf4] border border-emerald-100 rounded-2xl p-6 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-emerald-950 pointer-events-none hidden md:block">
              <GraduationCap className="h-32 w-32" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="space-y-2.5">
                <div className="inline-flex items-center gap-2 bg-emerald-100/70 border border-emerald-200 rounded-full px-3 py-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span className="text-[10.5px] font-extrabold text-[#115e59] uppercase tracking-wider font-mono">Thông Tin Võ Quán</span>
                </div>
                <h1 className="text-xl font-black text-emerald-950 tracking-tight leading-snug">
                  🥋 LỚP VỊNH XUÂN BÌNH TÂN — VÕ QUÁN NAM ANH QUANG
                </h1>
                <p className="text-xs text-emerald-900/80 max-w-2xl leading-relaxed">
                  Nhận học viên thường xuyên kể cả chưa có kinh nghiệm võ thuật chiêu sinh mọi cấp độ. Chương trình huấn luyện Vịnh Xuân Quyền chuyên sâu giúp tăng cường thể chất, phản xạ tự vệ và rèn luyện đạo đức võ thuật.
                </p>
              </div>

              {/* Contact Info Card */}
              <div className="bg-white border border-emerald-50 rounded-xl p-4 shadow-3xs text-xs space-y-2 md:w-80 shrink-0">
                <h3 className="font-extrabold text-emerald-950 uppercase text-[10px] tracking-widest border-b border-gray-100 pb-1.5 flex items-center gap-1">
                  <Phone className="h-3 w-3 text-emerald-600" /> Sổ Hotline Liên Hệ
                </h3>
                <p className="font-bold text-gray-800">VS Nam Anh Quang: <a href="tel:0938372286" className="text-emerald-700 hover:underline">0938 372 286</a></p>
                <p className="text-[11px] text-gray-500 font-medium">Nhận học viên thường xuyên kể cả chưa có kinh nghiệm võ thuật.</p>
              </div>
            </div>

            {/* Meta quick-grid details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-emerald-200/50 pt-5 mt-5 text-xs text-emerald-950 font-semibold">
              <div className="flex items-start gap-2.5">
                <CalendarDays className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold uppercase tracking-wider text-[9px] text-[#0f766e]">⏰ Lịch Tập Luyện</p>
                  <p className="text-emerald-900 mt-0.5 font-bold">18:30 – 20:00</p>
                  <p className="text-emerald-800 text-[10.5px]">Thứ 2 – 4 – 6 hàng tuần</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Users className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold uppercase tracking-wider text-[9px] text-[#0f766e]">👨‍👩‍👧‍👦 Đối Tượng Tham Gia</p>
                  <p className="text-emerald-900 mt-0.5 font-bold">Nam / Nữ từ 6 – 60 tuổi</p>
                  <p className="text-emerald-800 text-[10.5px]">Không yêu cầu kinh nghiệm ban đầu</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold uppercase tracking-wider text-[9px] text-[#0f766e]">📍 Địa Chỉ Võ Quán</p>
                  <p className="text-emerald-900 mt-0.5 font-bold">Khu Mua Sắm Anh Hào</p>
                  <p className="text-emerald-800 text-[10.5px] leading-snug">666 Đường Số 1, Bình Hưng Hòa B, Bình Tân, TP.HCM</p>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* ----------------- GLOBAL EMBED RECEIPT EXPORT VISUALIZER ----------------- */}
      <AnimatePresence>
        {activeReceiptPayment && receiptStudent && (
          <ReceiptModal
            isOpen={!!activeReceiptPayment}
            onClose={() => {
              setActiveReceiptPayment(null);
              setReceiptStudent(null);
            }}
            payment={activeReceiptPayment}
            student={receiptStudent}
            klass={classes.find(c => c.classId === activeReceiptPayment.classId)}
            config={config}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
