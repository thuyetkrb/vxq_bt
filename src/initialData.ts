/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, TuitionPayment, TeacherTransfer, Announcement, AuditLog, Baseline, AppConfig, User, BankTransfer } from './types';

export const INITIAL_USERS: User[] = [
  { username: 'thuyethn', fullName: 'thuyethn', role: 'SUPER_ADMIN', isActive: true, password: '123456' },
  { username: 'naquang', fullName: 'naquang', role: 'ADMIN', isActive: true, password: '123456' },
  { username: 'viewer', fullName: 'khách xem', role: 'VIEWER', isActive: true, password: 'viewer' },
  { username: 'staff', fullName: 'NV', role: 'STAFF', isActive: true, password: 'staff' }
];

export const INITIAL_CONFIG: AppConfig = {
  centerName: 'Vịnh Xuân Quyền - Nam Anh Quang',
  address: 'Khu Mua Sắm Anh Hào, 666 Đường Số 1, Bình Hưng Hòa B, Bình Tân, TP.HCM',
  phone: '0938 372 286',
  receiptPrefix: 'VXQ',
  logoUrl: '',
  defaultTuitionFee: 500000, // 500,000 VND
  academicYear: 2026,
  googleScriptsUrl: 'https://script.google.com/macros/s/AKfycbxIn3veSMqAUAa5-gVTevp3WH121TwQ_tAK55l6TsKXVyEPS3oQWCoVlfhhj0vFXXNQIg/exec',
  googleScriptsId: 'AKfycbxIn3veSMqAUAa5-gVTevp3WH121TwQ_tAK55l6TsKXVyEPS3oQWCoVlfhhj0vFXXNQIg'
};

export const INITIAL_CLASSES: any[] = [];

