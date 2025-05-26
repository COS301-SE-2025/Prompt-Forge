package com.example.promptforge.dashboard.dashboard_controller;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    
    private final JdbcTemplate jdbcTemplate;
    
    // Constructor injection
    public DashboardController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }
    
    @GetMapping("/total-prompts")
    public ResponseEntity<Long> getTotalPrompts() {
       
    }
    
    // More endpoints my dear...
}