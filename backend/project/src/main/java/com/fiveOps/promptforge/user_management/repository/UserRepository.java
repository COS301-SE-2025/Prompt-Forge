package com.fiveOps.promptforge.user_management.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fiveOps.promptforge.user_management.model.User;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);

}
