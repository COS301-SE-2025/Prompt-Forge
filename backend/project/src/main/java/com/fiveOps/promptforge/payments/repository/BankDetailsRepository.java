// src/main/java/com/fiveOps/promptforge/promptstore/repository/PromptStoreRepository.java
package com.fiveOps.promptforge.payments.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fiveOps.promptforge.payments.model.BankAccount;

@Repository
public interface BankDetailsRepository extends JpaRepository<BankAccount, UUID> {

  // @Query(
  //     value =
  //         """
  //       SELECT paystack_subaccount_code AS subaccountCode
  //       FROM bank_accounts b
  //       WHERE b.user_id = :userId
  //       """,
  //     nativeQuery = true)
  BankAccount findByUser_UserId(@Param("user_id") UUID userId);
}
