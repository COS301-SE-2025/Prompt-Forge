package com.fiveOps.promptforge.prompts.model;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tags", indexes = {
    @Index(name = "idx_tag_name", columnList = "name"),
    @Index(name = "idx_tag_category", columnList = "category"),
    @Index(name = "idx_tag_usage", columnList = "usage_count")
})
@Getter
@Setter
@NoArgsConstructor  
@AllArgsConstructor 
@Builder
public class Tag {
    @Id
    @Column(name = "tag_id", columnDefinition = "UUID")
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 60)
    private String slug;

    @Column(length = 20)
    private String category;

    @Column(name = "is_auto_suggested", nullable = false)
    private boolean isAutoSuggest = false;

    @Column(name = "usage_count", nullable = false)
    private int usageCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
}