package com.medicare.service.billing.impl;

import com.medicare.dto.response.PaymentResponseDTO;
import com.medicare.entity.Appointment;
import com.medicare.enums.AppointmentStatus;
import com.medicare.repository.AppointmentRepository;
import com.medicare.service.billing.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final AppointmentRepository appointmentRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponseDTO> getAllPaidServices() {
        // Quét tất cả các cuộc hẹn có trạng thái COMPLETED để kết xuất báo cáo tài chính
        List<Appointment> completedAppointments = appointmentRepository.findAll().stream()
                .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                .collect(Collectors.toList());

        return completedAppointments.stream()
                .map(a -> PaymentResponseDTO.builder()
                        .appointmentId(a.getId())
                        .patientName(a.getPatient().getUser().getFullName())
                        .doctorName(a.getDoctor().getUser().getFullName())
                        .transactionDate(a.getSchedule().getWorkDate())
                        .serviceName("Phí Khám Chuyên Khoa: " + a.getDoctor().getSpecialty().getName())
                        .amount(150000.0) // Giả định đơn giá khám mặc định của bệnh viện
                        .status("ĐẤ THANH TOÁN (LÂM SÀNG HOÀN THÀNH)")
                        .build())
                .collect(Collectors.toList()); //
    }
}