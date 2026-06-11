package com.medicare.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DiseaseDiagnosisRequestDTO {
    private Integer diseaseId;
    private Boolean isPrimary;
}