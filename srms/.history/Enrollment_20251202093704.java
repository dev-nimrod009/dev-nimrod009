package com.srms.model;

import java.time.LocalDate;

public class Enrollment {

    private Long id;
    private Long studentId; // Foreign Key to Student table
    private Long courseId;  // Foreign Key to Course table
    private LocalDate enrollmentDate;
    private Double gradeValue; // Grade recorded for the student in this course

    // Default constructor
    public Enrollment() {
    }

    // Parameterized constructor
    public Enrollment(Long id, Long studentId, Long courseId,
            LocalDate enrollmentDate, Double gradeValue) {
        this.id = id;
        this.studentId = studentId;
        this.courseId = courseId;
        this.enrollmentDate = enrollmentDate;
        this.gradeValue = gradeValue;
    }

    // Getters and Setters (omitted for brevity)
}
