package com.example.course.config;

import com.example.course.model.*;
import com.example.course.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {
    @Bean
    CommandLineRunner initData(CourseRepository courseRepo, StudentRepository studentRepo, RegistrationRepository regRepo) {
        return args -> {
            if (courseRepo.count() == 0) {
                courseRepo.save(new Course("CS101", "Intro to Computer Science"));
                courseRepo.save(new Course("CS202", "Data Structures"));
                courseRepo.save(new Course("CS303", "Web Engineering"));
            }
            if (studentRepo.count() == 0) {
                studentRepo.save(new Student("IT2025-001", "Ada Lovelace", "ada@example.com"));
                studentRepo.save(new Student("IT2025-002", "Alan Turing", "alan@example.com"));
            }
        };
    }
}
