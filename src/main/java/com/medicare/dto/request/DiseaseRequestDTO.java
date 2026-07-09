package com.medicare.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE)
public class DiseaseRequestDTO {
    @NotBlank(message =" Không được bỏ trống")
    String code;
    @NotBlank(message =" Không được bỏ trống")
    String name;
    @NotBlank(message =" Không được bỏ trống")
    String description;

}
