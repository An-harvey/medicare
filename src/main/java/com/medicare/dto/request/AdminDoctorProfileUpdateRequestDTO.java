package com.medicare.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminDoctorProfileUpdateRequestDTO {
    private String academicTitle;
    private String degree;
    private Integer experienceYears;
}