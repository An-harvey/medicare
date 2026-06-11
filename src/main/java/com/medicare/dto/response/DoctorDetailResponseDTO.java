package com.medicare.dto.response;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorDetailResponseDTO {
    private UUID doctorId;
    private String fullName;
    private String email;
    private String phone;
    private Integer specialtyId;
    private String specialtyName;
    private String academicTitle;
    private String degree;
    private Integer experienceYears;
    private String imageUrl;
    private String expertiseDescription;
    private String biography;
}