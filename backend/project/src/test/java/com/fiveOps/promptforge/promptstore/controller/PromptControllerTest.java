package com.fiveOps.promptforge.promptstore.controller;

import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.fiveOps.promptforge.prompts.controller.PromptController;
import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.prompts.repository.PromptRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

class PromptControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private PromptRepository promptRepository;

    @InjectMocks
    private PromptController promptController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(promptController)
                .build();
    }

    @Test
    void getAllPublicPrompts() throws Exception {
        Prompt prompt = new Prompt();
        prompt.setId(UUID.randomUUID());
        prompt.setIsPublic(true);

        when(promptRepository.findByIsPublicTrue()).thenReturn(Arrays.asList(prompt));

        mockMvc.perform(get("/prompts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").exists())
                .andExpect(jsonPath("$[0].isPublic").value(true));

        verify(promptRepository, times(1)).findByIsPublicTrue();
    }

    @Test
    void getPromptById_Exists() throws Exception {
        UUID id = UUID.randomUUID();
        Prompt prompt = new Prompt();
        prompt.setId(id);

        when(promptRepository.findById(id)).thenReturn(Optional.of(prompt));

        mockMvc.perform(get("/prompts/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id.toString()));

        verify(promptRepository, times(1)).findById(id);
    }

    @Test
    void getPromptById_NotFound() throws Exception {
        UUID id = UUID.randomUUID();
        when(promptRepository.findById(id)).thenReturn(Optional.empty());

        mockMvc.perform(get("/prompts/{id}", id))
                .andExpect(status().isNotFound());

        verify(promptRepository, times(1)).findById(id);
    }

    @Test
    void createPrompt() throws Exception {
        Prompt prompt = new Prompt();
        prompt.setTitle("Test Prompt");
        prompt.setContent("Content");
        prompt.setIsPublic(true);

        when(promptRepository.save(any(Prompt.class))).thenReturn(prompt);

        mockMvc.perform(post("/prompts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(prompt)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test Prompt"));

        verify(promptRepository, times(1)).save(any(Prompt.class));
    }

    @Test
    void updatePrompt_Exists() throws Exception {
        UUID id = UUID.randomUUID();
        Prompt existing = new Prompt();
        existing.setId(id);
        existing.setTitle("Old Title");

        Prompt updated = new Prompt();
        updated.setTitle("New Title");

        when(promptRepository.findById(id)).thenReturn(Optional.of(existing));
        when(promptRepository.save(any(Prompt.class))).thenReturn(updated);

        mockMvc.perform(put("/prompts/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("New Title"));

        verify(promptRepository, times(1)).findById(id);
        verify(promptRepository, times(1)).save(any(Prompt.class));
    }

    @Test
    void updatePrompt_NotFound() throws Exception {
        UUID id = UUID.randomUUID();
        when(promptRepository.findById(id)).thenReturn(Optional.empty());

        mockMvc.perform(put("/prompts/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new Prompt())))
                .andExpect(status().isNotFound());

        verify(promptRepository, times(1)).findById(id);
        verify(promptRepository, never()).save(any(Prompt.class));
    }

    @Test
    void deletePrompt_Exists() throws Exception {
        UUID id = UUID.randomUUID();
        Prompt prompt = new Prompt();
        prompt.setId(id);

        when(promptRepository.findById(id)).thenReturn(Optional.of(prompt));

        mockMvc.perform(delete("/prompts/{id}", id))
                .andExpect(status().isOk());

        verify(promptRepository, times(1)).findById(id);
        verify(promptRepository, times(1)).delete(prompt);
    }

    @Test
    void deletePrompt_NotFound() throws Exception {
        UUID id = UUID.randomUUID();
        when(promptRepository.findById(id)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/prompts/{id}", id))
                .andExpect(status().isNotFound());

        verify(promptRepository, times(1)).findById(id);
        verify(promptRepository, never()).delete(any(Prompt.class));
    }
}