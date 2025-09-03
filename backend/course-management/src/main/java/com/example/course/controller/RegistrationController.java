// package com.example.course.controller;

// import com.example.course.dto.RegistrationRequest;
// import com.example.course.model.*;
// import com.example.course.repository.*;
// import org.springframework.http.HttpStatus;
// import org.springframework.web.bind.annotation.*;
// import org.springframework.web.server.ResponseStatusException;

// import java.util.*;

// @RestController
// @RequestMapping("/api/registrations")
// public class RegistrationController {

//     private final RegistrationRepository regRepo;
//     private final StudentRepository studentRepo;
//     private final CourseRepository courseRepo;

//     public RegistrationController(RegistrationRepository regRepo,
//                                   StudentRepository studentRepo,
//                                   CourseRepository courseRepo) {
//         this.regRepo = regRepo;
//         this.studentRepo = studentRepo;
//         this.courseRepo = courseRepo;
//     }

//     // ------- helpers (map to simple response) -------
//     private Map<String, Object> toResponse(Registration r) {
//         Map<String, Object> m = new LinkedHashMap<>();
//         m.put("id", r.getId());
//         m.put("semester", r.getSemester());
//         m.put("status", r.getStatus().name());
//         m.put("score", r.getScore());
//         m.put("grade", r.getGrade());
//         Map<String, Object> s = new LinkedHashMap<>();
//         s.put("id", r.getStudent().getId());
//         s.put("regNo", r.getStudent().getRegNo());
//         s.put("fullName", r.getStudent().getFullName());
//         m.put("student", s);
//         Map<String, Object> c = new LinkedHashMap<>();
//         c.put("id", r.getCourse().getId());
//         c.put("code", r.getCourse().getCode());
//         c.put("title", r.getCourse().getTitle());
//         m.put("course", c);
//         return m;
//     }

//     // --- GPA helpers ---
//     private double gradeToPoints(String grade) {
//         if (grade == null) return -1; // unknown
//         return switch (grade.trim().toUpperCase()) {
//             case "A+", "A" -> 4.0;
//             case "A-"      -> 3.7;
//             case "B+"      -> 3.3;
//             case "B"       -> 3.0;
//             case "B-"      -> 2.7;
//             case "C+"      -> 2.3;
//             case "C"       -> 2.0;
//             case "C-"      -> 1.7;
//             case "D"       -> 1.0;
//             default        -> 0.0; // F or unknown
//         };
//     }

//     private String letterFromScore(Integer score) {
//         if (score == null) return null;
//         int s = score;
//         if (s >= 85) return "A";
//         if (s >= 80) return "A-";
//         if (s >= 75) return "B+";
//         if (s >= 70) return "B";
//         if (s >= 65) return "B-";
//         if (s >= 60) return "C+";
//         if (s >= 55) return "C";
//         if (s >= 50) return "C-";
//         if (s >= 45) return "D";
//         return "F";
//     }

//     // ------- queries -------
//     @GetMapping
//     public List<Map<String, Object>> all() {
//         return regRepo.findAll().stream().map(this::toResponse).toList();
//     }

//     @GetMapping("/by-student/{studentId}")
//     public List<Map<String, Object>> byStudent(@PathVariable Long studentId) {
//         return regRepo.findByStudent_Id(studentId).stream().map(this::toResponse).toList();
//     }

//     @GetMapping("/by-course/{courseId}")
//     public List<Map<String, Object>> byCourse(@PathVariable Long courseId) {
//         return regRepo.findByCourse_Id(courseId).stream().map(this::toResponse).toList();
//     }

//     // ------- transcript (per-student results + GPA) -------
//     @GetMapping("/transcript/by-student/{studentId}")
//     public Map<String, Object> transcriptByStudent(@PathVariable Long studentId) {
//         var regs = regRepo.findByStudent_Id(studentId);

//         var items = new ArrayList<Map<String, Object>>();
//         double totalPoints = 0.0;
//         int count = 0;

