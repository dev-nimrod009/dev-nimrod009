package com.srms.repository;

import com.srms.model.Student;
import java.util.List;
import java.util.Optional;

/**
 * Interface defining the contract for Student data operations.
 */
public interface StudentRepository {

    // Create / Update (Save)
    Student save(Student student);

    // Read (Find)
    Optional<Student> findById(Long id);

    Optional<Student> findByRegistrationNumber(String regNo);

    List<Student> findAll();

    // Delete
    void deleteById(Long id);
}
