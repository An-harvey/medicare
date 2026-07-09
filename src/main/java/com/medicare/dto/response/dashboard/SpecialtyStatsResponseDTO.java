package com.medicare.dto.response.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SpecialtyStatsResponseDTO {
    private Integer specialtyId;
    private String specialtyName;
    private Long appointmentCount;
    private Double percentage;
}
