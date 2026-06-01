/**
 * Central export — import từ đây thay vì import trực tiếp từng file
 * Usage: import { login, createAppointment, getDoctors } from '../api'
 */
export * from './auth';
export * from './users';
export * from './appointments';
export * from './medical';
export * from './catalog';
export * from './payments';
export { default as api } from './config';
