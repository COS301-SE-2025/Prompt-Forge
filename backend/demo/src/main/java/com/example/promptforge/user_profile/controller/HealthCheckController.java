package com.example.promptforge.user_profile.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@RestController
public class HealthCheckController {

    @Autowired
    private DataSource dataSource;

    @GetMapping("/db-status")
    public ResponseEntity<String> checkDbConnection() {
        try (Connection conn = dataSource.getConnection()) {
            if (conn != null && !conn.isClosed()) {
                return ResponseEntity.ok("✅ Connected to DB");
            }
        } catch (SQLException e) {
            return ResponseEntity.status(500).body("❌ DB Error: " + e.getMessage());
        }
        return ResponseEntity.status(500).body("❌ DB connection failed");
    }
}
