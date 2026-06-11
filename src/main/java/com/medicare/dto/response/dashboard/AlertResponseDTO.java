package com.medicare.dto.response.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AlertResponseDTO {
    private String type; // "warning", "info", "success"
    private String message;
    private String actionLink; // Optional link for user to click
}
