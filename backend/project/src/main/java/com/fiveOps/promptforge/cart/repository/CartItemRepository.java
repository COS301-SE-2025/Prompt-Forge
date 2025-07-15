// src/main/java/com/fiveOps/promptforge/promptstore/repository/PromptStoreRepository.java
package com.fiveOps.promptforge.cart.repository;

import java.util.List;
import java.util.UUID;

import jakarta.transaction.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fiveOps.promptforge.cart.model.CartItem;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, UUID> {

  @Query(
      value =
          """
              SELECT

                         c.id AS cart_item_id,
                         cart_user.user_id AS user_id,
                         author_user.username AS username,
                         p.prompt_id AS prompt_id,
                         p.title AS prompt_title,
                         ARRAY_AGG(t.name) AS prompt_tags,
                         p.price AS prompt_price,
                         author_user.username AS author_username
                     FROM cart_items c
                     JOIN users cart_user ON c.user_id = cart_user.user_id
                     JOIN prompts p ON c.prompt_id = p.prompt_id
                     JOIN users author_user ON p.author_id = author_user.user_id
                     JOIN tags t ON t.tag_id = ANY(p.prompt_tags)
                     WHERE cart_user.user_id = :userId
                     GROUP BY
                         c.id,
                         cart_user.user_id,
                         cart_user.username,
                         p.prompt_id,
                         p.title,
                         p.price,
                         author_user.username

              """,
      nativeQuery = true)
  Page<Object[]> findCartItemsWithTagsByUserId(@Param("userId") UUID userId, Pageable pageable);

  @Query(
      value =
          """
              SELECT c.id AS cart_item_id
              FROM cart_items c
              WHERE c.user_id = :userId AND c.prompt_id = :promptId
              """,
      nativeQuery = true)
  List<Object[]> findByUserIdAndPromptId(
      @Param("userId") UUID userId, @Param("promptId") UUID promptId);

  @Modifying
  @Transactional
  @Query("DELETE FROM CartItem c WHERE c.user.userId = :userId AND c.prompt.id = :promptId")
  void deleteByUserIdAndPromptId(@Param("userId") UUID userId, @Param("promptId") UUID promptId);
}
