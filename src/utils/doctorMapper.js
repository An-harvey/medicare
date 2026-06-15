/**
 * doctorMapper.js — Chuyển đổi DoctorResponseDTO từ BE → object FE
 * ─────────────────────────────────────────────────────────────────
 * BE trả về:
 *   { id, fullName, imageUrl, academicTitle, specialtyName, experienceYears }
 *
 * FE cần thêm: avatar (URL đầy đủ), name, specialty, experience, ...
 */
import { getImageUrl } from './constants';

/* ── Ảnh fallback cho bác sĩ nếu BE chưa có imageUrl ── */
const FALLBACK_AVATARS = [
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop',
];

function getFallbackAvatar(id) {
  const idx = String(id || '').split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  return FALLBACK_AVATARS[idx % FALLBACK_AVATARS.length];
}

/**
 * mapDoctorFromApi — map 1 DoctorResponseDTO → FE doctor object
 * @param {object} d - raw DTO từ BE
 * @returns {object} - normalized doctor cho FE
 */
export function mapDoctorFromApi(d) {
  if (!d) return null;

  const id = d.id ?? d.doctorId;
  const imageUrl = d.imageUrl || null;
  const avatar = imageUrl ? getImageUrl(imageUrl) : getFallbackAvatar(id);

  return {
    // ── IDs ──
    id,
    doctorId: id,

    // ── Tên & học hàm ──
    name:          d.fullName ?? d.name ?? 'Bác sĩ',
    fullName:      d.fullName ?? d.name ?? 'Bác sĩ',
    academicTitle: d.academicTitle ?? '',
    degree:        d.degree ?? d.academicTitle ?? '',

    // ── Chuyên khoa ──
    specialty:   d.specialtyName ?? d.specialty ?? '',
    specialtyId: d.specialtyId ?? null,

    // ── Kinh nghiệm & phí ──
    experience:     d.experienceYears ?? d.experience ?? 0,
    experienceYears: d.experienceYears ?? d.experience ?? 0,
    consultationFee: d.consultationFee ?? d.price ?? 200000,
    price:           d.consultationFee ?? d.price ?? 200000,

    // ── Ảnh đại diện ──
    avatar,
    imageUrl,

    // ── Mô tả ──
    expertiseDescription: d.expertiseDescription ?? '',
    biography:            d.biography ?? '',

    // ── Thống kê (từ mock hoặc BE) ──
    rating:      d.rating ?? 4.8,
    reviewCount: d.reviewCount ?? d.totalReviews ?? 0,

    // ── Khác ──
    hospital: d.hospital ?? 'MedCare',
    tags:     d.tags ?? (d.specialtyName ? [d.specialtyName] : []),
  };
}
