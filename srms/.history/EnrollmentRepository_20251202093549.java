package com.srms.repository;

import com.srms.model.Enrollment;
import java.util.List;
import java.util.Optional;

/**
 * Interface defining the contract for Enrollment and Grade operations.
 */
public interface EnrollmentRepository {

    // Create / Update (Save Enrollment/Grade)
    Enrollment save(Enrollment enrollment);

    // Read (Find specific enrollment or list)
    Optional<Enrollment> findById(Long id);

    Optional<Enrollment> findByStudentAndCourse(Long studentId, Long courseId);

    List<Enrollment> findAllByStudentId(Long studentId);

    List<Enrollment> findAllByCourseId(Long courseId);

    // Delete
    void deleteById(Long id);
}
