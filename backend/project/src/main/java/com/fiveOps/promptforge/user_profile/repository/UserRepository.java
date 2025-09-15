package com.fiveOps.promptforge.user_profile.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fiveOps.promptforge.user_profile.model.User;

public interface UserRepository extends JpaRepository<User, UUID> {
  Optional<User> findByEmail(String email);

  Optional<User> findByUsername(String username);

  boolean existsByEmail(String email);

  boolean existsByUsername(String username);

  List<User> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
      String usernamePart, String emailPart);

  // Paginated search method
  Page<User> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
      String usernamePart, String emailPart, Pageable pageable);

  void deleteByEmail(String email);

  Optional<User> findByGoogleId(String googleId);

  Optional<User> findByResetToken(String resetToken);

  // Paginated followers and following queries using List instead of arrays
  @Query("SELECT u FROM User u WHERE u.userId IN :userIds")
  Page<User> findUsersByUserIds(@Param("userIds") List<UUID> userIds, Pageable pageable);

  // Paginated search methods using method naming convention
  Page<User> findByIsActiveTrueAndUsernameContainingIgnoreCase(String username, Pageable pageable);

  Page<User> findByIsActiveTrue(Pageable pageable);
}
