package com.medicare.entity;

import com.medicare.enums.AppointmentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "Appointments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "UNIQUEIDENTIFIER")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private PatientProfile patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private DoctorProfile doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false)
    private Schedule schedule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy; // Người thực hiện thao tác đặt lịch

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String symptoms;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private AppointmentStatus status = AppointmentStatus.PENDING;

    @Column(name = "cancel_reason", columnDefinition = "NVARCHAR(MAX)")
    private String cancelReason;
}