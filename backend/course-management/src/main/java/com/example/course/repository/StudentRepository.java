// src/main/java/com/example/course/repository/StudentRepository.java
package com.example.course.repository;

import com.example.course.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {

    // Look up by registration number (unique)
    Optional<Student> findByRegNo(String regNo);

    // (optional) quick uniqueness checks used elsewhere
    boolean existsByRegNo(String regNo);
}
