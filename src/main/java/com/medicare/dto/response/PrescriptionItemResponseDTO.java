package com.medicare.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionItemResponseDTO {
    private String medicineName;
    private String unit;
    private Integer quantity;
    private String dosageInstructions;
}
