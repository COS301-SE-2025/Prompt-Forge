package com.fiveOps.promptforge.notifications.repository;

import com.fiveOps.promptforge.notifications.model.Notification;
import com.fiveOps.promptforge.user_profile.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Find notifications by user
    Page<Notification> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    // Find unread notifications by user
    List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(User user);
    
    // Count unread notifications
    long countByUserAndIsReadFalse(User user);
    
    // Find notifications by type
    List<Notification> findByUserAndTypeOrderByCreatedAtDesc(User user, String type);
    
    // Find notifications by prompt
    List<Notification> findByPromptIdOrderByCreatedAtDesc(UUID promptId);
    
    // Find recent notifications (last 30 days)
    @Query("SELECT n FROM Notification n WHERE n.user = :user " +
           "AND n.createdAt >= :since ORDER BY n.createdAt DESC")
    List<Notification> findRecentNotifications(@Param("user") User user, 
                                             @Param("since") LocalDateTime since);
    
    // Delete old notifications (older than specified date)
    void deleteByCreatedAtBefore(LocalDateTime date);
    
    // Find notifications for specific prompt and type
    List<Notification> findByPromptIdAndType(UUID promptId, String type);
    
    // Check if specific notification already exists (to avoid duplicates)
    boolean existsByUserAndPromptIdAndTypeAndCreatedAtAfter(
        User user, UUID promptId, String type, LocalDateTime after);
}
