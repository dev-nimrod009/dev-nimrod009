package com.srms.controller;

import com.srms.model.Course;
import com.srms.service.CourseService;
import javafx.collections.FXCollections;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component // Spring Component for DI 
public class CourseController {

    // FXML fields linked to the UI components
    @FXML
    private TextField codeField;
    @FXML
    private TextField titleField;
    @FXML
    private TextField creditsField;
    @FXML
    private TextField prereqsField;
    @FXML
    private TextArea descriptionArea;

    @FXML
    private TableView<Course> courseTable;
    @FXML
    private Label statusLabel;

    // Table Columns
    @FXML
    private TableColumn<Course, String> codeCol;
    @FXML
    private TableColumn<Course, String> titleCol;
    @FXML
    private TableColumn<Course, Integer> creditsCol;
    @FXML
    private TableColumn<Course, String> prereqsCol;

    private Long selectedCourseId = null;

    // Dependency Injection for the Service Layer
    private final CourseService courseService;

    @Autowired
    public CourseController(CourseService service) {
        this.courseService = service; // Inject CourseService
    }

    @FXML
    public void initialize() {
        // Setup table columns
        codeCol.setCellValueFactory(new PropertyValueFactory<>("courseCode"));
        titleCol.setCellValueFactory(new PropertyValueFactory<>("courseTitle"));
        creditsCol.setCellValueFactory(new PropertyValueFactory<>("credits"));
        prereqsCol.setCellValueFactory(new PropertyValueFactory<>("prerequisites"));

        // Add listener to populate form on row selection
        courseTable.getSelectionModel().selectedItemProperty().addListener(
                (observable, oldValue, newValue) -> populateForm(newValue));

        loadCourses();
    }

    private void populateForm(Course course) {
        if (course != null) {
            selectedCourseId = course.getId();
            codeField.setText(course.getCourseCode());
            titleField.setText(course.getCourseTitle());
            creditsField.setText(String.valueOf(course.getCredits()));
            prereqsField.setText(course.getPrerequisites());
            descriptionArea.setText(course.getCourseDescription());
        } else {
            handleClearForm();
        }
    }

    // --- CRUD Event Handlers (FR2) ---
    @FXML
    private void handleAddCourse() {
        if (selectedCourseId != null) {
            return;
        }
        try {
            Course newCourse = new Course(
                    null,
                    codeField.getText(),
                    titleField.getText(),
                    Integer.parseInt(creditsField.getText()),
                    descriptionArea.getText(),
                    prereqsField.getText()
            );

            courseService.saveCourse(newCourse);

            handleClearForm();
            loadCourses();
            statusLabel.setText("Course " + newCourse.getCourseCode() + " added successfully.");
        } catch (NumberFormatException e) {
            statusLabel.setText("Error: Credits must be a valid number.");
        } catch (Exception e) {
            statusLabel.setText("Error adding course: " + e.getMessage());
        }
    }

    @FXML
    private void handleUpdateCourse() {
        if (selectedCourseId == null) {
            statusLabel.setText("Please select a course to update.");
            return;
        }

        try {
            Course updatedCourse = new Course(
                    selectedCourseId,
                    codeField.getText(),
                    titleField.getText(),
                    Integer.parseInt(creditsField.getText()),
                    descriptionArea.getText(),
                    prereqsField.getText()
            );

            courseService.saveCourse(updatedCourse);

            handleClearForm();
            loadCourses();
            statusLabel.setText("Course " + updatedCourse.getCourseCode() + " updated successfully.");
        } catch (NumberFormatException e) {
            statusLabel.setText("Error: Credits must be a valid number.");
        } catch (Exception e) {
            statusLabel.setText("Error updating course: " + e.getMessage());
        }
    }

    @FXML
    private void handleDeleteCourse() {
        if (selectedCourseId == null) {
            statusLabel.setText("Please select a course to delete.");
            return;
        }

        try {
            courseService.deleteById(selectedCourseId);
            handleClearForm();
            loadCourses();
            statusLabel.setText("Course deleted successfully.");
        } catch (Exception e) {
            statusLabel.setText("Error deleting course: " + e.getMessage());
        }
    }

    @FXML
    private void handleClearForm() {
        codeField.clear();
        titleField.clear();
        creditsField.clear();
        prereqsField.clear();
        descriptionArea.clear();
        courseTable.getSelectionModel().clearSelection();
        selectedCourseId = null;
        statusLabel.setText("");
    }

    private void loadCourses() {
        try {
            List<Course> courses = courseService.findAll();
            courseTable.setItems(FXCollections.observableArrayList(courses));
        } catch (Exception e) {
            statusLabel.setText("Error loading courses: Check database connection.");
        }
    }
}
