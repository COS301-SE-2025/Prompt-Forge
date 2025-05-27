// src/main/java/com/example/promptforge/prompt/PromptMetadata.java

package com.example.promptforge.dashboard.prompt;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "prompt_metadata", schema = "public")
public class PromptMetadata {
    @Id
    @Column(name = "metadata_id", columnDefinition = "UUID")
    private UUID metadataId;

    @Column(name = "prompt_id", columnDefinition = "UUID")
    private UUID promptId;
    
    private Integer viewCount;
    private Integer forkCount;
    private Integer downloadCount;
    private Double avgRating;
    
    // Getters and Setters
    public UUID getMetadataId() { return metadataId; }
    public void setMetadataId(UUID metadataId) { this.metadataId = metadataId; }
    public UUID getPromptId() { return promptId; }
    public void setPromptId(UUID promptId) { this.promptId = promptId; }
    public Integer getViewCount() { return viewCount; }
    public void setViewCount(Integer viewCount) { this.viewCount = viewCount; }
    public Integer getForkCount() { return forkCount; }
    public void setForkCount(Integer forkCount) { this.forkCount = forkCount; }
    public Integer getDownloadCount() { return downloadCount; }
    public void setDownloadCount(Integer downloadCount) { this.downloadCount = downloadCount; }
    public Double getAvgRating() { return avgRating; }
    public void setAvgRating(Double avgRating) { this.avgRating = avgRating; }
}
