package com.fiveOps.promptforge.prompts.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tags")
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
}