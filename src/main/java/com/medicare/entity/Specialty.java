package com.medicare.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Specialties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Specialty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;
}