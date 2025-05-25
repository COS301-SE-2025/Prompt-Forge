package com.example.promptforge.user_profile.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String email;
    private String password;
    private String profilePicture;
    private String bio;

    // Add any relationship to prompts here if needed

    // Getters and setters
}