//         for (var r : regs) {
//             if (r.getStatus() != RegistrationStatus.COMPLETED) continue;

//             String grade = r.getGrade();
//             if ((grade == null || grade.isBlank()) && r.getScore() != null) {
//                 grade = letterFromScore(r.getScore());
//             }

//             Double points = null;
//             if (grade != null) {
//                 points = gradeToPoints(grade);
//                 totalPoints += points;
//                 count++;
//             }

//             var row = new LinkedHashMap<String, Object>();
//             row.put("registrationId", r.getId());
//             row.put("semester", r.getSemester());
//             row.put("course", Map.of(
//                     "id", r.getCourse().getId(),
//                     "code", r.getCourse().getCode(),
//                     "title", r.getCourse().getTitle()
//             ));
//             row.put("score", r.getScore());
//             row.put("grade", grade);
//             row.put("points", points);
//             items.add(row);
//         }

//         double gpa = (count == 0) ? 0.0 : Math.round((totalPoints / count) * 100.0) / 100.0;

//         var student = studentRepo.findById(studentId)
//                 .map(s -> Map.of("id", s.getId(), "regNo", s.getRegNo(), "fullName", s.getFullName(), "email", s.getEmail()))
//                 .orElse(Map.of("id", studentId));

//         return Map.of(
//                 "student", student,
//                 "completedCount", count,
//                 "gpa", gpa,
//                 "items", items
//         );
//     }

//     // ------- create -------
//     @PostMapping
//     @ResponseStatus(HttpStatus.CREATED)
//     public Map<String, Object> create(@RequestBody RegistrationRequest body) {
//         Student s = studentRepo.findById(body.studentId)
//                 .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid studentId"));
//         Course c = courseRepo.findById(body.courseId)
//                 .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid courseId"));

//         Registration r = new Registration();
//         r.setStudent(s);
//         r.setCourse(c);
//         r.setSemester(Objects.requireNonNullElse(body.semester, "2025S1"));
//         r.setStatus(body.status != null ? body.status : RegistrationStatus.REGISTERED);
//         r.setScore(body.score);
//         r.setGrade(body.grade);

//         // unique constraint: (student, course, semester)
//         try {
//             Registration saved = regRepo.save(r);
//             return toResponse(saved);
//         } catch (Exception ex) {
//             throw new ResponseStatusException(HttpStatus.CONFLICT,
//                     "Registration already exists for this student/course/semester");
//         }
//     }

//     // ------- update (status/score/grade/semester) -------
//     @PutMapping("/{id}")
//     public Map<String, Object> update(@PathVariable Long id, @RequestBody RegistrationRequest body) {
//         Registration r = regRepo.findById(id)
//                 .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registration not found"));

//         if (body.semester != null && !body.semester.isBlank()) r.setSemester(body.semester);
//         if (body.status != null) r.setStatus(body.status);
//         if (body.score != null) r.setScore(body.score);
//         if (body.grade != null) r.setGrade(body.grade);

//         // allow changing course/student if IDs provided
//         if (body.studentId != null) {
//             Student s = studentRepo.findById(body.studentId)
//                     .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid studentId"));
//             r.setStudent(s);
//         }
//         if (body.courseId != null) {
//             Course c = courseRepo.findById(body.courseId)
//                     .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid courseId"));
//             r.setCourse(c);
//         }

//         try {
//             return toResponse(regRepo.save(r));
//         } catch (Exception ex) {
//             throw new ResponseStatusException(HttpStatus.CONFLICT,
//                     "Duplicate registration for student/course/semester");
//         }
//     }

//     // ------- delete -------
//     @DeleteMapping("/{id}")
//     @ResponseStatus(HttpStatus.NO_CONTENT)
//     public void delete(@PathVariable Long id) {
//         regRepo.deleteById(id);
//     }
// }


package com.example.course.controller;

