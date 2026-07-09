package com.medicare.dto.response.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TopDoctorResponseDTO {
    private UUID doctorId;
    private String name;
    private String academicTitle;
    private String specialty;
    private Double rating; // Assuming there is a rating, else just mock or ignore
    private Long totalAppointments;
}
