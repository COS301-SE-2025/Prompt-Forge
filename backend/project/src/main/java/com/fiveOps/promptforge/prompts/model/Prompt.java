package com.fiveOps.promptforge.prompts.model;


import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "prompts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prompt {

    @Id
    @Column(name = "prompt_id", columnDefinition = "UUID")
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private Double price;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_public", nullable = false)
    private Boolean isPublic;

    @Column(name = "author_id", nullable = false)
    private UUID authorId;

    @Column(nullable = false)
    private String category;

    @OneToOne(
    mappedBy = "prompt",
    cascade = CascadeType.ALL,
    fetch = FetchType.LAZY,
    orphanRemoval = true
)
@JsonIgnore
private PromptMetadata metadata;

public void setMetadata(PromptMetadata metadata) {
    if (metadata == null) {
        if (this.metadata != null) {
            this.metadata.setPrompt(null);
        }
    } else {
        metadata.setPrompt(this);
    }
    this.metadata = metadata;
}

}