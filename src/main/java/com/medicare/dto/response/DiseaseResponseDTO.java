package com.medicare.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level= AccessLevel.PRIVATE)
public class DiseaseResponseDTO {
     Integer id;
     String code; // Mã ICD
     String name;
     String description;
}