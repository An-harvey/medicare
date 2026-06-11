package com.medicare.dto.response;

import com.medicare.enums.DispenseStatus;
import lombok.*;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class PrescriptionResponseDTO {
    private UUID prescriptionId;
    private UUID medicalRecordId;
    private String patientName;
    private DispenseStatus dispenseStatus; //
    private List<MedicineDetailDTO> medicines;

    @Getter
    @Setter
    @AllArgsConstructor
    public static class MedicineDetailDTO {
        private String medicineName;
        private Integer quantity;
        private String dosageInstructions;
    }

}