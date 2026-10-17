package com.srms.model;

import java.time.LocalDate;

public class Enrollment {

    private Long id;
    private Long studentId;
    private Long courseId;
    private LocalDate enrollmentDate;
    private Double gradeValue;

    // Constructors and Getters/Setters (omitted for brevity)
    public Enrollment() {
    }

    public Enrollment(Long id, Long studentId, Long courseId,
            LocalDate enrollmentDate, Double gradeValue) {
        this.id = id;
        this.studentId = studentId;
        this.courseId = courseId;
        this.enrollmentDate = enrollmentDate;
        this.gradeValue = gradeValue;
    }
}
