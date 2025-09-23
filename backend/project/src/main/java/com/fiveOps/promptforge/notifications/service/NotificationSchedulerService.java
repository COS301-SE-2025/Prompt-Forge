package com.fiveOps.promptforge.notifications.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.fiveOps.promptforge.user_profile.model.User;
import com.fiveOps.promptforge.user_profile.repository.UserRepository;

@Service
public class NotificationSchedulerService {

  @Autowired private NotificationService notificationService;

  @Autowired private UserRepository userRepository;

  /** Send weekly summaries every Monday at 9 AM */
  @Scheduled(cron = "0 0 9 * * MON")
  public void sendWeeklySummaries() {
    try {
      List<User> users = userRepository.findAll();
      for (User user : users) {
        if (user.getIsActive() != null && user.getIsActive()) {
          notificationService.sendWeeklySummary(user);
        }
      }
    } catch (Exception e) {
      System.err.println("Error sending weekly summaries: " + e.getMessage());
    }
  }

  /** Clean up old notifications every day at 2 AM */
  @Scheduled(cron = "0 0 2 * * *")
  public void cleanupOldNotifications() {
    try {
      // Keep notifications for 90 days
      notificationService.cleanupOldNotifications(90);
    } catch (Exception e) {
      System.err.println("Error cleaning up notifications: " + e.getMessage());
    }
  }
}
