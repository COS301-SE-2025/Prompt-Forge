// src/main/java/com/example/promptforge/prompt/PromptRepository.java
package com.example.promptforge.dashboard.prompt;



import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.promptforge.promptstore.model.Prompt;

@Repository
public interface PromptRepo extends JpaRepository<Prompt, UUID> {
}