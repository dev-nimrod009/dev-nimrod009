package com.srms.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class DatabaseConfig {

    // NOTE: In a real Spring Boot app, these would be read from application.properties
    private static final String DB_URL = "jdbc:mysql://localhost:3306/"; // Connect without specifying DB initially
    private static final String DB_NAME_SRMS = "srms_db";
    private static final String USER = "root"; 
    private static final String PASS = "your_mysql_password"; // Update this!
    
    // URL for connecting directly to the SRMS database
    private static final String SRMS_DB_URL = DB_URL + DB_NAME_SRMS;

    /**
     * Handles automatic database and table creation on first run.
     * Fulfills FR6 and the mandatory requirement.
     */
    public static void initializeDatabase() {
        // 1. Create the Database if it doesn't exist (Mandatory Requirement) [cite: 21, 91]
        try (Connection conn = DriverManager.getConnection(DB_URL, USER, PASS);
             Statement stmt = conn.createStatement()) {
            
            // The mandatory requirement:
            String createDbSql = "CREATE DATABASE IF NOT EXISTS " + DB_NAME_SRMS; [cite: 91]
            stmt.executeUpdate(createDbSql);
            System.out.println("Database created/verified: " + DB_NAME_SRMS); [cite: 92]
            
        } catch (SQLException e) {
            System.err.println("Error initializing database: " + e.getMessage());
            e.printStackTrace();
            return; // Exit if the database cannot be created
        }

        // 2. Connect to the created database and create tables
        try (Connection conn = DriverManager.getConnection(SRMS_DB_URL, USER, PASS);
             Statement stmt = conn.createStatement()) {

            // --- SQL Statement for Student Table (FR1) ---
            String createStudentTable = """
                CREATE TABLE IF NOT EXISTS student (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    registration_number VARCHAR(20) UNIQUE NOT NULL,
                    first_name VARCHAR(100) NOT NULL,
                    last_name VARCHAR(100) NOT NULL,
                    email VARCHAR(100),
                    date_of_birth DATE,
                    department VARCHAR(100),
                    enrollment_date DATE
                );
                """;
            stmt.executeUpdate(createStudentTable);
            System.out.println("Table 'student' created/verified.");
            
            // --- SQL Statement for Course Table (FR2) ---
            String createCourseTable = """
                CREATE TABLE IF NOT EXISTS course (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    course_code VARCHAR(10) UNIQUE NOT NULL,
                    course_title VARCHAR(255) NOT NULL,
                    credits INT NOT NULL,
                    course_description TEXT,
                    prerequisites VARCHAR(255)
                );
                """;
            stmt.executeUpdate(createCourseTable);
            System.out.println("Table 'course' created/verified.");
            
            // --- SQL Statement for Enrollment and Grade Table (FR3, FR4) ---
            // This table must link students to courses and store grade information. [cite: 96]
            String createEnrollmentTable = """
                CREATE TABLE IF NOT EXISTS enrollment (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    student_id BIGINT NOT NULL,
                    course_id BIGINT NOT NULL,
                    enrollment_date DATE NOT NULL, [cite: 97]
                    grade_value DOUBLE,           -- Tracks academic performance [cite: 34]
                    
                    UNIQUE KEY unique_enrollment (student_id, course_id),
                    
                    -- Foreign Key Constraints [cite: 97]
                    FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
                    FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE CASCADE
                );
                """;
            stmt.executeUpdate(createEnrollmentTable);
            System.out.println("Table 'enrollment' (including grade fields) created/verified."); [cite: 95]

        } catch (SQLException e) {
             System.err.println("Error creating tables: " + e.getMessage());
             e.printStackTrace();
        }
    }
}