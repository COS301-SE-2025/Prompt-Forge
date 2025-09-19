package com.fiveOps.promptforge.notifications.service;

import com.fiveOps.promptforge.notifications.dto.NotificationDto;
import com.fiveOps.promptforge.notifications.model.Notification;
import com.fiveOps.promptforge.notifications.repository.NotificationRepository;
import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.prompts.service.PromptInteractionService;
import com.fiveOps.promptforge.user_profile.model.User;
import com.fiveOps.promptforge.user_profile.service.UserService;
import com.fiveOps.promptforge.util.service.MailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private PromptInteractionService promptInteractionService;

    @Autowired
    private MailService mailService;

    // Notification types
    public static final String BOUNCE_RATE_ALERT = "BOUNCE_RATE_ALERT";
    public static final String PROMPT_VIEWED = "PROMPT_VIEWED";
    public static final String PROMPT_PURCHASED = "PROMPT_PURCHASED";
    public static final String PROMPT_ADDED_TO_CART = "PROMPT_ADDED_TO_CART";
    public static final String HIGH_ENGAGEMENT = "HIGH_ENGAGEMENT";
    public static final String WEEKLY_SUMMARY = "WEEKLY_SUMMARY";

    /**
     * Create a notification for a user
     */
    @Transactional
    public Notification createNotification(User user, UUID promptId, String type, 
                                         String title, String message) {
        Notification notification = new Notification(user, promptId, type, title, message);
        return notificationRepository.save(notification);
    }

    /**
     * Create a notification without prompt reference
     */
    @Transactional
    public Notification createNotification(User user, String type, String title, String message) {
        Notification notification = new Notification(user, type, title, message);
        return notificationRepository.save(notification);
    }

    /**
     * Get notifications for a user with pagination
     */
    public Page<NotificationDto> getUserNotifications(User user, Pageable pageable) {
        Page<Notification> notifications = notificationRepository
            .findByUserOrderByCreatedAtDesc(user, pageable);
        return notifications.map(this::convertToDto);
    }

    /**
     * Get unread notifications for a user
     */
    public List<NotificationDto> getUnreadNotifications(User user) {
        List<Notification> notifications = notificationRepository
            .findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
        return notifications.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    /**
     * Count unread notifications
     */
    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    /**
     * Mark notification as read
     */
    @Transactional
    public void markAsRead(Long notificationId, User user) {
        notificationRepository.findById(notificationId)
            .filter(notification -> notification.getUser().getUserId().equals(user.getUserId()))
            .ifPresent(notification -> {
                notification.markAsRead();
                notificationRepository.save(notification);
            });
    }

    /**
     * Mark all notifications as read for a user
     */
    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> unreadNotifications = notificationRepository
            .findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
        
        unreadNotifications.forEach(notification -> {
            notification.markAsRead();
        });
        
        notificationRepository.saveAll(unreadNotifications);
    }

    /**
     * Delete a notification
     */
    @Transactional
    public void deleteNotification(Long notificationId, User user) {
        notificationRepository.findById(notificationId)
            .filter(notification -> notification.getUser().getUserId().equals(user.getUserId()))
            .ifPresent(notificationRepository::delete);
    }

    /**
     * Check bounce rate and create alert if necessary
     */
    @Async
    public void checkBounceRateAndNotify(Prompt prompt) {
        try {
            double bounceRate = promptInteractionService.getPromptBounceRate(prompt);
            
            // Alert if bounce rate is high (above 75%)
            if (bounceRate > 75.0) {
                User promptOwner = userService.findById(prompt.getAuthorId());
                if (promptOwner != null) {
                    // Check if we haven't sent this alert recently (within last 24 hours)
                    LocalDateTime yesterday = LocalDateTime.now().minusHours(24);
                    boolean recentAlertExists = notificationRepository
                        .existsByUserAndPromptIdAndTypeAndCreatedAtAfter(
                            promptOwner, prompt.getId(), BOUNCE_RATE_ALERT, yesterday);
                    
                    if (!recentAlertExists) {
                        String title = "High Bounce Rate Alert";
                        String message = String.format(
                            "Your prompt '%s' has a bounce rate of %.1f%%. " +
                            "Consider optimizing your prompt description or pricing.",
                            prompt.getTitle(), bounceRate);
                        
                        createNotification(promptOwner, prompt.getId(), 
                                         BOUNCE_RATE_ALERT, title, message);
                        
                        // Send email notification
                        sendEmailNotification(promptOwner, title, message);
                    }
                }
            }
        } catch (Exception e) {
            // Log error but don't throw to avoid affecting main flow
            System.err.println("Error checking bounce rate: " + e.getMessage());
        }
    }

    /**
     * Notify prompt owner about interaction
     */
    @Async
    public void notifyPromptInteraction(Prompt prompt, String action, User interactingUser) {
        try {
            User promptOwner = userService.findById(prompt.getAuthorId());
            if (promptOwner != null 
                && !promptOwner.getUserId().equals(interactingUser.getUserId())) {
                String title;
                String message;
                String type;
                
                switch (action) {
                    case "VIEW":
                        type = PROMPT_VIEWED;
                        title = "Prompt Viewed";
                        message = String.format("%s viewed your prompt '%s'", 
                                               interactingUser.getUsername(), prompt.getTitle());
                        break;
                    case "ADD_TO_CART":
                        type = PROMPT_ADDED_TO_CART;
                        title = "Prompt Added to Cart";
                        message = String.format("%s added your prompt '%s' to their cart", 
                                               interactingUser.getUsername(), prompt.getTitle());
                        break;
                    case "PURCHASE":
                        type = PROMPT_PURCHASED;
                        title = "Prompt Purchased!";
                        message = String.format("%s purchased your prompt '%s'", 
                                               interactingUser.getUsername(), prompt.getTitle());
                        // Send email for purchases
                        sendEmailNotification(promptOwner, title, message);
                        break;
                    default:
                        return; // Don't create notification for unknown actions
                }
                
                createNotification(promptOwner, prompt.getId(), type, title, message);
            }
        } catch (Exception e) {
            System.err.println("Error notifying prompt interaction: " + e.getMessage());
        }
    }

    /**
     * Send weekly summary to prompt owners
     */
    @Async
    public void sendWeeklySummary(User user) {
        try {
            // Get user's prompts and calculate summary statistics
            // This would need integration with PromptService
            String title = "Weekly Prompt Summary";
            String message = "Here's your weekly prompt performance summary.";
            
            createNotification(user, WEEKLY_SUMMARY, title, message);
            sendEmailNotification(user, title, message);
        } catch (Exception e) {
            System.err.println("Error sending weekly summary: " + e.getMessage());
        }
    }

    /**
     * Send email notification
     */
    private void sendEmailNotification(User user, String title, String message) {
        try {
            if (user.getEmail() != null && !user.getEmail().trim().isEmpty()) {
                mailService.sendMail(user.getEmail(), title, message);
            }
        } catch (Exception e) {
            System.err.println("Error sending email notification: " + e.getMessage());
        }
    }

    /**
     * Convert Notification entity to DTO
     */
    private NotificationDto convertToDto(Notification notification) {
        return NotificationDto.create(
            notification.getId(),
            notification.getPromptId(),
            notification.getType(),
            notification.getTitle(),
            notification.getMessage(),
            notification.getIsRead(),
            notification.getCreatedAt(),
            notification.getReadAt()
        ).withMetadata(notification.getMetadata());
    }

    /**
     * Clean up old notifications (utility method for scheduled tasks)
     */
    @Transactional
    public void cleanupOldNotifications(int daysToKeep) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysToKeep);
        notificationRepository.deleteByCreatedAtBefore(cutoffDate);
    }
}
