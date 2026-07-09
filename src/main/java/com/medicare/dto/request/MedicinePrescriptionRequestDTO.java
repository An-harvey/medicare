package com.medicare.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MedicinePrescriptionRequestDTO {
    private Integer medicineId;
    private Integer quantity;
    private String dosageInstructions;
}