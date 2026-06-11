package com.medicare.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineResponseDTO {
    private Integer id;
    private String name;
    private String unit;
    private String usageInstructions;
}