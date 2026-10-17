package com.srms.repository;

import com.srms.model.Course;
import java.util.List;
import java.util.Optional;

/**
 * Interface defining the contract for Course data operations.
 */
public interface CourseRepository {

    // Create / Update (Save)
    Course save(Course course);

    // Read (Find)
    Optional<Course> findById(Long id);

    List<Course> findAll();

    // Delete
    void deleteById(Long id);
}
