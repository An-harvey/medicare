package com.medicare.service.clinical;

import com.medicare.dto.response.PrescriptionResponseDTO;
import com.medicare.enums.DispenseStatus;
import java.util.UUID;

public interface PrescriptionService {
    // Người bệnh hoặc bác sĩ tra cứu đơn thuốc theo mã bệnh án
    PrescriptionResponseDTO getPrescriptionByRecordId(UUID medicalRecordId);

    // Nhân viên dược cập nhật trạng thái phát thuốc tại quầy
    void updateDispenseStatus(UUID prescriptionId, DispenseStatus status);
}