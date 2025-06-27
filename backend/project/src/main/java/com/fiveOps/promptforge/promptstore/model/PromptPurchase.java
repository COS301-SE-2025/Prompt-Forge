package com.fiveOps.promptforge.promptstore.model;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "purchased_prompts")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromptPurchase {
    @Id
    @GeneratedValue
    @Column(name = "purchase_id", columnDefinition = "UUID")
    private UUID id;

    @Column(name = "prompt_id", nullable = false)
    private UUID promptId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private Double pricePaid;

    @CreationTimestamp
    @Column(name = "purchased_at", nullable = false)
    private LocalDateTime purchasedAt;
    
    @Column(name = "visibility", nullable = false)
    private String visibility = "public"; // ✅ default at Java level

    // @Column(name = "downloads_remaining", nullable = false)
    // private Integer downloadsRemaining = 3;
}
