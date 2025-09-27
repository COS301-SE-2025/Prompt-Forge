package com.fiveOps.promptforge.badges.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.fiveOps.promptforge.badges.model.Badge;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, UUID> {

  Optional<Badge> findByName(String name);

  List<Badge> findByIsActiveTrue();

  List<Badge> findByCategory(String category);

  List<Badge> findByCategoryAndIsActiveTrue(String category);

  List<Badge> findByRarity(String rarity);

  @Query(
      "SELECT b FROM Badge b WHERE b.isActive = true ORDER BY "
          + "CASE b.rarity "
          + "WHEN 'legendary' THEN 1 "
          + "WHEN 'epic' THEN 2 "
          + "WHEN 'rare' THEN 3 "
          + "WHEN 'uncommon' THEN 4 "
          + "WHEN 'common' THEN 5 "
          + "ELSE 6 END, b.name")
  List<Badge> findAllActiveOrderByRarity();
}
