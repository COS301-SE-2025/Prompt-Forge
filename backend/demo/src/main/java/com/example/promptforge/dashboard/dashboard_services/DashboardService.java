// src/main/java/com/example/promptforge/dashboard_services/DashboardService.java
package com.example.promptforge.dashboard.dashboard_services;




import java.util.List;

import org.springframework.stereotype.Service;

import com.example.promptforge.dashboard.activity.ActivityRepository;
import com.example.promptforge.dashboard.dashboard_dto.ActivityDTO;
import com.example.promptforge.dashboard.dashboard_dto.MonthlyUsageDTO;
import com.example.promptforge.dashboard.dashboard_dto.TopPromptDTO;
import com.example.promptforge.dashboard.dashboard_repo.DashboardRepository;
import com.example.promptforge.dashboard.prompt.PromptMetadataRepo;
import com.example.promptforge.promptstore.repository.PromptRepository;
import com.example.promptforge.user_profile.repository.UserRepository;

@Service
public class DashboardService {
    
    private final DashboardRepository dashboardRepository;
    private final ActivityRepository activityRepository;
    private final PromptRepository promptRepository;
    private final UserRepository userRepository;
    private final PromptMetadataRepo promptMetadataRepository;
    
    public DashboardService(DashboardRepository dashboardRepository, 
                          ActivityRepository activityRepository,
                          PromptRepository promptRepository,
                          UserRepository userRepository,
                          PromptMetadataRepo promptMetadataRepository) {
        this.dashboardRepository = dashboardRepository;
        this.activityRepository = activityRepository;
        this.promptRepository = promptRepository;
        this.userRepository = userRepository;
        this.promptMetadataRepository = promptMetadataRepository;
    }
    
    public Long getTotalPrompts() {
        return promptRepository.count();
    }
    
    public Long getTotalUsers() {
        return userRepository.count();
    }
    
    public Double getAverageRating() {
        Double avg = promptMetadataRepository.calculateAverageRating();
        return avg != null ? avg : 0.0;
    }
    
    public List<MonthlyUsageDTO> getMonthlyUsage() {
        return dashboardRepository.findMonthlyUsage();
    }
    
    public List<TopPromptDTO> getTopPrompts() {
        return dashboardRepository.findTopPrompts();
    }
    
    public List<ActivityDTO> getRecentActivities() {
        return activityRepository.findRecentActivities();
    }
}
