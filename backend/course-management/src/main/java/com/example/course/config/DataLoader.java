package com.example.course.config;

import com.example.course.model.Course;
import com.example.course.repository.CourseRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner init(CourseRepository repo) {
        return args -> {
            if (repo.count() == 0) {
                repo.save(new Course("CS101", "Intro to Computer Science"));
                repo.save(new Course("CS202", "Data Structures"));
                repo.save(new Course("CS303", "Web Engineering"));
            }
        };
    }
}
