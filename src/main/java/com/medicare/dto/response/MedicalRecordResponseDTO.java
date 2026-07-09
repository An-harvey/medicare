package com.medicare.dto.response;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalRecordResponseDTO {
    private UUID medicalRecordId;
    private UUID appointmentId;
    private String patientName;
    private String doctorName;
    private String clinicalDiagnosis;
    private String doctorNotes;
    private List<String> diagnosedDiseases; // Danh sách tên các bệnh lý
}