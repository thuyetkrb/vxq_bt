/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Class, Student, TuitionPayment, TeacherTransfer, Announcement, AuditLog, Baseline, AppConfig, User, BankTransfer } from './types';

export const MOCK_USERS: User[] = [
  { username: 'superadmin', fullName: 'Trần Minh Đức', role: 'SUPER_ADMIN', isActive: true },
  { username: 'admin', fullName: 'Nguyễn Thị Mai', role: 'ADMIN', isActive: true },
  { username: 'staff', fullName: 'Phạm Quang Hải', role: 'STAFF', isActive: true },
  { username: 'viewer', fullName: 'Lê Hoàng Nam', role: 'VIEWER', isActive: true }
];

export const INITIAL_CONFIG: AppConfig = {
  centerName: 'Lớp Vịnh Xuân Bình Tân (Nam Anh Quang)',
  address: 'Khu Mua Sắm Anh Hào, 666 Đường Số 1, Bình Hưng Hòa B, Bình Tân, TP.HCM',
  phone: '0938 372 286',
  receiptPrefix: 'VXQ',
  logoUrl: '',
  defaultTuitionFee: 1500000, // 1,500,000 VND
  academicYear: 2026
};

export const INITIAL_CLASSES: Class[] = [
  {
    classId: 'CLASS-01',
    className: 'Vịnh Xuân Quyền Cơ Bản',
    teacherName: 'VS Nam Anh Quang',
    schedule: 'Thứ 2 - 4 - 6 (18:30 - 20:00)',
    room: 'Khu Mua Sắm Anh Hào',
    tuitionDefault: 1500000,
    note: 'Lớp nhập môn căn bản cho mọi lứa tuổi',
    activeStatus: 'Active',
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z'
  },
  {
    classId: 'CLASS-02',
    className: 'Vịnh Xuân Quyền Nâng Cao',
    teacherName: 'VS Nam Anh Quang',
    schedule: 'Thứ 2 - 4 - 6 (18:30 - 20:00)',
    room: 'Khu Mua Sắm Anh Hào',
    tuitionDefault: 1500000,
    note: 'Lớp chuyên sâu niêm thủ và binh khí',
    activeStatus: 'Active',
    createdAt: '2026-01-15T09:30:00Z',
    updatedAt: '2026-01-15T09:30:00Z'
  },
  {
    classId: 'CLASS-03',
    className: 'Vịnh Xuân Quyền Thiếu Nhi',
    teacherName: 'Cô Nguyễn Thị Mai',
    schedule: 'Thứ 2 - 4 - 6 (18:30 - 20:00)',
    room: 'Khu Mua Sắm Anh Hào',
    tuitionDefault: 1200000,
    note: 'Rèn luyện tính tự kỷ luật và thể chất cho trẻ em',
    activeStatus: 'Active',
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z'
  },
  {
    classId: 'CLASS-04',
    className: 'Vịnh Xuân Quyền Đối Kháng',
    teacherName: 'Thầy Phạm Quang Hải',
    schedule: 'Thứ 2 - 4 - 6 (18:30 - 20:00)',
    room: 'Khu Mua Sắm Anh Hào',
    tuitionDefault: 1800000,
    note: 'Lực tay, tòng thủ và gỡ đòn chiến đấu thực tế',
    activeStatus: 'Active',
    createdAt: '2026-02-15T14:00:00Z',
    updatedAt: '2026-02-15T14:00:00Z'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    studentId: 'STUD-001',
    fullName: 'Nguyễn Minh Quân',
    nickname: 'Quân Nguyễn',
    dateOfBirth: '2015-05-12',
    gender: 'Male',
    parentName: 'Nguyễn Văn Hùng',
    parentPhone: '0912.345.678',
    address: 'Số 12 Ngõ 85 Chùa Láng, Đống Đa, Hà Nội',
    email: 'quan.nm15@gmail.com',
    classId: 'CLASS-03',
    tuitionFee: 1500000,
    discount: 0,
    note: 'Tích cực phát biểu, tiếp thu nhanh',
    activeStatus: 'Active',
    enrollmentDate: '2026-02-01',
    createdAt: '2026-02-01T11:00:00Z',
    updatedAt: '2026-02-01T11:00:00Z'
  },
  {
    studentId: 'STUD-002',
    fullName: 'Trần Phương Linh',
    nickname: 'Linh Chi',
    dateOfBirth: '2004-09-24',
    gender: 'Female',
    parentName: 'Phạm Thị Thủy',
    parentPhone: '0934.567.890',
    address: 'Nhà 5A, Ngõ 102 Tôn Thất Tùng, Hà Nội',
    email: 'phuonglinh.tran04@gmail.com',
    classId: 'CLASS-02',
    tuitionFee: 2250000, // discounted 10%
    discount: 10,
    note: 'Ưu đãi học viên cũ giảm 10%',
    activeStatus: 'Active',
    enrollmentDate: '2026-01-15',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z'
  },
  {
    studentId: 'STUD-003',
    fullName: 'Lê Hoàng Phong',
    nickname: 'Phong Lê',
    dateOfBirth: '1998-11-03',
    gender: 'Male',
    parentName: 'Lê Hoàng Bách',
    parentPhone: '0945.678.901',
    address: 'Phòng 1804 Chung cư Mipec Tây Sơn, Hà Nội',
    email: 'phongle98@gmail.com',
    classId: 'CLASS-01',
    tuitionFee: 1200000,
    discount: 0,
    note: 'Học viên nghiêm túc, đi làm bận cần hỗ trợ thêm',
    activeStatus: 'Active',
    enrollmentDate: '2026-01-12',
    createdAt: '2026-01-12T09:00:00Z',
    updatedAt: '2026-01-12T09:00:00Z'
  },
  {
    studentId: 'STUD-004',
    fullName: 'Phạm Hồng Ánh',
    nickname: 'Ánh Ánh',
    dateOfBirth: '2016-01-30',
    gender: 'Female',
    parentName: 'Phạm Trung Kiên',
    parentPhone: '0978.901.234',
    address: 'Nhà số 8 Hàng Cháo, Cát Linh, Đống Đa',
    email: 'kientrung.pham@outlook.com',
    classId: 'CLASS-03',
    tuitionFee: 1350000, // discounted 10%
    discount: 10,
    note: 'Con của giảng viên phụ trợ nên giảm 10%',
    activeStatus: 'Active',
    enrollmentDate: '2026-02-05',
    createdAt: '2026-02-05T09:12:00Z',
    updatedAt: '2026-02-05T09:12:00Z'
  },
  {
    studentId: 'STUD-005',
    fullName: 'Bùi Gia Huy',
    nickname: 'Huy Béo',
    dateOfBirth: '2009-07-15',
    gender: 'Male',
    parentName: 'Bùi Quốc Cường',
    parentPhone: '0989.123.456',
    address: 'Số 54 Ngõ Thổ Quan, Khâm Thiên, Hà Nội',
    email: 'huybg09@gmail.com',
    classId: 'CLASS-04',
    tuitionFee: 1800000,
    discount: 0,
    note: 'Mục tiêu thi chuyên Sư Phạm',
    activeStatus: 'Active',
    enrollmentDate: '2026-02-18',
    createdAt: '2026-02-18T15:30:00Z',
    updatedAt: '2026-02-18T15:30:00Z'
  },
  {
    studentId: 'STUD-006',
    fullName: 'Vũ Thùy Chi',
    nickname: 'Chi Chi',
    dateOfBirth: '2005-03-22',
    gender: 'Female',
    parentName: 'Vũ Thành Long',
    parentPhone: '0904.555.666',
    address: 'Số 112 Phố Chùa Bộc, Hà Nội',
    email: 'thuychi.vu05@gmail.com',
    classId: 'CLASS-02',
    tuitionFee: 2500000,
    discount: 0,
    note: 'Đăng ký muộn, chăm học từ vựng',
    activeStatus: 'Active',
    enrollmentDate: '2026-02-28',
    createdAt: '2026-02-28T10:15:00Z',
    updatedAt: '2026-02-28T10:15:00Z'
  }
];

