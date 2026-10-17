package com.srms.repository;

import com.srms.model.Course;
import java.util.List;
import java.util.Optional;

/**
 * Interface defining the contract for Course data operations.
 */
public interface CourseRepository {

    /**
     * Creates or updates a course record.
     */
    Course save(Course course);

    /**
     * Finds a course by its internal database ID.
     */
    Optional<Course> findById(Long id);

    /**
     * Finds a course by its unique course code.
     */
    Optional<Course> findByCourseCode(String courseCode);

    /**
     * Retrieves all course records.
     */
    List<Course> findAll();

    /**
     * Deletes a course record by ID.
     */
    void deleteById(Long id);
}
