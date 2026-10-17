package com.srms.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class DatabaseConfig {

    private static final String DB_URL = "jdbc:mysql://localhost:3306/";
    private static final String DB_NAME_SRMS = "srms_db";
    private static final String USER = "root";
    private static final String PASS = "your_mysql_password"; // **MUST UPDATE**

    private static final String SRMS_DB_URL = DB_URL + DB_NAME_SRMS;

    public static void initializeDatabase() {
        // 1. Create the Database if it doesn't exist (MANDATORY REQUIREMENT)
        try (Connection conn = DriverManager.getConnection(DB_URL, USER, PASS); Statement stmt = conn.createStatement()) {

            String createDbSql = "CREATE DATABASE IF NOT EXISTS " + DB_NAME_SRMS;
            stmt.executeUpdate(createDbSql);
            System.out.println("Database created/verified: " + DB_NAME_SRMS);

        } catch (SQLException e) {
            System.err.println("Error initializing database: " + e.getMessage());
            return;
        }

        // 2. Connect to the created database and create tables
        try (Connection conn = DriverManager.getConnection(SRMS_DB_URL, USER, PASS); Statement stmt = conn.createStatement()) {

            // Student Table
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

            // Course Table
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

            // Enrollment/Grade Table (FR3, FR4)
            String createEnrollmentTable = """
                CREATE TABLE IF NOT EXISTS enrollment (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    student_id BIGINT NOT NULL,
                    course_id BIGINT NOT NULL,
                    enrollment_date DATE NOT NULL,
                    grade_value DOUBLE,
                    
                    UNIQUE KEY unique_enrollment (student_id, course_id),
                    
                    FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
                    FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE CASCADE
                );
                """;
            stmt.executeUpdate(createEnrollmentTable);

        } catch (SQLException e) {
            System.err.println("Error creating tables: " + e.getMessage());
        }
    }
}
