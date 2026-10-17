package com.srms.controller;

import com.srms.model.Student;
import com.srms.service.StudentService;
import javafx.collections.FXCollections;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class StudentController {

    // FXML fields
    @FXML
    private TextField regNoField;
    @FXML
    private TextField firstNameField;
    @FXML
    private TextField lastNameField;
    @FXML
    private TextField emailField;
    @FXML
    private DatePicker dobPicker;
    @FXML
    private ComboBox<String> departmentCombo;
    @FXML
    private TableView<Student> studentTable;
    @FXML
    private Label statusLabel;

    // Table Columns
    @FXML
    private TableColumn<Student, String> regNoCol;
    @FXML
    private TableColumn<Student, String> firstNameCol;
    @FXML
    private TableColumn<Student, String> lastNameCol;
    @FXML
    private TableColumn<Student, String> emailCol;
    @FXML
    private TableColumn<Student, LocalDate> dobCol;
    @FXML
    private TableColumn<Student, String> departmentCol;
    @FXML
    private TableColumn<Student, LocalDate> enrollmentDateCol;

    // Internal tracking for the selected student's ID (for Update/Delete)
    private Long selectedStudentId = null;

    private final StudentService studentService;

    @Autowired
    public StudentController(StudentService service) {
        this.studentService = service;
    }

    /**
     * Initializes the controller: sets up columns, loads data, and adds
     * listener.
     */
    @FXML
    public void initialize() {
        // **STUDENT TASK:** Setup table columns
        regNoCol.setCellValueFactory(new PropertyValueFactory<>("registrationNumber"));
        firstNameCol.setCellValueFactory(new PropertyValueFactory<>("firstName"));
        lastNameCol.setCellValueFactory(new PropertyValueFactory<>("lastName"));
        emailCol.setCellValueFactory(new PropertyValueFactory<>("email"));
        dobCol.setCellValueFactory(new PropertyValueFactory<>("dateOfBirth"));
        departmentCol.setCellValueFactory(new PropertyValueFactory<>("department"));
        enrollmentDateCol.setCellValueFactory(new PropertyValueFactory<>("enrollmentDate"));

        // Add listener to table selection for 'Update' and 'Delete' tasks
        studentTable.getSelectionModel().selectedItemProperty().addListener(
                (observable, oldValue, newValue) -> populateForm(newValue));

        loadStudents(); // **STUDENT TASK:** Load initial data
    }

    /**
     * **STUDENT TASK:** Implements logic to populate the input fields when a
     * row in the table is selected.
     */
    private void populateForm(Student student) {
        if (student != null) {
            selectedStudentId = student.getId(); // Store ID for update/delete
            regNoField.setText(student.getRegistrationNumber());
            firstNameField.setText(student.getFirstName());
            lastNameField.setText(student.getLastName());
            emailField.setText(student.getEmail());
            dobPicker.setValue(student.getDateOfBirth());
            departmentCombo.setValue(student.getDepartment());
        } else {
            handleClearForm();
        }
    }

    // --- CRUD Event Handlers ---
    @FXML
    private void handleAddStudent() {
        try {
            // Check if we are trying to add or update
            if (selectedStudentId != null) {
                statusLabel.setText("Clear the form to add a new student.");
                return;
            }

            Student newStudent = new Student(
                    null,
                    regNoField.getText(),
                    firstNameField.getText(),
                    lastNameField.getText(),
                    emailField.getText(),
                    dobPicker.getValue(),
                    departmentCombo.getValue(),
                    LocalDate.now() // Enrollment Date
            );

            studentService.saveStudent(newStudent);

            handleClearForm();
            loadStudents();
            statusLabel.setText("Student " + newStudent.getRegistrationNumber() + " added successfully.");
        } catch (Exception e) {
            statusLabel.setText("Error adding student: " + e.getMessage());
        }
    }

    /**
     * **STUDENT TASK:** Implements handleUpdateStudent() method.
     */
    @FXML
    private void handleUpdateStudent() {
        if (selectedStudentId == null) {
            statusLabel.setText("Please select a student to update.");
            return;
        }

        try {
            // Create a student object with the currently selected ID and new form data
            Student updatedStudent = new Student(
                    selectedStudentId, // Crucial: Use the stored ID
                    regNoField.getText(),
                    firstNameField.getText(),
                    lastNameField.getText(),
                    emailField.getText(),
                    dobPicker.getValue(),
                    departmentCombo.getValue(),
                    studentService.findById(selectedStudentId).get().getEnrollmentDate() // Preserve original enrollment date
            );

            studentService.saveStudent(updatedStudent); // Save handles both Create and Update

            handleClearForm();
            loadStudents();
            statusLabel.setText("Student " + updatedStudent.getRegistrationNumber() + " updated successfully.");
        } catch (Exception e) {
            statusLabel.setText("Error updating student: " + e.getMessage());
        }
    }

    /**
     * **STUDENT TASK:** Implements handleDeleteStudent() method.
     */
    @FXML
    private void handleDeleteStudent() {
        if (selectedStudentId == null) {
            statusLabel.setText("Please select a student to delete.");
            return;
        }

        try {
            // Confirmation dialog is recommended here in a production application
            studentService.deleteById(selectedStudentId);

            handleClearForm();
            loadStudents();
            statusLabel.setText("Student deleted successfully.");
        } catch (Exception e) {
            statusLabel.setText("Error deleting student: " + e.getMessage());
        }
    }

    @FXML
    private void handleClearForm() {
        // Clears all input fields
        regNoField.clear();
        firstNameField.clear();
        lastNameField.clear();
        emailField.clear();
        dobPicker.setValue(null);
        departmentCombo.getSelectionModel().clearSelection();
        studentTable.getSelectionModel().clearSelection();
        selectedStudentId = null; // Reset the stored ID
        statusLabel.setText("");
    }

    /**
     * **STUDENT TASK:** Implements loadStudents() method to refresh the table
     * view.
     */
    private void loadStudents() {
        try {
            List<Student> students = studentService.findAll();
            studentTable.setItems(FXCollections.observableArrayList(students));
        } catch (Exception e) {
            statusLabel.setText("Error loading students: Check database connection.");
            // Log error: e.printStackTrace();
        }
    }
}
