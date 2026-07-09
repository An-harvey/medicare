package com.medicare.service.clinical.impl;

import com.medicare.dto.response.PrescriptionResponseDTO;
import com.medicare.entity.Prescription;
import com.medicare.entity.PrescriptionDetail;
import com.medicare.enums.DispenseStatus;
import com.medicare.exception.CustomException;
import com.medicare.repository.PrescriptionDetailRepository;
import com.medicare.repository.PrescriptionRepository;
import com.medicare.service.clinical.PrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PrescriptionServiceImpl implements PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionDetailRepository prescriptionDetailRepository;

    @Override
    @Transactional(readOnly = true)
    public PrescriptionResponseDTO getPrescriptionByRecordId(UUID medicalRecordId) {
        Prescription prescription = prescriptionRepository.findByMedicalRecord_Id(medicalRecordId)
                .orElseThrow(() -> new CustomException("Không tìm thấy đơn thuốc của bệnh án này.", HttpStatus.NOT_FOUND));

        List<PrescriptionDetail> details = prescriptionDetailRepository.findByPrescription_Id(prescription.getId());

        List<PrescriptionResponseDTO.MedicineDetailDTO> medicineList = details.stream()
                .map(d -> new PrescriptionResponseDTO.MedicineDetailDTO(
                        d.getMedicine().getName(),
                        d.getQuantity(),
                        d.getDosageInstructions()))
                .collect(Collectors.toList());

        return PrescriptionResponseDTO.builder()
                .prescriptionId(prescription.getId())
                .medicalRecordId(prescription.getMedicalRecord().getId())
                .patientName(prescription.getMedicalRecord().getPatient().getUser().getFullName())
                .dispenseStatus(prescription.getDispenseStatus()) //
                .medicines(medicineList)
                .build();
    }

    @Override
    @Transactional
    public void updateDispenseStatus(UUID prescriptionId, DispenseStatus status) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new CustomException("Đơn thuốc không tồn tại.", HttpStatus.NOT_FOUND));
        prescription.setDispenseStatus(status); //
        prescriptionRepository.save(prescription);
    }
}