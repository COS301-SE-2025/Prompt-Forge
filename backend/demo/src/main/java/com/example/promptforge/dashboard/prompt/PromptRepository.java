// src/main/java/com/example/promptforge/prompt/PromptRepository.java
package com.example.promptforge.dashboard.prompt;



import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PromptRepository extends JpaRepository<Prompt, UUID> {
}