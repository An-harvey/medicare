package com.medicare.dto.request;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecordCreateRequestDTO {
    private UUID appointmentId;
    private String clinicalDiagnosis;
    private String doctorNotes;
    private List<DiseaseDiagnosisRequestDTO> diseases;
    private List<MedicinePrescriptionRequestDTO> medicines; // Có thể null nếu không kê đơn
}