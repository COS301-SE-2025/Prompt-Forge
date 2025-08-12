package com.fiveOps.promptforge.analytics.dto;

import java.time.LocalDate;
import java.util.Map;

public class UserAnalyticsDTO {
    private Long totalUsers;
    private Long newUsers;
    private Long returningUsers;
    private Long dailyActiveUsers;
    private Long monthlyActiveUsers;
    private Double userGrowthRate;
    private Map<String, Long> userSegmentation;
    private Long followerGrowth;
    private Double followerEngagement;

    public UserAnalyticsDTO() {}

    public UserAnalyticsDTO(Long totalUsers, Long newUsers, Long returningUsers,
                           Long dailyActiveUsers, Long monthlyActiveUsers,
                           Double userGrowthRate, Map<String, Long> userSegmentation,
                           Long followerGrowth, Double followerEngagement) {
        this.totalUsers = totalUsers;
        this.newUsers = newUsers;
        this.returningUsers = returningUsers;
        this.dailyActiveUsers = dailyActiveUsers;
        this.monthlyActiveUsers = monthlyActiveUsers;
        this.userGrowthRate = userGrowthRate;
        this.userSegmentation = userSegmentation;
        this.followerGrowth = followerGrowth;
        this.followerEngagement = followerEngagement;
    }

    // Getters and setters
    public Long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }

    public Long getNewUsers() { return newUsers; }
    public void setNewUsers(Long newUsers) { this.newUsers = newUsers; }

    public Long getReturningUsers() { return returningUsers; }
    public void setReturningUsers(Long returningUsers) { this.returningUsers = returningUsers; }

    public Long getDailyActiveUsers() { return dailyActiveUsers; }
    public void setDailyActiveUsers(Long dailyActiveUsers) { this.dailyActiveUsers = dailyActiveUsers; }

    public Long getMonthlyActiveUsers() { return monthlyActiveUsers; }
    public void setMonthlyActiveUsers(Long monthlyActiveUsers) { this.monthlyActiveUsers = monthlyActiveUsers; }

    public Double getUserGrowthRate() { return userGrowthRate; }
    public void setUserGrowthRate(Double userGrowthRate) { this.userGrowthRate = userGrowthRate; }

    public Map<String, Long> getUserSegmentation() { return userSegmentation; }
    public void setUserSegmentation(Map<String, Long> userSegmentation) { this.userSegmentation = userSegmentation; }

    public Long getFollowerGrowth() { return followerGrowth; }
    public void setFollowerGrowth(Long followerGrowth) { this.followerGrowth = followerGrowth; }

    public Double getFollowerEngagement() { return followerEngagement; }
    public void setFollowerEngagement(Double followerEngagement) { this.followerEngagement = followerEngagement; }
}
