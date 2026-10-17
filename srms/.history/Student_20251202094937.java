package com.srms.model;

import java.time.LocalDate;

public class Student {

    private Long id;
    private String registrationNumber;
    private String firstName;
    private String lastName;
    private String email;          // Extended Field
    private LocalDate dateOfBirth; // Extended Field
    private String department;     // Extended Field
    private LocalDate enrollmentDate;

    // Default Constructor (Required by Spring/JPA/Deserialization)
    public Student() {
    }

    // Full Parameterized Constructor
    public Student(Long id, String regNo, String fName, String lName, String email,
            LocalDate dob, String dept, LocalDate enrollDate) {
        this.id = id;
        this.registrationNumber = regNo;
        this.firstName = fName;
        this.lastName = lName;
        this.email = email;
        this.dateOfBirth = dob;
        this.department = dept;
        this.enrollmentDate = enrollDate;
    }

    // --- Getters (Required for JavaFX TableView PropertyValueFactory) ---
    public Long getId() {
        return id;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public String getDepartment() {
        return department;
    }

    public LocalDate getEnrollmentDate() {
        return enrollmentDate;
    }

    // --- Setters (Required for form binding and database updates) ---
    public void setId(Long id) {
        this.id = id;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public void setEnrollmentDate(LocalDate enrollmentDate) {
        this.enrollmentDate = enrollmentDate;
    }
}
