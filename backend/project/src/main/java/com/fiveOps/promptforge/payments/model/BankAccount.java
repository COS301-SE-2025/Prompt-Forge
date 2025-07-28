package com.fiveOps.promptforge.payments.model;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import com.fiveOps.promptforge.user_profile.model.User;

@Entity
@Table(name = "bank_accounts")
public class BankAccount {

  @Id
  @GeneratedValue
  @Column(name = "bank_account_id", updatable = false, nullable = false)
  private UUID bankAccountId;

  @ManyToOne(optional = false)
  @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_user"))
  private User user;

  @Column(name = "bank_name", nullable = false, length = 100)
  private String bankName;

  @Column(name = "bank_code", length = 20)
  private String bankCode;

  @Column(name = "account_number", nullable = false, length = 30)
  private String accountNumber;

  @Column(name = "account_holder", length = 100)
  private String accountHolder;

  @Column(name = "is_verified", nullable = false)
  private boolean isVerified = false;

  @Column(name = "paystack_subaccount_code", length = 100)
  private String paystackSubaccountCode;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt = LocalDateTime.now();

  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt = LocalDateTime.now();

  // Getters and Setters

  public UUID getBankAccountId() {
    return bankAccountId;
  }

  public void setBankAccountId(UUID bankAccountId) {
    this.bankAccountId = bankAccountId;
  }

  public User getUser() {
    return user;
  }

  public void setUser(User user) {
    this.user = user;
  }

  public String getBankName() {
    return bankName;
  }

  public void setBankName(String bankName) {
    this.bankName = bankName;
  }

  public String getBankCode() {
    return bankCode;
  }

  public void setBankCode(String bankCode) {
    this.bankCode = bankCode;
  }

  public String getAccountNumber() {
    return accountNumber;
  }

  public void setAccountNumber(String accountNumber) {
    this.accountNumber = accountNumber;
  }

  public String getAccountHolder() {
    return accountHolder;
  }

  public void setAccountHolder(String accountHolder) {
    this.accountHolder = accountHolder;
  }

  public boolean isVerified() {
    return isVerified;
  }

  public void setVerified(boolean verified) {
    isVerified = verified;
  }

  public String getPaystackSubaccountCode() {
    return paystackSubaccountCode;
  }

  public void setPaystackSubaccountCode(String paystackSubaccountCode) {
    this.paystackSubaccountCode = paystackSubaccountCode;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public LocalDateTime getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(LocalDateTime updatedAt) {
    this.updatedAt = updatedAt;
  }
}
