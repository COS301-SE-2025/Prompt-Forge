package com.fiveOps.promptforge.promptstore.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class ReviewWithUsernameDTO {
    private UUID id;
    private UUID promptId;
    private UUID userId;
    private String userName;  
    private Double rating;
    private String comment;
    private LocalDateTime createdAt;

}
