package com.medicare.service.clinical;

import com.medicare.dto.request.MedicalRecordCreateRequestDTO;
import com.medicare.dto.request.MedicalRecordUpdateRequestDTO;
import com.medicare.dto.response.MedicalRecordDetailResponseDTO;
import com.medicare.dto.response.MedicalRecordResponseDTO;

import java.util.List;
import java.util.UUID;

public interface MedicalRecordService {
    // Bác sĩ tiến hành lập bệnh án và kê đơn cho bệnh nhân
    MedicalRecordResponseDTO createMedicalRecord(MedicalRecordCreateRequestDTO dto);

    // Xem lịch sử bệnh án của một bệnh nhân cụ thể
    List<MedicalRecordResponseDTO> getPatientRecords(UUID patientId);

    // Bác sĩ xem lại danh sách bệnh án đã tạo
    List<MedicalRecordResponseDTO> getDoctorMedicalRecords(UUID doctorId);

    // Bác sĩ xem chi tiết một bệnh án
    MedicalRecordResponseDTO getMedicalRecordDetails(UUID recordId);

    // Bác sĩ cập nhật bệnh án
    MedicalRecordResponseDTO updateMedicalRecord(UUID recordId, MedicalRecordUpdateRequestDTO dto);

    // Bệnh nhân xem chi tiết bệnh án
    MedicalRecordDetailResponseDTO getPatientMedicalRecordDetails(UUID recordId);
}