export const INITIAL_PAYMENTS: TuitionPayment[] = [
  // Payments for May 2026 (Month 5/2026) - Current Month
  {
    paymentId: 'PAY-2605-01',
    studentId: 'STUD-001',
    classId: 'CLASS-03',
    month: 5,
    year: 2026,
    amount: 1500000,
    paidStatus: 'Paid',
    paidDate: '2026-05-05',
    collectedBy: 'Nguyễn Thị Mai',
    receiptNo: 'MD2605001',
    note: 'Nộp tiền mặt tại VP',
    createdAt: '2026-05-05T08:30:00Z',
    updatedAt: '2026-05-05T08:30:00Z'
  },
  {
    paymentId: 'PAY-2605-02',
    studentId: 'STUD-002',
    classId: 'CLASS-02',
    month: 5,
    year: 2026,
    amount: 2250000,
    paidStatus: 'Paid',
    paidDate: '2026-05-10',
    collectedBy: 'Nguyễn Thị Mai',
    receiptNo: 'MD2605002',
    note: 'Chuyển khoản Vietcombank',
    createdAt: '2026-05-10T09:15:00Z',
    updatedAt: '2026-05-10T09:15:00Z'
  },
  {
    paymentId: 'PAY-2605-03',
    studentId: 'STUD-003',
    classId: 'CLASS-01',
    month: 5,
    year: 2026,
    amount: 1200000,
    paidStatus: 'Paid',
    paidDate: '2026-05-12',
    collectedBy: 'Phạm Quang Hải',
    receiptNo: 'MD2605003',
    note: 'Chuyển khoản BIDV',
    createdAt: '2026-05-12T14:20:00Z',
    updatedAt: '2026-05-12T14:20:00Z'
  },
  {
    paymentId: 'PAY-2605-04',
    studentId: 'STUD-004',
    classId: 'CLASS-03',
    month: 5,
    year: 2026,
    amount: 1350000,
    paidStatus: 'Unpaid',
    receiptNo: '',
    note: 'Hẹn nộp ngày 28/05',
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z'
  },
  {
    paymentId: 'PAY-2605-05',
    studentId: 'STUD-005',
    classId: 'CLASS-04',
    month: 5,
    year: 2026,
    amount: 1800000,
    paidStatus: 'Paid',
    paidDate: '2026-05-18',
    collectedBy: 'Nguyễn Thị Mai',
    receiptNo: 'MD2605004',
    note: 'Đã đóng đủ học phí',
    createdAt: '2026-05-18T10:00:00Z',
    updatedAt: '2026-05-18T10:00:00Z'
  },
  {
    paymentId: 'PAY-2605-06',
    studentId: 'STUD-006',
    classId: 'CLASS-02',
    month: 5,
    year: 2026,
    amount: 2500000,
    paidStatus: 'Unpaid',
    receiptNo: '',
    note: '',
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z'
  },

  // Historical Payments for April 2026 (Month 4/2026) - All paid & snapshot locked
  {
    paymentId: 'PAY-2604-01',
    studentId: 'STUD-001',
    classId: 'CLASS-03',
    month: 4,
    year: 2026,
    amount: 1500000,
    paidStatus: 'Paid',
    paidDate: '2026-04-05',
    collectedBy: 'Nguyễn Thị Mai',
    receiptNo: 'MD2604001',
    note: 'Nộp VP',
    createdAt: '2026-04-05T08:30:00Z',
    updatedAt: '2026-04-05T08:30:00Z'
  },
  {
    paymentId: 'PAY-2604-02',
    studentId: 'STUD-002',
    classId: 'CLASS-02',
    month: 4,
    year: 2026,
    amount: 2250000,
    paidStatus: 'Paid',
    paidDate: '2026-04-08',
    collectedBy: 'Nguyễn Thị Mai',
    receiptNo: 'MD2604002',
    note: 'Vietcombank',
    createdAt: '2026-04-08T09:15:00Z',
    updatedAt: '2026-04-08T09:15:00Z'
  },
  {
    paymentId: 'PAY-2604-03',
    studentId: 'STUD-003',
    classId: 'CLASS-01',
    month: 4,
    year: 2026,
    amount: 1200000,
    paidStatus: 'Paid',
    paidDate: '2026-04-10',
    collectedBy: 'Phạm Quang Hải',
    receiptNo: 'MD2604003',
    note: 'Khoản thu đầy đủ',
    createdAt: '2026-04-10T14:20:00Z',
    updatedAt: '2026-04-10T14:20:00Z'
  },
  {
    paymentId: 'PAY-2604-04',
    studentId: 'STUD-004',
    classId: 'CLASS-03',
    month: 4,
    year: 2026,
    amount: 1350000,
    paidStatus: 'Paid',
    paidDate: '2026-04-12',
    collectedBy: 'Trần Minh Đức',
    receiptNo: 'MD2604004',
    note: 'Nhận mặt',
    createdAt: '2026-04-12T16:00:00Z',
    updatedAt: '2026-04-12T16:00:00Z'
  },
  {
    paymentId: 'PAY-2604-05',
    studentId: 'STUD-005',
    classId: 'CLASS-04',
    month: 4,
    year: 2026,
    amount: 1800000,
    paidStatus: 'Paid',
    paidDate: '2026-04-15',
    collectedBy: 'Nguyễn Thị Mai',
    receiptNo: 'MD2604005',
    note: 'Huy nộp học phí',
    createdAt: '2026-04-15T11:00:00Z',
    updatedAt: '2026-04-15T11:00:00Z'
  }
];

