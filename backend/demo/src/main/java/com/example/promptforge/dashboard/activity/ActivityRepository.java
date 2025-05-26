// src/main/java/com/example/promptforge/activity/ActivityRepository.java
package com.example.promptforge.dashboard.activity;

import com.example.promptforge.dashboard.dashboard_dto.ActivityDTO;
import com.example.promptforge.dashboard.prompt.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Review, UUID> {

    @Query("SELECT new com.example.promptforge.dashboard.dashboard_dto.ActivityDTO(" +
           "u.username, 'REVIEW', p.title, r.rating) " +
           "FROM Review r " +
           "JOIN User u ON r.userId = u.userId " +
           "JOIN Prompt p ON r.promptId = p.promptId " +
           "ORDER BY (SELECT MAX(r2.rating) FROM Review r2 WHERE r2.promptId = r.promptId) DESC " +
           "LIMIT 10")
    List<ActivityDTO> findRecentActivities();
}