import com.example.course.dto.RegistrationRequest;
import com.example.course.model.*;
import com.example.course.repository.*;
import com.example.course.security.OwnershipService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    private final RegistrationRepository regRepo;
    private final StudentRepository studentRepo;
    private final CourseRepository courseRepo;
    private final OwnershipService ownership;

    public RegistrationController(RegistrationRepository regRepo,
                                  StudentRepository studentRepo,
                                  CourseRepository courseRepo,
                                  OwnershipService ownership) {
        this.regRepo = regRepo;
        this.studentRepo = studentRepo;
        this.courseRepo = courseRepo;
        this.ownership = ownership;
    }

    // ------- helpers (map to simple response) -------
    private Map<String, Object> toResponse(Registration r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", r.getId());
        m.put("semester", r.getSemester());
        m.put("status", r.getStatus().name());
        m.put("score", r.getScore());
        m.put("grade", r.getGrade());

        Student st = r.getStudent();
        if (st != null) {
            Map<String, Object> s = new LinkedHashMap<>();
            s.put("id", st.getId());
            s.put("regNo", st.getRegNo());
            s.put("fullName", st.getFullName());
            m.put("student", s);
        }

        Course co = r.getCourse();
        if (co != null) {
            Map<String, Object> c = new LinkedHashMap<>();
            c.put("id", co.getId());
            c.put("code", co.getCode());
            c.put("title", co.getTitle());
            m.put("course", c);
        }
        return m;
    }

    // --- GPA helpers ---
    private double gradeToPoints(String grade) {
        if (grade == null) return -1;
        return switch (grade.trim().toUpperCase()) {
            case "A+", "A" -> 4.0;
            case "A-"      -> 3.7;
            case "B+"      -> 3.3;
            case "B"       -> 3.0;
            case "B-"      -> 2.7;
            case "C+"      -> 2.3;
            case "C"       -> 2.0;
            case "C-"      -> 1.7;
            case "D"       -> 1.0;
            default        -> 0.0;
        };
    }

    private String letterFromScore(Integer score) {
        if (score == null) return null;
        int s = score;
        if (s >= 85) return "A";
        if (s >= 80) return "A-";
        if (s >= 75) return "B+";
        if (s >= 70) return "B";
        if (s >= 65) return "B-";
        if (s >= 60) return "C+";
        if (s >= 55) return "C";
        if (s >= 50) return "C-";
        if (s >= 45) return "D";
        return "F";
    }

    // ------- queries -------

    /** Admin only: list all registrations */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> all() {
        return regRepo.findAllWithRefs().stream().map(this::toResponse).toList();
    }
    

    /** Admin + owner can view by ID */
    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> one(@PathVariable Long id, Authentication auth) {
        return regRepo.findByIdWithRefs(id)
            .map(r -> {
                if (isAdmin(auth) || owns(auth, r.getStudent().getId())) {
                    return ResponseEntity.ok(toResponse(r));
                }
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your registration");
            })
            .orElse(ResponseEntity.notFound().build());
    }

    /** Student can only see their own; Admin can see any */
    @GetMapping("/by-student/{studentId}")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> byStudent(@PathVariable Long studentId, Authentication auth) {
        if (!isAdmin(auth) && !owns(auth, studentId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your data");
        }
        return regRepo.findByStudentIdWithRefs(studentId).stream().map(this::toResponse).toList();
    }

    /** Convenience endpoint for students to fetch their own registrations */
    @GetMapping("/my")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> my(Authentication auth) {
        Long sid = ownership.studentIdFor(auth.getName())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "No student bound to user"));
        return regRepo.findByStudentIdWithRefs(sid).stream().map(this::toResponse).toList();
    }

    @GetMapping("/by-course/{courseId}")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> byCourse(@PathVariable Long courseId, Authentication auth) {
        // Students shouldn't see everyone else in a course; keep this ADMIN-only.
        if (!isAdmin(auth)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admins only");
        }
        return regRepo.findByCourseIdWithRefs(courseId).stream().map(this::toResponse).toList();
    }

    /** Per-student transcript (owner or admin) */
    @GetMapping("/transcript/by-student/{studentId}")
    @Transactional(readOnly = true)
    public Map<String, Object> transcriptByStudent(@PathVariable Long studentId, Authentication auth) {
        if (!isAdmin(auth) && !owns(auth, studentId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your data");
        }

        var regs = regRepo.findByStudentIdWithRefs(studentId);
        var items = new ArrayList<Map<String, Object>>();
        double totalPoints = 0.0;
        int count = 0;

        for (var r : regs) {
            if (r.getStatus() != RegistrationStatus.COMPLETED) continue;
            String grade = r.getGrade();
            if ((grade == null || grade.isBlank()) && r.getScore() != null) {
                grade = letterFromScore(r.getScore());
            }
            Double points = null;
            if (grade != null) {
                points = gradeToPoints(grade);
                totalPoints += points;
                count++;
            }
            var row = new LinkedHashMap<String, Object>();
            row.put("registrationId", r.getId());
            row.put("semester", r.getSemester());
            row.put("course", Map.of(
                    "id", r.getCourse().getId(),
                    "code", r.getCourse().getCode(),
                    "title", r.getCourse().getTitle()
            ));
            row.put("score", r.getScore());
            row.put("grade", grade);
            row.put("points", points);
            items.add(row);
        }

        double gpa = (count == 0) ? 0.0 : Math.round((totalPoints / count) * 100.0) / 100.0;

        var student = studentRepo.findById(studentId)
                .map(s -> Map.of("id", s.getId(), "regNo", s.getRegNo(), "fullName", s.getFullName(), "email", s.getEmail()))
                .orElse(Map.of("id", studentId));

        return Map.of(
                "student", student,
                "completedCount", count,
                "gpa", gpa,
                "items", items
        );
    }

    // ------- create -------
    /** Admin can create for anyone; Student can only create for themselves */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> create(@RequestBody RegistrationRequest body, Authentication auth) {
        if (!isAdmin(auth)) {
            var sid = ownership.studentIdFor(auth.getName())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "No student bound to user"));
            if (body.studentId == null || !Objects.equals(body.studentId, sid)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Students can only create their own registrations");
            }
        }

        Student s = studentRepo.findById(body.studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid studentId"));
        Course c = courseRepo.findById(body.courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid courseId"));

        Registration r = new Registration();
        r.setStudent(s);
        r.setCourse(c);
        r.setSemester(Objects.requireNonNullElse(body.semester, "2025S1"));
        r.setStatus(body.status != null ? body.status : RegistrationStatus.REGISTERED);
        r.setScore(body.score);
        r.setGrade(body.grade);

        try {
            Registration saved = regRepo.save(r);
            return toResponse(saved);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Registration already exists for this student/course/semester");
        }
    }

    /** Admin only for now */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> update(@PathVariable Long id, @RequestBody RegistrationRequest body) {
        Registration r = regRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registration not found"));

        if (body.semester != null && !body.semester.isBlank()) r.setSemester(body.semester);
        if (body.status != null) r.setStatus(body.status);
        if (body.score != null) r.setScore(body.score);
        if (body.grade != null) r.setGrade(body.grade);

        if (body.studentId != null) {
            Student s = studentRepo.findById(body.studentId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid studentId"));
            r.setStudent(s);
        }
        if (body.courseId != null) {
            Course c = courseRepo.findById(body.courseId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid courseId"));
            r.setCourse(c);
        }

        try {
            Registration saved = regRepo.save(r);
            return regRepo.findByIdWithRefs(saved.getId())
                    .map(this::toResponse)
                    .orElseGet(() -> toResponse(saved));
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Duplicate registration for student/course/semester");
        }
    }

    /** Admin only (keep simple) */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        regRepo.deleteById(id);
    }

    // ------- util -------
    private boolean isAdmin(Authentication auth) {
        return auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    private boolean owns(Authentication auth, Long studentId) {
        return ownership.studentIdFor(auth.getName()).map(studentId::equals).orElse(false);
    }
}
