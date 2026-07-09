package com.medicare.entity;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id; // Khóa chính tự tăng (INT)

    @Column(name = "role_name", length = 50, nullable = false)
    private String roleName; // Tên quyền (ADMIN, DOCTOR, STAFF, PATIENT)
}