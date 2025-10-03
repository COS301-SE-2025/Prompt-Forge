package com.fiveOps.promptforge.promptstore.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fiveOps.promptforge.promptstore.model.PromptPurchase;

@Repository
public interface PromptPurchaseRepository extends JpaRepository<PromptPurchase, UUID> {
  boolean existsByPromptIdAndUserId(UUID promptId, UUID userId);

  List<PromptPurchase> findByUserId(UUID userId);

  Long countByPromptId(UUID promptId);
}
