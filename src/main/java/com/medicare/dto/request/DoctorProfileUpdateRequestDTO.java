package com.medicare.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DoctorProfileUpdateRequestDTO {
    private String imageUrl;
    private String expertiseDescription;
    private String biography;
}