package com.fiveOps.promptforge.user_profile.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fiveOps.promptforge.user_profile.model.User;

public interface UserRepository extends JpaRepository<User, UUID> {
  Optional<User> findByEmail(String email);

  Optional<User> findByUsername(String username);

  boolean existsByEmail(String email);

  boolean existsByUsername(String username);

  List<User> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
      String usernamePart, String emailPart);

  void deleteByEmail(String email);
}
