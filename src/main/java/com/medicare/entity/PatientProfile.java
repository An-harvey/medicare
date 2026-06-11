package com.medicare.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "Patient_Profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientProfile {

    @Id
    @Column(name = "patient_id")
    private UUID patientId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "patient_id")
    private User user;

    private LocalDate dob;

    @Column(name = "blood_type", length = 10)
    private String bloodType;

    @Column(name = "allergy_history", columnDefinition = "NVARCHAR(MAX)")
    private String allergyHistory;

    @Column(name = "personal_medical_history", columnDefinition = "NVARCHAR(MAX)")
    private String personalMedicalHistory;

    @Column(name = "family_medical_history", columnDefinition = "NVARCHAR(MAX)")
    private String familyMedicalHistory;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    
}