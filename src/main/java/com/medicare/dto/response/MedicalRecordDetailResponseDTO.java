package com.medicare.dto.response;

import com.medicare.enums.DispenseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecordDetailResponseDTO {
    private UUID medicalRecordId;
    private UUID appointmentId;
    private String patientName;
    private String doctorName;
    private String specialtyName;
    private LocalDate workDate;
    private String clinicalDiagnosis;
    private String doctorNotes;
    private List<String> diagnosedDiseases;
    private PrescriptionInfo prescription;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PrescriptionInfo {
        private UUID prescriptionId;
        private DispenseStatus dispenseStatus;
        private List<PrescriptionItemResponseDTO> items;
    }
}
