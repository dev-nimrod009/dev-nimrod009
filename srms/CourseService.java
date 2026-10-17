package com.srms.service;

import com.srms.model.Course;
import com.srms.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service // Marks this class as the business logic layer
public class CourseService {

    private final CourseRepository courseRepository;

    @Autowired
    public CourseService(CourseRepository repo) {
        this.courseRepository = repo; // Inject CourseRepository
    }

    /**
     * Saves a course record after performing necessary validation.
     */
    public Course saveCourse(Course course) {
        // Validation logic (e.g., check for required fields)
        if (course.getCourseCode() == null || course.getCourseCode().trim().isEmpty()) {
            throw new IllegalArgumentException("Course Code is required.");
        }
        if (course.getCourseTitle() == null || course.getCourseTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Course Title is required.");
        }
        if (course.getCredits() <= 0) {
            throw new IllegalArgumentException("Credit hours must be greater than zero.");
        }

        return courseRepository.save(course); // Delegate to the Data Access Layer
    }

    /**
     * Retrieves all course records.
     */
    public List<Course> findAll() {
        return courseRepository.findAll();
    }

    /**
     * Retrieves a course by its ID.
     */
    public Optional<Course> findById(Long id) {
        return courseRepository.findById(id);
    }

    /**
     * Deletes a course by ID.
     */
    public void deleteById(Long id) {
        courseRepository.deleteById(id);
    }
}
