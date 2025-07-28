package com.fiveOps.promptforge.payments.projection;

public interface PaymentDetailsProjectionWithPaystackSubaccountCode
    extends PaymentDetailsProjection {
  String getPaystackSubaccountCode();
}
