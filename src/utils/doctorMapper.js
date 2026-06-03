import { getImageUrl } from './constants';

/** Chuẩn hóa DoctorResponseDTO từ BE → field UI */
export function mapDoctorFromApi(d) {
  if (!d) return null;
  return {
    id:              d.id,
    name:            d.fullName,
    fullName:        d.fullName,
    avatar:          getImageUrl(d.imageUrl),
    imageUrl:        d.imageUrl,
    degree:          d.academicTitle || d.degree,
    academicTitle:   d.academicTitle,
    specialty:       d.specialtyName,
    specialtyName:   d.specialtyName,
    experience:      d.experienceYears,
    experienceYears: d.experienceYears,
    expertiseDescription: d.expertiseDescription || '',
    biography:       d.biography || '',
    hospital:        d.hospital || 'MedCare Clinic',
    rating:          d.rating ?? 0,
    reviewCount:     d.reviewCount ?? 0,
    price:           d.consultationFee ?? 0,
    tags:            d.tags ?? [],
  };
}
