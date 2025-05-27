// src/main/java/com/example/promptforge/user/UserRepository.java
package com.example.promptforge.dashboard.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
}