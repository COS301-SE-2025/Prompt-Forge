// src/main/java/com/example/promptforge/dashboard_repo/DashboardRepository.java
package com.example.promptforge.dashboard.dashboard_repo;


import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.promptforge.dashboard.dashboard_dto.MonthlyUsageDTO;
import com.example.promptforge.dashboard.dashboard_dto.TopPromptDTO;
import com.example.promptforge.promptstore.model.PromptMetadata;

@Repository
public interface DashboardRepository extends JpaRepository<PromptMetadata, UUID> {
    
    @Query("SELECT COUNT(p) FROM Prompt p")
    Long countTotalPrompts();
    
    @Query("SELECT COUNT(u) FROM User u")
    Long countTotalUsers();
    
    @Query("SELECT AVG(pm.averageRating) FROM PromptMetadata pm WHERE pm.averageRating IS NOT NULL")
    Double calculateAverageRating();
    
    @Query("SELECT new com.example.promptforge.dashboard.dashboard_dto.MonthlyUsageDTO(" +
           "TO_CHAR(p.createdAt, 'YYYY-MM'), COUNT(p)) " +
           "FROM Prompt p " +
           "GROUP BY TO_CHAR(p.createdAt, 'YYYY-MM') " +
           "ORDER BY TO_CHAR(p.createdAt, 'YYYY-MM') DESC")
    List<MonthlyUsageDTO> findMonthlyUsage();

    @Query("SELECT new com.example.promptforge.dashboard.dashboard_dto.TopPromptDTO(p.title, pm.viewCount, pm.averageRating) " +
           "FROM Prompt p JOIN PromptMetadata pm ON p.id = pm.id " +
           "ORDER BY pm.viewCount DESC, pm.averageRating DESC LIMIT 5")
    List<TopPromptDTO> findTopPrompts();

}