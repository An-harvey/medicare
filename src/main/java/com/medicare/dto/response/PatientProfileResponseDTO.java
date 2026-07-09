package com.medicare.dto.response;

import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientProfileResponseDTO {
    private UUID patientId;
    private String fullName;
    private String email;
    private String phone;
    private String cccd;
    private LocalDate dob;
    private String bloodType;
    private String allergyHistory;
    private String personalMedicalHistory;
    private String familyMedicalHistory;
    private String imageUrl;
}