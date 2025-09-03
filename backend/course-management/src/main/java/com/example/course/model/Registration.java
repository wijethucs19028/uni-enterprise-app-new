package com.example.course.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(
    name = "registration",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_student_course_semester",
        columnNames = {"student_id", "course_id", "semester"}
    )
)
public class Registration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // who
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    // what
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    // when
    @NotBlank
    @Column(nullable = false, length = 20)
    private String semester;   // e.g., "2025S1", "2025S2"

    // status/result
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RegistrationStatus status = RegistrationStatus.REGISTERED;

    // results (optional until COMPLETED)
    private Integer score;     // e.g., 0..100
    @Column(length = 5)
    private String grade;      // e.g., "A", "B+", etc.

    public Registration() {}

    public Long getId() { return id; }
    public Student getStudent() { return student; }
    public Course getCourse() { return course; }
    public String getSemester() { return semester; }
    public RegistrationStatus getStatus() { return status; }
    public Integer getScore() { return score; }
    public String getGrade() { return grade; }

    public void setId(Long id) { this.id = id; }
    public void setStudent(Student student) { this.student = student; }
    public void setCourse(Course course) { this.course = course; }
    public void setSemester(String semester) { this.semester = semester; }
    public void setStatus(RegistrationStatus status) { this.status = status; }
    public void setScore(Integer score) { this.score = score; }
    public void setGrade(String grade) { this.grade = grade; }
}
