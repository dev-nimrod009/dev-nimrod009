package com.srms.repository;

import com.srms.model.Enrollment;
import java.util.List;
import java.util.Optional;

/**
 * Interface defining the contract for Enrollment and Grade operations. This
 * manages the many-to-many relationship and the associated grade value.
 */
public interface EnrollmentRepository {

    /**
     * Creates a new enrollment record or updates an existing one (including
     * updating the grade).
     */
    Enrollment save(Enrollment enrollment);

    /**
     * Finds an enrollment record by its primary key ID.
     */
    Optional<Enrollment> findById(Long id);

    /**
     * Finds a specific enrollment by the unique combination of student and
     * course.
     */
    Optional<Enrollment> findByStudentAndCourse(Long studentId, Long courseId);

    /**
     * Retrieves all enrollments for a specific student (used for
     * transcripts/reporting).
     */
    List<Enrollment> findAllByStudentId(Long studentId);

    /**
     * Retrieves all enrollments for a specific course (used for class
     * lists/reporting).
     */
    List<Enrollment> findAllByCourseId(Long courseId);

    /**
     * Deletes an enrollment record by ID (e.g., student drops the course).
     */
    void deleteById(Long id);
}
