package com.example.course.controller;

import com.example.course.model.Course;
import com.example.course.repository.CourseRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseRepository repo;

    public CourseController(CourseRepository repo) {
        this.repo = repo;
    }

    // GET /api/courses -> all
    @GetMapping
    public List<Course> getAll() {
        return repo.findAll();
    }

    // GET /api/courses/{id} -> one
    @GetMapping("/{id}")
    public Course getOne(@PathVariable Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Course not found"));
    }

    // POST /api/courses -> create
    @PostMapping
    public Course create(@RequestBody Course c) {
        return repo.save(c);
    }

    // PUT /api/courses/{id} -> update
    @PutMapping("/{id}")
    public Course update(@PathVariable Long id, @RequestBody Course updated) {
        return repo.findById(id)
                .map(course -> {
                    course.setCode(updated.getCode());
                    course.setTitle(updated.getTitle());
                    return repo.save(course);
                })
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }

    // DELETE /api/courses/{id} -> delete
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repo.deleteById(id);
    }
}
