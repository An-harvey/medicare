package com.medicare.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE)
public class DiseaseRequestDTO {
    String code;
    String name;
    String description;

}
