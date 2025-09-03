package com.example.course.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "student", uniqueConstraints = {
        @UniqueConstraint(columnNames = "regNo"),
        @UniqueConstraint(columnNames = "email")
})
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true)
    private String regNo;        // e.g., IT2023-001

    @NotBlank
    @Column(nullable = false)
    private String fullName;     // e.g., Chirantha Perera

    @NotBlank
    @Email
    @Column(nullable = false, unique = true)
    private String email;

    public Student() {}
    public Student(String regNo, String fullName, String email) {
        this.regNo = regNo;
        this.fullName = fullName;
        this.email = email;
    }

    public Long getId() { return id; }
    public String getRegNo() { return regNo; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public void setId(Long id) { this.id = id; }
    public void setRegNo(String regNo) { this.regNo = regNo; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public void setEmail(String email) { this.email = email; }
}
