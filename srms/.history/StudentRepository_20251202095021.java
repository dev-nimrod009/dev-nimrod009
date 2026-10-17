package com.srms.repository;

import com.srms.model.Student;
import java.util.List;
import java.util.Optional;

/**
 * Interface defining the contract for Student data operations. In a Spring Data
 * project, this would extend JpaRepository.
 */
public interface StudentRepository {

    /**
     * * Creates or updates a student record.
     *
     * @param student The student object to persist.
     * @return The persisted student object, usually with a generated ID.
     */
    Student save(Student student);

    /**
     * Finds a student by their internal database ID.
     */
    Optional<Student> findById(Long id);

    /**
     * Finds a student by their unique registration number.
     */
    Optional<Student> findByRegistrationNumber(String regNo);

    /**
     * Retrieves all student records.
     */
    List<Student> findAll();

    /**
     * Deletes a student record by ID.
     */
    void deleteById(Long id);
}