export const INITIAL_STUDENTS: Student[] = [
  {
    studentId: 'VS-001',
    fullName: 'Phát',
    nickname: 'Phat',
    beltRank: 'Đai Lam',
    dateOfBirth: '2016-01-01',
    gender: 'Male',
    parentName: 'NN',
    parentPhone: 'NN',
    phone: 'NN',
    address: 'Tân Phú',
    email: 'NN',
    tuitionFee: 500000,
    discount: 0,
    note: 'NA',
    activeStatus: 'Active',
    enrollmentDate: '2026-05-01',
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-05-01T08:00:00Z'
  },
  {
    studentId: 'VS-002',
    fullName: 'Vân',
    nickname: 'Van',
    beltRank: 'Đai Vàng',
    dateOfBirth: '2016-01-01',
    gender: 'Male',
    parentName: 'NN',
    parentPhone: 'NN',
    phone: 'NN',
    address: 'Bình Tân',
    email: 'NN',
    tuitionFee: 0,
    discount: 0,
    note: 'NA',
    activeStatus: 'Active',
    enrollmentDate: '2026-05-01',
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-05-01T08:00:00Z'
  },
  {
    studentId: 'VS-003',
    fullName: 'Thuyết',
    nickname: 'Thuyet',
    beltRank: 'Đai Trắng',
    dateOfBirth: '2016-01-01',
    gender: 'Male',
    parentName: 'NN',
    parentPhone: 'NN',
    phone: 'NN',
    address: 'Bình Tân',
    email: 'NN',
    tuitionFee: 500000,
    discount: 0,
    note: 'NA',
    activeStatus: 'Active',
    enrollmentDate: '2026-05-01',
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-05-01T08:00:00Z'
  },
  {
    studentId: 'VS-004',
    fullName: 'Tuệ Lâm',
    nickname: 'Tue Lam',
    beltRank: 'Đai Lam',
    dateOfBirth: '2016-01-01',
    gender: 'Female',
    parentName: 'NN',
    parentPhone: 'NN',
    phone: 'NN',
    address: 'Bình Tân',
    email: 'NN',
    tuitionFee: 400000,
    discount: 0,
    note: 'NA',
    activeStatus: 'Active',
    enrollmentDate: '2026-05-01',
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-05-01T08:00:00Z'
  },
  {
    studentId: 'VS-005',
    fullName: 'Thái Phong',
    nickname: 'Thái Phong',
    beltRank: 'Đai Đỏ',
    dateOfBirth: '2016-01-01',
    gender: 'Male',
    parentName: 'NN',
    parentPhone: 'NN',
    phone: 'NN',
    address: 'Bình Tân',
    email: 'NN',
    tuitionFee: 500000,
    discount: 0,
    note: 'NA',
    activeStatus: 'Active',
    enrollmentDate: '2026-05-01',
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-05-01T08:00:00Z'
  },
  {
    studentId: 'VS-006',
    fullName: 'Khôi (Nhỏ)',
    nickname: 'Khoi_Nho',
    dateOfBirth: '2016-01-01',
    gender: 'Male',
    parentName: 'NN',
    parentPhone: 'NN',
    phone: 'NN',
    address: 'Bình Tân',
    email: 'NN',
    tuitionFee: 400000,
    discount: 0,
    note: 'NA',
    activeStatus: 'Active',
    enrollmentDate: '2026-05-01',
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-05-01T08:00:00Z'
  },
  {
    studentId: 'VS-007',
    fullName: 'Khôi Nguyễn',
    nickname: 'Khoi_Lon',
    dateOfBirth: '2016-01-01',
    gender: 'Male',
    parentName: 'NN',
    parentPhone: 'NN',
    phone: 'NN',
    address: 'Bình Tân',
    email: 'NN',
    tuitionFee: 500000,
    discount: 0,
    note: 'NA',
    activeStatus: 'Active',
    enrollmentDate: '2026-05-01',
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-05-01T08:00:00Z'
  },
  {
    studentId: 'VS-008',
    fullName: 'Tuấn Huỳnh',
    nickname: 'Tuan_Huynh',
    dateOfBirth: '2016-01-01',
    gender: 'Male',
    parentName: 'NN',
    parentPhone: 'NN',
    phone: 'NN',
    address: 'Bình Tân',
    email: 'NN',
    tuitionFee: 500000,
    discount: 0,
    note: 'NA',
    activeStatus: 'Active',
    enrollmentDate: '2026-05-01',
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-05-01T08:00:00Z'
  },
  {
    studentId: 'VS-009',
    fullName: 'Minh Nguyệt',
    nickname: 'Minh Nguyet',
    dateOfBirth: '2016-01-01',
    gender: 'Female',
    parentName: 'NN',
    parentPhone: 'NN',
    phone: 'NN',
    address: 'Bình Tân',
    email: 'NN',
    tuitionFee: 500000,
    discount: 0,
    note: 'NA',
    activeStatus: 'Active',
    enrollmentDate: '2026-05-01',
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-05-01T08:00:00Z'
  },
  {
    studentId: 'VS-010',
    fullName: 'Bảo Yến',
    nickname: 'Bao Yen',
    dateOfBirth: '2016-01-01',
    gender: 'Female',
    parentName: 'NN',
    parentPhone: 'NN',
    phone: 'NN',
    address: 'Bình Tân',
    email: 'NN',
    tuitionFee: 500000,
    discount: 0,
    note: 'NA',
    activeStatus: 'Active',
    enrollmentDate: '2026-05-01',
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-05-01T08:00:00Z'
  },
  {
    studentId: 'VS-011',
    fullName: 'Quỳnh',
    nickname: 'Quynh',
    dateOfBirth: '2016-01-01',
    gender: 'Female',
    parentName: 'NN',
    parentPhone: 'NN',
    phone: 'NN',
    address: 'Bình Tân',
    email: 'NN',
    tuitionFee: 500000,
    discount: 0,
    note: 'NA',
    activeStatus: 'Active',
    enrollmentDate: '2026-05-01',
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-05-01T08:00:00Z'
  },
  {
    studentId: 'VS-012',
    fullName: 'Thành',
    nickname: 'Thanh',
    dateOfBirth: '2016-01-01',
    gender: 'Male',
    parentName: 'NN',
    parentPhone: 'NN',
    phone: 'NN',
    address: 'Bình Tân',
    email: 'NN',
    tuitionFee: 500000,
    discount: 0,
    note: 'NA',
    activeStatus: 'Active',
    enrollmentDate: '2026-05-01',
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-05-01T08:00:00Z'
  }
];

export const INITIAL_PAYMENTS: TuitionPayment[] = [];

export const INITIAL_TRANSFERS: TeacherTransfer[] = [];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    announcementId: 'ANN-01',
    title: 'Chào mừng quý võ sinh đến với Vịnh Xuân Quyền - Nam Anh Quang',
    content: 'Chúc tất cả quý vị và các võ sinh rèn luyện dẻo dai khỏe mạnh và tràn đầy năng lượng thực học thực hành tấn tới.',
    createdBy: 'thuyethn',
    createdAt: '2026-05-27T08:00:00Z',
    updatedAt: '2026-05-27T08:00:00Z',
    pinned: true,
    type: 'internal'
  },
  {
    announcementId: 'ANN-02',
    title: 'Tinh Hoa Tinh Thần Võ Đạo Trong Hệ Phái Vịnh Xuân Quyền',
    content: 'Tập luyện Vịnh Xuân Quyền không chỉ là rèn luyện những đường quyền dũng mãnh hay bộ pháp linh hoạt, mà cốt lõi cốt tủy là tu dưỡng tâm tính, rèn luyện sự tĩnh lặng trong tâm hồn. Sự hài hòa giữa nhu và cương, tính nhẫn nại và tinh thần khiêm nhường chính là đỉnh cao của võ đạo.',
    createdBy: 'Võ Sư Ban Truyền Thông',
    createdAt: '2026-05-30T10:00:00Z',
    updatedAt: '2026-05-30T10:00:00Z',
    pinned: false,
    type: 'news'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const INITIAL_BASELINES: Baseline[] = [];

export const INITIAL_BANK_TRANSFERS: BankTransfer[] = [];
