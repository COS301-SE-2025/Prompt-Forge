// src/main/java/com/example/promptforge/dashboard_repo/DashboardRepository.java
package com.example.promptforge.dashboard.dashboard_repo;


import com.example.promptforge.dashboard.dashboard_dto.MonthlyUsageDTO;
import com.example.promptforge.dashboard.dashboard_dto.TopPromptDTO;
import com.example.promptforge.dashboard.prompt.PromptMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DashboardRepository extends JpaRepository<PromptMetadata, UUID> {
    
    @Query("SELECT COUNT(p) FROM Prompt p")
    Long countTotalPrompts();
    
    @Query("SELECT COUNT(u) FROM User u")
    Long countTotalUsers();
    
    @Query("SELECT AVG(pm.avgRating) FROM PromptMetadata pm WHERE pm.avgRating IS NOT NULL")
    Double calculateAverageRating();
    
    @Query("SELECT new com.example.promptforge.dashboard.dashboard_dto.MonthlyUsageDTO(" +
           "TO_CHAR(p.createdAt, 'YYYY-MM'), COUNT(p)) " +
           "FROM Prompt p " +
           "GROUP BY TO_CHAR(p.createdAt, 'YYYY-MM') " +
           "ORDER BY TO_CHAR(p.createdAt, 'YYYY-MM') DESC")
    List<MonthlyUsageDTO> findMonthlyUsage();

    @Query("SELECT new com.example.promptforge.dashboard.dashboard_dto.TopPromptDTO(" +
           "p.title, pm.viewCount, pm.avgRating) " +
           "FROM Prompt p " +
           "JOIN PromptMetadata pm ON p.promptId = pm.promptId " +
           "ORDER BY pm.viewCount DESC, pm.avgRating DESC " +
           "LIMIT 5")
    List<TopPromptDTO> findTopPrompts();
}