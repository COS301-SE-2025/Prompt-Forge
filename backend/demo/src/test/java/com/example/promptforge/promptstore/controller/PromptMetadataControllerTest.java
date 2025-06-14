package com.example.promptforge.promptstore.controller;

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
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.example.promptforge.prompts.controller.PromptMetadataController;
import com.example.promptforge.prompts.model.PromptMetadata;
import com.example.promptforge.prompts.repository.PromptMetadataRepository;

class PromptMetadataControllerTest {

    private MockMvc mockMvc;

    @Mock
    private PromptMetadataRepository metadataRepository;

    @InjectMocks
    private PromptMetadataController metadataController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(metadataController).build();
    }

    @Test
    void getMetadataByPromptId_WhenMetadataExists_ReturnsMetadata() throws Exception {
        UUID promptId = UUID.randomUUID();
        PromptMetadata metadata = new PromptMetadata();
        metadata.setId(UUID.randomUUID());
        
        when(metadataRepository.findByPromptId(promptId)).thenReturn(metadata);

        mockMvc.perform(get("/prompts/metadata/{promptId}", promptId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(metadata.getId().toString()));

        verify(metadataRepository, times(1)).findByPromptId(promptId);
    }

    @Test
    void getMetadataByPromptId_WhenMetadataNotExists_ReturnsNotFound() throws Exception {
        UUID promptId = UUID.randomUUID();
        
        when(metadataRepository.findByPromptId(promptId)).thenReturn(null);

        mockMvc.perform(get("/prompts/metadata/{promptId}", promptId))
                .andExpect(status().isNotFound());

        verify(metadataRepository, times(1)).findByPromptId(promptId);
    }

    @Test
    void incrementViewCount_ShouldCallRepository() throws Exception {
        UUID promptId = UUID.randomUUID();
        
        mockMvc.perform(post("/prompts/metadata/{promptId}/view", promptId))
                .andExpect(status().isOk());

        verify(metadataRepository, times(1)).incrementViewCount(promptId);
    }

    @Test
    void incrementForkCount_ShouldCallRepository() throws Exception {
        UUID promptId = UUID.randomUUID();
        
        mockMvc.perform(post("/prompts/metadata/{promptId}/fork", promptId))
                .andExpect(status().isOk());

        verify(metadataRepository, times(1)).incrementForkCount(promptId);
    }

    @Test
    void incrementDownloadCount_ShouldCallRepository() throws Exception {
        UUID promptId = UUID.randomUUID();
        
        mockMvc.perform(post("/prompts/metadata/{promptId}/download", promptId))
                .andExpect(status().isOk());

        verify(metadataRepository, times(1)).incrementDownloadCount(promptId);
    }

    @Test
    void getPromptStats_WhenMetadataExists_ReturnsMetadataWithRecalculatedRating() throws Exception {
        UUID promptId = UUID.randomUUID();
        PromptMetadata metadata = new PromptMetadata();
        metadata.setId(UUID.randomUUID());
        Double avgRating = 4.5;
        
        when(metadataRepository.findByPromptId(promptId)).thenReturn(metadata);
        when(metadataRepository.calculateAverageRating(promptId)).thenReturn(avgRating);

        mockMvc.perform(get("/prompts/metadata/{promptId}/stats", promptId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(metadata.getId().toString()))
                .andExpect(jsonPath("$.averageRating").value(avgRating));

        verify(metadataRepository, times(1)).findByPromptId(promptId);
        verify(metadataRepository, times(1)).calculateAverageRating(promptId);
    }

    @Test
    void getPromptStats_WhenMetadataNotExists_ReturnsNotFound() throws Exception {
        UUID promptId = UUID.randomUUID();
        
        when(metadataRepository.findByPromptId(promptId)).thenReturn(null);

        mockMvc.perform(get("/prompts/metadata/{promptId}/stats", promptId))
                .andExpect(status().isNotFound());

        verify(metadataRepository, times(1)).findByPromptId(promptId);
        verify(metadataRepository, never()).calculateAverageRating(any());
    }
}