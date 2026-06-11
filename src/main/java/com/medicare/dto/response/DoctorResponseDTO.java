package com.medicare.dto.response;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorResponseDTO {
    private UUID id; // Lấy từ User
    private String fullName; // Lấy từ User
    private String imageUrl; // Lấy từ DoctorProfile
    private String academicTitle; // Lấy từ DoctorProfile
    private String specialtyName; // Lấy từ Specialty
    private Integer experienceYears; // Lấy từ DoctorProfile
}