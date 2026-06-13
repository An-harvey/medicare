package com.medicare.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "Doctor_Profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorProfile {

    @Id
    @Column(name = "doctor_id")
    private UUID doctorId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "doctor_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specialty_id", nullable = false)
    private Specialty specialty;

    @Column(name = "academic_title", length = 100)
    private String academicTitle;

    @Column(length = 100)
    private String degree;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(name = "expertise_description", columnDefinition = "NVARCHAR(MAX)")
    private String expertiseDescription;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String biography;

    @Column(name="fee")
    private BigDecimal fee;
}