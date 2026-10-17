package com.srms;

import com.srms.config.DatabaseConfig;
import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

import java.io.IOException;

/**
 * Main application class responsible for bootstrapping both Spring Boot and
 * JavaFX. Note: A custom FXMLLoader is required to inject Spring dependencies
 * into JavaFX controllers.
 */
@SpringBootApplication
public class ApplicationLauncher extends Application {

    private ConfigurableApplicationContext springContext;

    public static void main(String[] args) {
        // CRITICAL REQUIREMENT: Initialize database before Spring starts 
        // to ensure the schema is ready for repositories.
        DatabaseConfig.initializeDatabase();

        launch(args);
    }

    @Override
    public void init() throws Exception {
        // Initialize the Spring context
        String[] args = getParameters().getRaw().toArray(new String[0]);
        springContext = SpringApplication.run(ApplicationLauncher.class, args);
    }

    @Override
    public void start(Stage stage) throws Exception {
        // 1. Get the Spring-aware FXMLLoader (requires a custom implementation/bean)
        FXMLLoader fxmlLoader = new FXMLLoader(getClass().getResource("/com/srms/view/StudentManagementView.fxml"));

        // Use the Spring context to set the Controller Factory
        fxmlLoader.setControllerFactory(springContext::getBean);

        try {
            Parent root = fxmlLoader.load();
            Scene scene = new Scene(root, 1000, 700);

            stage.setTitle("SRMS - Student Records Management System");
            stage.setScene(scene);
            stage.show();
        } catch (IOException e) {
            e.printStackTrace();
            System.exit(1);
        }
    }

    @Override
    public void stop() {
        // Close the Spring context when the JavaFX application shuts down
        springContext.close();
    }
}
