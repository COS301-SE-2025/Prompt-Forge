package com.fiveOps.promptforge.payments.projection;

import java.time.LocalDateTime;
import java.util.UUID;

public interface PaymentDetailsProjection {
  UUID getBankAccountId();

  String getBankName();

  String getBankCode();

  String getAccountNumber();

  String getAccountHolder();

  boolean getIsVerified();

  LocalDateTime getCreatedAt();

  LocalDateTime getUpdatedAt();
}
