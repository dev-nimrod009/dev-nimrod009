package com.srms.service;

import com.srms.model.Student;
import com.srms.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service // Marks this class as the business logic layer 
public class StudentService {

    // Injects the repository contract (Dependency Injection)
    private final StudentRepository studentRepository;

    @Autowired
    public StudentService(StudentRepository repo) {
        this.studentRepository = repo; // Initialize the repository [cite: 84]
    }

    /**
     * Saves a student record after performing necessary validation. Fulfills
     * part of FR1 (Create/Update).
     */
    public Student saveStudent(Student student) {
        // Validation logic (Mandatory Requirement) 
        if (student.getRegistrationNumber() == null || student.getRegistrationNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("Registration Number is required."); // 
        }

        // Add more robust validation here (e.g., check for unique Reg No., valid email format)
        return studentRepository.save(student); // Delegate saving to the Data Access Layer [cite: 86]
    }

    /**
     * Retrieves all student records. Fulfills part of FR1 (Read).
     */
    public List<Student> findAll() {
        return studentRepository.findAll();
    }

    /**
     * Retrieves a student by their ID. Fulfills part of FR1 (Read).
     */
    public Optional<Student> findById(Long id) {
        return studentRepository.findById(id);
    }

    /**
     * Deletes a student by ID. Fulfills part of FR1 (Delete).
     */
    public void deleteById(Long id) {
        studentRepository.deleteById(id);
    }
}
