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

    // FXML fields and Columns (defined in the FXML)
    @FXML
    private TextField regNoField, firstNameField, lastNameField, emailField;
    @FXML
    private DatePicker dobPicker;
    @FXML
    private ComboBox<String> departmentCombo;
    @FXML
    private TableView<Student> studentTable;
    @FXML
    private Label statusLabel;
    @FXML
    private TableColumn<Student, String> regNoCol;
    // ... other TableColumn declarations ...

    private Long selectedStudentId = null;
    private final StudentService studentService;

    @Autowired
    public StudentController(StudentService service) {
        this.studentService = service;
    }

    @FXML
    public void initialize() {
        // Setup table columns (Student Task)
        regNoCol.setCellValueFactory(new PropertyValueFactory<>("registrationNumber"));
        // ... other columns linked to Student model fields

        studentTable.getSelectionModel().selectedItemProperty().addListener(
                (observable, oldValue, newValue) -> populateForm(newValue));

        loadStudents(); // Load initial data
    }

    private void populateForm(Student student) { // Student Task
        if (student != null) {
            selectedStudentId = student.getId();
            regNoField.setText(student.getRegistrationNumber());
            // ... set other fields
        } else {
            handleClearForm();
        }
    }

    @FXML
    private void handleAddStudent() {
        if (selectedStudentId != null) {
            return;
        }
        try {
            // Logic to create and save new Student object 
            studentService.saveStudent(new Student(
                    null, regNoField.getText(), firstNameField.getText(), lastNameField.getText(),
                    emailField.getText(), dobPicker.getValue(), departmentCombo.getValue(), LocalDate.now()));
            handleClearForm();
            loadStudents();
            statusLabel.setText("Student added successfully.");
        } catch (Exception e) {
            statusLabel.setText("Error: " + e.getMessage());
        }
    }

    @FXML
    private void handleUpdateStudent() { // Student Task
        if (selectedStudentId == null) {
            return;
        }
        try {
            // Logic to create and save updated Student object with selectedStudentId
            studentService.saveStudent(new Student(selectedStudentId, /* new data */));
            handleClearForm();
            loadStudents();
            statusLabel.setText("Student updated successfully.");
        } catch (Exception e) {
            statusLabel.setText("Error: " + e.getMessage());
        }
    }

    @FXML
    private void handleDeleteStudent() { // Student Task
        if (selectedStudentId == null) {
            return;
        }
        try {
            studentService.deleteById(selectedStudentId);
            handleClearForm();
            loadStudents();
            statusLabel.setText("Student deleted successfully.");
        } catch (Exception e) {
            statusLabel.setText("Error: " + e.getMessage());
        }
    }

    @FXML
    private void handleClearForm() {
        regNoField.clear();
        // ... clear other fields and reset selectedStudentId = null;
    }

    private void loadStudents() { // Student Task
        try {
            List<Student> students = studentService.findAll();
            studentTable.setItems(FXCollections.observableArrayList(students));
        } catch (Exception e) {
            statusLabel.setText("Error loading students: Check database connection.");
        }
    }
}
