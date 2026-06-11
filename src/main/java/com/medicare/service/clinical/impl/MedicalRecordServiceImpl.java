package com.medicare.service.clinical.impl;

import com.medicare.dto.request.MedicalRecordCreateRequestDTO;
import com.medicare.dto.request.MedicalRecordUpdateRequestDTO;
import com.medicare.dto.request.MedicinePrescriptionRequestDTO;
import com.medicare.dto.response.MedicalRecordDetailResponseDTO;
import com.medicare.dto.response.MedicalRecordResponseDTO;
import com.medicare.dto.response.PrescriptionItemResponseDTO;
import com.medicare.entity.*;
import com.medicare.enums.AppointmentStatus;
import com.medicare.enums.DispenseStatus;
import com.medicare.exception.CustomException;
import com.medicare.repository.*;
import com.medicare.service.clinical.MedicalRecordService;
import com.medicare.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalRecordServiceImpl implements MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final AppointmentRepository appointmentRepository;
    private final DiseaseRepository diseaseRepository;
    private final MedicineRepository medicineRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionDetailRepository prescriptionDetailRepository;
    private final RecordDiseaseRepository recordDiseaseRepository;

    @Override
    @Transactional
    public MedicalRecordResponseDTO createMedicalRecord(MedicalRecordCreateRequestDTO dto) {
        Appointment appointment = appointmentRepository.findById(dto.getAppointmentId())
                .orElseThrow(() -> new CustomException("Cuộc hẹn không tồn tại trên hệ thống.", HttpStatus.NOT_FOUND));

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new CustomException("Cuộc hẹn này đã hoàn thành và lập bệnh án trước đó.");
        }

        MedicalRecord record = MedicalRecord.builder()
                .appointment(appointment)
                .patient(appointment.getPatient())
                .doctor(appointment.getDoctor())
                .clinicalDiagnosis(dto.getClinicalDiagnosis())
                .doctorNotes(dto.getDoctorNotes())
                .build();

        if (dto.getDiseases() != null && !dto.getDiseases().isEmpty()) {
            boolean hasPrimary = dto.getDiseases().stream().anyMatch(d -> d.getIsPrimary() != null && d.getIsPrimary());
            if (!hasPrimary) {
                throw new CustomException("Bắt buộc phải chỉ định ít nhất một bệnh lý làm chẩn đoán chính.");
            }

            for (var dDto : dto.getDiseases()) {
                Disease disease = diseaseRepository.findById(dDto.getDiseaseId())
                        .orElseThrow(() -> new CustomException("Mã bệnh lý không tồn tại.", HttpStatus.NOT_FOUND));
                RecordDisease recordDisease = RecordDisease.builder()
                        .medicalRecord(record)
                        .disease(disease)
                        .isPrimary(dDto.getIsPrimary() != null ? dDto.getIsPrimary() : false)
                        .build();
                record.getRecordDiseases().add(recordDisease);
            }
        }

        MedicalRecord savedRecord = medicalRecordRepository.save(record);

        if (dto.getMedicines() != null && !dto.getMedicines().isEmpty()) {
            Prescription prescription = Prescription.builder()
                    .medicalRecord(savedRecord)
                    .dispenseStatus(DispenseStatus.PENDING)
                    .build();
            Prescription savedPrescription = prescriptionRepository.save(prescription);

            for (MedicinePrescriptionRequestDTO mDto : dto.getMedicines()) {
                Medicine medicine = medicineRepository.findById(mDto.getMedicineId())
                        .orElseThrow(() -> new CustomException("Thuốc không tồn tại trong danh mục.", HttpStatus.NOT_FOUND));
                PrescriptionDetail detail = PrescriptionDetail.builder()
                        .prescription(savedPrescription)
                        .medicine(medicine)
                        .quantity(mDto.getQuantity())
                        .dosageInstructions(mDto.getDosageInstructions())
                        .build();
                prescriptionDetailRepository.save(detail);
            }
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);

        return mapToRecordResponse(savedRecord);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicalRecordResponseDTO> getPatientRecords(UUID patientId) {
        List<MedicalRecord> records = medicalRecordRepository.findByPatient_PatientIdOrderByAppointment_Schedule_WorkDateDesc(patientId);
        return records.stream().map(this::mapToRecordResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicalRecordResponseDTO> getDoctorMedicalRecords(UUID doctorId) {
        List<MedicalRecord> records = medicalRecordRepository.findByDoctor_DoctorIdOrderByAppointment_Schedule_WorkDateDesc(doctorId);
        return records.stream().map(this::mapToRecordResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MedicalRecordResponseDTO getMedicalRecordDetails(UUID recordId) {
        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new CustomException("Không tìm thấy bệnh án.", HttpStatus.NOT_FOUND));
        return mapToRecordResponse(record);
    }

    @Override
    @Transactional
    public MedicalRecordResponseDTO updateMedicalRecord(UUID recordId, MedicalRecordUpdateRequestDTO dto) {
        UUID doctorId = SecurityUtils.getCurrentUserId();
        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new CustomException("Không tìm thấy bệnh án.", HttpStatus.NOT_FOUND));

        if (!record.getDoctor().getDoctorId().equals(doctorId)) {
            throw new CustomException("Bạn không có quyền chỉnh sửa bệnh án này.", HttpStatus.FORBIDDEN);
        }

        if (dto.getDiagnosis() != null) {
            record.setClinicalDiagnosis(dto.getDiagnosis());
        }
        if (dto.getNotes() != null) {
            record.setDoctorNotes(dto.getNotes());
        }

        MedicalRecord updatedRecord = medicalRecordRepository.save(record);
        return mapToRecordResponse(updatedRecord);
    }

    @Override
    @Transactional(readOnly = true)
    public MedicalRecordDetailResponseDTO getPatientMedicalRecordDetails(UUID recordId) {
        UUID patientId = SecurityUtils.getCurrentUserId();
        MedicalRecord record = medicalRecordRepository.findById(recordId)
                .orElseThrow(() -> new CustomException("Không tìm thấy bệnh án.", HttpStatus.NOT_FOUND));

        if (!record.getPatient().getPatientId().equals(patientId)) {
            throw new CustomException("Bạn không có quyền xem bệnh án này.", HttpStatus.FORBIDDEN);
        }

        return mapToRecordDetailResponse(record);
    }

    private MedicalRecordResponseDTO mapToRecordResponse(MedicalRecord entity) {
        List<String> diseaseNames = entity.getRecordDiseases().stream()
                .map(rd -> rd.getDisease().getName() + (rd.getIsPrimary() ? " (Chính)" : ""))
                .collect(Collectors.toList());

        return MedicalRecordResponseDTO.builder()
                .medicalRecordId(entity.getId())
                .appointmentId(entity.getAppointment().getId())
                .patientName(entity.getPatient().getUser().getFullName())
                .doctorName(entity.getDoctor().getUser().getFullName())
                .clinicalDiagnosis(entity.getClinicalDiagnosis())
                .doctorNotes(entity.getDoctorNotes())
                .diagnosedDiseases(diseaseNames)
                .build();
    }

    private MedicalRecordDetailResponseDTO mapToRecordDetailResponse(MedicalRecord entity) {
        List<String> diseaseNames = entity.getRecordDiseases().stream()
                .map(rd -> rd.getDisease().getName() + (rd.getIsPrimary() ? " (Chính)" : ""))
                .collect(Collectors.toList());

        MedicalRecordDetailResponseDTO.PrescriptionInfo prescriptionInfo = null;
        Prescription prescription = prescriptionRepository.findByMedicalRecord_Id(entity.getId()).orElse(null);

        if (prescription != null) {
            List<PrescriptionItemResponseDTO> prescriptionItems = prescription.getPrescriptionDetails().stream()
                    .map(pd -> PrescriptionItemResponseDTO.builder()
                            .medicineName(pd.getMedicine().getName())
                            .unit(pd.getMedicine().getUnit())
                            .quantity(pd.getQuantity())
                            .dosageInstructions(pd.getDosageInstructions())
                            .build())
                    .collect(Collectors.toList());

            prescriptionInfo = MedicalRecordDetailResponseDTO.PrescriptionInfo.builder()
                    .prescriptionId(prescription.getId())
                    .dispenseStatus(prescription.getDispenseStatus())
                    .items(prescriptionItems)
                    .build();
        }

        return MedicalRecordDetailResponseDTO.builder()
                .medicalRecordId(entity.getId())
                .appointmentId(entity.getAppointment().getId())
                .patientName(entity.getPatient().getUser().getFullName())
                .doctorName(entity.getDoctor().getUser().getFullName())
                .specialtyName(entity.getDoctor().getSpecialty().getName())
                .workDate(entity.getAppointment().getSchedule().getWorkDate())
                .clinicalDiagnosis(entity.getClinicalDiagnosis())
                .doctorNotes(entity.getDoctorNotes())
                .diagnosedDiseases(diseaseNames)
                .prescription(prescriptionInfo)
                .build();
    }
}
