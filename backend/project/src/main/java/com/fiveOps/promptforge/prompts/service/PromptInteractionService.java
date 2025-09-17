package com.fiveOps.promptforge.prompts.service;

import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.prompts.model.PromptInteraction;
import com.fiveOps.promptforge.prompts.repository.PromptInteractionRepository;
import com.fiveOps.promptforge.user_profile.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PromptInteractionService {
    @Autowired
    private PromptInteractionRepository promptInteractionRepository;

    // Lazy initialization to avoid circular dependency
    private com.fiveOps.promptforge.notifications.service.NotificationService notificationService;

    @Autowired(required = false)
    public void setNotificationService(com.fiveOps.promptforge.notifications.service.NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    public void recordInteraction(Prompt prompt, User user, String action) {
        PromptInteraction interaction = new PromptInteraction(prompt, user, action, 
                LocalDateTime.now());
        promptInteractionRepository.save(interaction);
        
        // Trigger notifications asynchronously
        if (notificationService != null) {
            notificationService.notifyPromptInteraction(prompt, action, user);
            
            // Check bounce rate after each interaction
            if ("VIEW".equals(action) || "ADD_TO_CART".equals(action) || "PURCHASE".equals(action)) {
                notificationService.checkBounceRateAndNotify(prompt);
            }
        }
    }

    public long getPromptViews(Prompt prompt) {
        return promptInteractionRepository.countByPromptAndAction(prompt, "VIEW");
    }

    public long getPromptActions(Prompt prompt, String action) {
        return promptInteractionRepository.countByPromptAndAction(prompt, action);
    }

    public long getTotalPromptInteractions(Prompt prompt) {
        return promptInteractionRepository.countByPrompt(prompt);
    }

    public double getPromptBounceRate(Prompt prompt) {
        long views = getPromptViews(prompt);
        long actions = getPromptActions(prompt, "ADD_TO_CART") 
                + getPromptActions(prompt, "PURCHASE");
        if (views == 0) return 0.0;
        return ((double)(views - actions) / views) * 100.0;
    }

    public List<PromptInteraction> getInteractionsForPrompt(Prompt prompt) {
        return promptInteractionRepository.findByPrompt(prompt);
    }
}
