package com.example.promptforge.promptstore.model;

import jakarta.persistence.*;
import jakarta.persistence.CascadeType;
import jakarta.persistence.FetchType;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

@Entity
@Table(name = "prompt_metadata")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromptMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "metadata_id", columnDefinition = "UUID")
    @JdbcTypeCode(SqlTypes.VARCHAR)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "prompt_id", nullable = false, unique = true)
    private Prompt prompt;

    @Column(name = "view_count", nullable = false)
    private int viewCount = 0;

    @Column(name = "fork_count", nullable = false)
    private int forkCount = 0;

    @Column(name = "download_count", nullable = false)
    private int downloadCount = 0;

    @Column(name = "avg_rating", precision = 3, scale = 2)
    private Double averageRating;
}