package com.example.course.repository;

import com.example.course.model.Course;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class CourseRepositoryTest {

    @Autowired
    private CourseRepository repo;

    @Test
    void saveAndFindAll() {
        repo.save(new Course("UNIT200", "Unit Testing"));
        assertThat(repo.findAll())
                .extracting(Course::getCode)
                .contains("UNIT200");
    }
}
