/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | 'VIEWER';

export interface User {
  username: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
}

export interface Class {
  classId: string;
  className: string;
  teacherName: string;
  schedule: string;
  room: string;
  tuitionDefault: number; // default tuition fee in VND
  note: string;
  activeStatus: 'Active' | 'Inactive' | 'Archived';
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  studentId: string;
  fullName: string;
  nickname?: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  parentName: string;
  parentPhone: string;
  phone?: string;
  address: string;
  email: string;
  classId: string; // references Class.classId
  tuitionFee: number; // actual fee (maybe discounted)
  discount: number; // in percentage or VND
  note: string;
  activeStatus: 'Active' | 'Inactive' | 'Archived';
  enrollmentDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface TuitionPayment {
  paymentId: string;
  studentId: string;
  classId: string;
  month: number; // 1-12
  year: number;
  amount: number; // paid amount in VND
  paidStatus: 'Paid' | 'Unpaid' | 'Exempted';
  paidDate?: string;
  collectedBy?: string;
  receiptNo: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherTransfer {
  transferId: string;
  month: number;
  year: number;
  totalCollected: number; // sum of collected tuition for this period
  transferAmount: number; // amount sent to teacher
  transferDate: string;
  transferredBy: string;
  remainingAmount: number; // totalCollected - transferAmount
  note: string;
  createdAt: string;
}

export interface Announcement {
  announcementId: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
}

export interface AuditLog {
  auditId: string;
  entityType: 'STUDENT' | 'TUITION' | 'TRANSFER' | 'CONFIGURATION' | 'BASELINE' | 'AUTH' | 'EXPORT' | 'CLASS' | 'ANNOUNCEMENT';
  entityId: string;
  action: 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'BASELINE_CREATE' | 'MONTH_LOCK' | 'MONTH_UNLOCK';
  oldValue: string; // JSON string or text summary
  newValue: string; // JSON string or text summary
  modifiedBy: string;
  modifiedAt: string;
}

export interface Baseline {
  baselineId: string;
  month: number;
  year: number;
  totalStudents: number;
  totalCollected: number;
  totalTransferred: number;
  remainingAmount: number;
  snapshotJson: string; // entire snapshot state as serialized JSON
  createdBy: string;
  createdAt: string;
  status: 'OPEN' | 'CLOSED' | 'LOCKED';
}

export interface AppConfig {
  centerName: string;
  address: string;
  phone: string;
  receiptPrefix: string;
  logoUrl?: string;
  defaultTuitionFee: number;
  academicYear: number;
}
