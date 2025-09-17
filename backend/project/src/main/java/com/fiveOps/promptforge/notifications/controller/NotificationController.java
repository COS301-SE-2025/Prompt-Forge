package com.fiveOps.promptforge.notifications.controller;

import com.fiveOps.promptforge.notifications.dto.NotificationDto;
import com.fiveOps.promptforge.notifications.service.NotificationService;
import com.fiveOps.promptforge.user_profile.model.User;
import com.fiveOps.promptforge.user_profile.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserService userService;

    /**
     * Get user's notifications with pagination
     */
    @GetMapping
    public ResponseEntity<Page<NotificationDto>> getNotifications(
            Authentication authentication, Pageable pageable) {
        
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            User user = userService.findByEmail(authentication.getName());
            if (user == null) {
                return ResponseEntity.status(401).build();
            }

            Page<NotificationDto> notifications = notificationService
                .getUserNotifications(user, pageable);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get unread notifications
     */
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDto>> getUnreadNotifications(
            Authentication authentication) {
        
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            User user = userService.findByEmail(authentication.getName());
            if (user == null) {
                return ResponseEntity.status(401).build();
            }

            List<NotificationDto> notifications = notificationService
                .getUnreadNotifications(user);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get unread notifications count
     */
    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            User user = userService.findByEmail(authentication.getName());
            if (user == null) {
                return ResponseEntity.status(401).build();
            }

            long count = notificationService.getUnreadCount(user);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Mark notification as read
     */
    @PostMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, Authentication authentication) {
        
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            User user = userService.findByEmail(authentication.getName());
            if (user == null) {
                return ResponseEntity.status(401).build();
            }

            notificationService.markAsRead(id, user);
            return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Mark all notifications as read
     */
    @PostMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(Authentication authentication) {
        
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            User user = userService.findByEmail(authentication.getName());
            if (user == null) {
                return ResponseEntity.status(401).build();
            }

            notificationService.markAllAsRead(user);
            return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Delete notification
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id, 
                                               Authentication authentication) {
        
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            User user = userService.findByEmail(authentication.getName());
            if (user == null) {
                return ResponseEntity.status(401).build();
            }

            notificationService.deleteNotification(id, user);
            return ResponseEntity.ok(Map.of("message", "Notification deleted"));
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