export const INITIAL_TRANSFERS: TeacherTransfer[] = [
  {
    transferId: 'XFER-2604-01',
    month: 4,
    year: 2026,
    totalCollected: 8100000, // 1.5 + 2.25 + 1.2 + 1.35 + 1.8 = 8.1M VND
    transferAmount: 6000000,
    transferDate: '2026-04-28',
    transferredBy: 'Trần Minh Đức',
    remainingAmount: 2100000,
    note: 'Quyết toán lương giáo viên tháng 4',
    createdAt: '2026-04-28T17:00:00Z'
  },
  {
    transferId: 'XFER-2605-01',
    month: 5,
    year: 2026,
    totalCollected: 6750000, // 1.5 + 2.25 + 1.2 + 1.8 = 6.75M VND (paid in May)
    transferAmount: 4500000,
    transferDate: '2026-05-20',
    transferredBy: 'Trần Minh Đức',
    remainingAmount: 2250000,
    note: 'Tạm ứng đợt 1 tháng 5 cho giáo viên thỉnh giảng',
    createdAt: '2026-05-20T16:00:00Z'
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    announcementId: 'ANN-01',
    title: 'Thông báo nghỉ tập ngày Quốc tế Thiếu nhi 01/06',
    content: 'Kính gửi quý phụ huynh và các em võ sinh, võ quán Vịnh Xuân Bình Tân xin thông báo nghỉ tập ngày Quốc tế Thiếu nhi 01/06/2026. Các em sẽ nghỉ tập vào thứ Hai và tập bù vào các buổi sau cùng huấn luyện viên phụ trách.',
    createdBy: 'Trần Minh Đức',
    createdAt: '2026-05-15T09:00:00Z',
    updatedAt: '2026-05-15T09:00:00Z',
    pinned: true
  },
  {
    announcementId: 'ANN-02',
    title: 'Quy định đóng học phí và võ phục lớp Vịnh Xuân',
    content: 'Để phục vụ công tác chuẩn bị mua sắm võ phục, trang thiết bị tập luyện tốt nhất, kính mong quý phụ huynh và võ sinh hoàn tất nghĩa vụ học phí trước ngày 05 hàng tháng. Võ sinh nộp đúng hạn sẽ được võ quán tặng thêm huy hiệu đặc biệt.',
    createdBy: 'Nguyễn Thị Mai',
    createdAt: '2026-05-20T10:30:00Z',
    updatedAt: '2026-05-20T10:30:00Z',
    pinned: false
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    auditId: 'AUD-001',
    entityType: 'AUTH',
    entityId: 'superadmin',
    action: 'LOGIN',
    oldValue: '',
    newValue: 'Đăng nhập thành công với vai trò SUPER_ADMIN',
    modifiedBy: 'superadmin',
    modifiedAt: '2026-05-26T04:00:00Z'
  },
  {
    auditId: 'AUD-002',
    entityType: 'TUITION',
    entityId: 'PAY-2605-02',
    action: 'UPDATE',
    oldValue: 'Trạng thái: Unpaid',
    newValue: 'Trạng thái: Paid, Số tiền: 2.250.000đ, Thu bởi: Nguyễn Thị Mai',
    modifiedBy: 'admin',
    modifiedAt: '2026-05-10T09:15:00Z'
  },
  {
    auditId: 'AUD-003',
    entityType: 'TRANSFER',
    entityId: 'XFER-2605-01',
    action: 'CREATE',
    oldValue: '',
    newValue: 'Tạo phiếu chi giáo viên tháng 5: 4.500.000đ',
    modifiedBy: 'superadmin',
    modifiedAt: '2026-05-20T16:00:00Z'
  }
];

