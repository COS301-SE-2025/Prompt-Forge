package com.fiveOps.promptforge.promptstore.dto;

import java.util.List;
import java.util.UUID;

import com.fiveOps.promptforge.prompts.model.Tag;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PromptWithTagsDTO {
    private UUID id;
    private String title;
    private String description;
    private double price;
    private List<Tag> tags;
    // Other necessary fields...for now we're good
}

