package com.fiveOps.promptforge.analytics.repository;

import com.fiveOps.promptforge.analytics.model.UserActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface UserActivityLogRepository extends JpaRepository<UserActivityLog, UUID> {
    
    List<UserActivityLog> findByUserIdOrderByTimestampDesc(UUID userId);
    
    List<UserActivityLog> findByUserIdAndTimestampBetween(UUID userId, LocalDateTime start, LocalDateTime end);
    
    List<UserActivityLog> findByActivityTypeAndTimestampBetween(String activityType, LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT COUNT(DISTINCT u.userId) FROM UserActivityLog u WHERE u.timestamp BETWEEN :start AND :end")
    Long countUniqueUsersInPeriod(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    @Query("SELECT COUNT(u) FROM UserActivityLog u WHERE u.userId = :userId AND u.activityType = :activityType AND u.timestamp BETWEEN :start AND :end")
    Long countUserActivityInPeriod(@Param("userId") UUID userId, @Param("activityType") String activityType, 
                                  @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    @Query("SELECT AVG(u.sessionDuration) FROM UserActivityLog u WHERE u.userId = :userId AND u.sessionDuration IS NOT NULL AND u.timestamp BETWEEN :start AND :end")
    Double getAverageSessionDuration(@Param("userId") UUID userId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    @Query("SELECT u.activityType, COUNT(u) FROM UserActivityLog u WHERE u.userId = :userId AND u.timestamp BETWEEN :start AND :end GROUP BY u.activityType")
    List<Object[]> getUserActivityBreakdown(@Param("userId") UUID userId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    @Query("SELECT DATE(u.timestamp), COUNT(u) FROM UserActivityLog u WHERE u.userId = :userId AND u.activityType = 'login' AND u.timestamp BETWEEN :start AND :end GROUP BY DATE(u.timestamp)")
    List<Object[]> getDailyLoginActivity(@Param("userId") UUID userId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
