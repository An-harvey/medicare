package com.medicare.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Medicines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 50)
    private String unit;

    @Column(name = "usage_instructions", columnDefinition = "NVARCHAR(MAX)")
    private String usageInstructions;
}
