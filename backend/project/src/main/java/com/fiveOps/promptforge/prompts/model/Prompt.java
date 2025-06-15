package com.fiveOps.promptforge.prompts.model;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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

    @Column(name = "author_id", nullable = false)
    private UUID authorId;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 255)
    private String slug;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private Double price;

    @Column(nullable = false, length = 20)
    private String visibility;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT now()")
    private LocalDateTime createdAt;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "prompt_tags", columnDefinition = "uuid[]")
    private List<UUID> promptTags;

    ///analytics functionality
    /// 
    // @OneToOne(
    //     mappedBy = "prompt",
    //     cascade = CascadeType.ALL,
    //     fetch = FetchType.LAZY,
    //     orphanRemoval = true
    // )
    // @JsonIgnore
    // private PromptMetadata metadata;

    // public void setMetadata(PromptMetadata metadata) {
    //     if (metadata == null) {
    //         if (this.metadata != null) {
    //             this.metadata.setPrompt(null);
    //         }
    //     } else {
    //         metadata.setPrompt(this);
    //     }
    //     this.metadata = metadata;
    // }
}