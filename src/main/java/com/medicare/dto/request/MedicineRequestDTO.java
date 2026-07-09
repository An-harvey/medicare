package com.medicare.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@FieldDefaults(level= AccessLevel.PRIVATE)
public class MedicineRequestDTO {
    @NotBlank
    String name;
    @NotBlank
    String unit;
    @NotBlank
    String usageInstructions;
}
