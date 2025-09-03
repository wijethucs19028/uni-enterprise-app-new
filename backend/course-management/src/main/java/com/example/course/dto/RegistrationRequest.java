package com.example.course.dto;

import com.example.course.model.RegistrationStatus;

public class RegistrationRequest {
    public Long studentId;
    public Long courseId;
    public String semester;                 // e.g., "2025S1"
    public RegistrationStatus status;       // optional on create (defaults REGISTERED)
    public Integer score;                   // optional
    public String grade;                    // optional
}
