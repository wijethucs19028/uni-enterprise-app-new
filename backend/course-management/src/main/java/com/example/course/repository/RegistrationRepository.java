// package com.example.course.repository;

// import com.example.course.model.Registration;
// import org.springframework.data.jpa.repository.JpaRepository;

// import java.util.List;

// public interface RegistrationRepository extends JpaRepository<Registration, Long> {
//     List<Registration> findByStudent_Id(Long studentId);
//     List<Registration> findByCourse_Id(Long courseId);
//     List<Registration> findByStudent_IdAndSemester(Long studentId, String semester);
// }

package com.example.course.repository;

import com.example.course.model.Registration;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    // ------- eager fetchers to avoid LazyInitialization -------
    @EntityGraph(attributePaths = {"student", "course"})
    @Query("select r from Registration r")
    List<Registration> findAllWithRefs();

    @EntityGraph(attributePaths = {"student", "course"})
    @Query("select r from Registration r where r.id = :id")
    Optional<Registration> findByIdWithRefs(@Param("id") Long id);

    @EntityGraph(attributePaths = {"student", "course"})
    @Query("select r from Registration r where r.student.id = :studentId")
    List<Registration> findByStudentIdWithRefs(@Param("studentId") Long studentId);

    @EntityGraph(attributePaths = {"student", "course"})
    @Query("select r from Registration r where r.course.id = :courseId")
    List<Registration> findByCourseIdWithRefs(@Param("courseId") Long courseId);

    // (keep simple derived queries if you still need them elsewhere)
    List<Registration> findByStudent_Id(Long studentId);
    List<Registration> findByCourse_Id(Long courseId);
    List<Registration> findByStudent_IdAndSemester(Long studentId, String semester);
}

