package com.medicare.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE )
public class SpecialtyRequestDTO {
    @NotBlank(message = "Không được để trống ")
    String name;
    @NotBlank(message = "Không được để trống ")
    String description;
}
