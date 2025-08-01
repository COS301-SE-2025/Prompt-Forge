// src/main/java/com/fiveOps/promptforge/promptstore/repository/PromptStoreRepository.java
package com.fiveOps.promptforge.payments.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fiveOps.promptforge.payments.dto.PayoutCardWithSubaccountCodeDTO;
import com.fiveOps.promptforge.payments.model.BankAccount;

@Repository
public interface BankDetailsRepository extends JpaRepository<BankAccount, UUID> {

  PayoutCardWithSubaccountCodeDTO findByUserUserId(@Param("user_id") UUID userId);

  Integer countByUserUserId(@Param("user_id") UUID userId);

  Integer deleteByUserUserId(@Param("user_id") UUID userId);
}