export const INITIAL_BASELINES: Baseline[] = [
  {
    baselineId: 'BASE-2604',
    month: 4,
    year: 2026,
    totalStudents: 5,
    totalCollected: 8100000,
    totalTransferred: 6000000,
    remainingAmount: 2100000,
    snapshotJson: '{"locked":true}',
    createdBy: 'Trần Minh Đức',
    createdAt: '2026-04-30T18:00:00Z',
    status: 'LOCKED'
  }
];

export const INITIAL_BANK_TRANSFERS: BankTransfer[] = [
  {
    transferId: 'TRF-001',
    studentId: 'ST-2601',
    month: 5,
    year: 2026,
    transferDate: '2026-05-12',
    amount: 1500000,
    note: 'Chuyen khoan hoc phi T5 lop Vinh Xuan Co Ban - Tran Dai Nghia',
    createdBy: 'admin',
    createdAt: '2026-05-12T09:30:00Z'
  },
  {
    transferId: 'TRF-002',
    studentId: 'ST-2602',
    month: 5,
    year: 2026,
    transferDate: '2026-05-15',
    amount: 2250000,
    note: 'Dong hoc phi T5 va ung ho vo quan - Phung Hoang Thuan',
    createdBy: 'superadmin',
    createdAt: '2026-05-15T14:45:00Z'
  }
];

