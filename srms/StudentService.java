package com.srms.service;

import com.srms.model.Student;
import com.srms.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    @Autowired
    public StudentService(StudentRepository repo) {
        this.studentRepository = repo;
    }

    public Student saveStudent(Student student) {
        // Mandatory Validation:
        if (student.getRegistrationNumber() == null || student.getRegistrationNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("Registration Number is required.");
        }
        return studentRepository.save(student);
    }

    public List<Student> findAll() {
        return studentRepository.findAll();
    }

    public Optional<Student> findById(Long id) {
        return studentRepository.findById(id);
    }

    public void deleteById(Long id) {
        studentRepository.deleteById(id);
    }
}
