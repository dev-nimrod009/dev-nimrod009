package com.srms.model;

public class Course {

    private Long id;
    private String courseCode;
    private String courseTitle;
    private int credits;
    private String courseDescription; // Extension Field
    private String prerequisites;     // Extension Field

    // Constructors and Getters/Setters (omitted for brevity)
    public Course() {
    }

    public Course(Long id, String code, String title, int credits,
            String description, String prereqs) {
        this.id = id;
        this.courseCode = code;
        this.courseTitle = title;
        this.credits = credits;
        this.courseDescription = description;
        this.prerequisites = prereqs;
    }
}
