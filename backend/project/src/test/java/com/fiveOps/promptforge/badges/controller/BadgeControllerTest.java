package com.fiveOps.promptforge.badges.controller;

import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.fiveOps.promptforge.badges.dto.BadgeDto;
import com.fiveOps.promptforge.badges.service.BadgeAwardingService;
import com.fiveOps.promptforge.badges.service.BadgeService;
import com.fiveOps.promptforge.securityConfig.JwtUtil;
import com.fiveOps.promptforge.user_profile.dto.UserDto;
import com.fiveOps.promptforge.user_profile.service.UserService;

@ExtendWith(MockitoExtension.class)
class BadgeControllerTest {

  @Mock private BadgeService badgeService;

  @Mock private UserService userService;

  @Mock private JwtUtil jwtUtil;

  @Mock private BadgeAwardingService badgeAwardingService;

  @InjectMocks private BadgeController badgeController;

  private MockMvc mockMvc;

  private UUID testUserId;
  private String testEmail;
  private String testUsername;
  private UserDto testUser;
  private BadgeDto testBadgeDto;

  @BeforeEach
  void setUp() {
    mockMvc = MockMvcBuilders.standaloneSetup(badgeController).build();

    testUserId = UUID.randomUUID();
    testEmail = "test@example.com";
    testUsername = "testuser";

    testUser = new UserDto();
    testUser.setUserId(testUserId);
    testUser.setEmail(testEmail);
    testUser.setUsername(testUsername);

    testBadgeDto = new BadgeDto();
    testBadgeDto.setBadgeId(UUID.randomUUID());
    testBadgeDto.setName("Test Badge");
    testBadgeDto.setDescription("A test badge");
    testBadgeDto.setIcon("award");
    testBadgeDto.setColor("#3ebb9e");
    testBadgeDto.setCategory("achievement");
    testBadgeDto.setRarity("common");
    testBadgeDto.setProgress(50);
    testBadgeDto.setIsVisible(true);
    testBadgeDto.setIsActive(true);
    testBadgeDto.setCreatedAt(LocalDateTime.now());
    testBadgeDto.setUpdatedAt(LocalDateTime.now());
  }

  @Test
  void getAllBadges_ShouldReturnAllActiveBadges() throws Exception {
    // Arrange
    List<BadgeDto> badges = Arrays.asList(testBadgeDto);
    when(badgeService.getAllActiveBadges()).thenReturn(badges);

    // Act & Assert
    mockMvc
        .perform(get("/api/badges"))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$[0].name").value("Test Badge"))
        .andExpect(jsonPath("$[0].description").value("A test badge"))
        .andExpect(jsonPath("$[0].icon").value("award"))
        .andExpect(jsonPath("$[0].color").value("#3ebb9e"));
  }

  @Test
  void getMyBadges_WithValidToken_ShouldReturnUserBadges() throws Exception {
    // Arrange
    List<BadgeDto> badges = Arrays.asList(testBadgeDto);
    when(jwtUtil.extractUsername("validToken")).thenReturn(testEmail);
    when(userService.getUserByEmail(testEmail)).thenReturn(testUser);
    when(badgeService.getUserBadges(testUserId)).thenReturn(badges);

    // Act & Assert
    mockMvc
        .perform(get("/api/badges/me").cookie(new Cookie("token", "validToken")))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$[0].name").value("Test Badge"))
        .andExpect(jsonPath("$[0].progress").value(50));
  }

  @Test
  void getMyBadges_WithoutToken_ShouldReturn401() throws Exception {
    // Act & Assert
    mockMvc.perform(get("/api/badges/me")).andExpect(status().isUnauthorized());
  }

  @Test
  void getMyBadges_WithInvalidUser_ShouldReturn404() throws Exception {
    // Arrange
    when(jwtUtil.extractUsername("validToken")).thenReturn(testEmail);
    when(userService.getUserByEmail(testEmail)).thenReturn(null);

    // Act & Assert
    mockMvc
        .perform(get("/api/badges/me").cookie(new Cookie("token", "validToken")))
        .andExpect(status().isNotFound());
  }

  @Test
  void getMyEarnedBadges_WithValidToken_ShouldReturnEarnedBadges() throws Exception {
    // Arrange
    testBadgeDto.setProgress(100);
    testBadgeDto.setEarnedAt(LocalDateTime.now());
    List<BadgeDto> earnedBadges = Arrays.asList(testBadgeDto);

    when(jwtUtil.extractUsername("validToken")).thenReturn(testEmail);
    when(userService.getUserByEmail(testEmail)).thenReturn(testUser);
    when(badgeService.getUserEarnedBadges(testUserId)).thenReturn(earnedBadges);

    // Act & Assert
    mockMvc
        .perform(get("/api/badges/me/earned").cookie(new Cookie("token", "validToken")))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$[0].name").value("Test Badge"))
        .andExpect(jsonPath("$[0].progress").value(100))
        .andExpect(jsonPath("$[0].earnedAt").exists());
  }

  @Test
  void getUserBadges_WithValidUserId_ShouldReturnUserBadges() throws Exception {
    // Arrange
    testBadgeDto.setProgress(100);
    List<BadgeDto> badges = Arrays.asList(testBadgeDto);
    when(badgeService.getUserEarnedBadges(testUserId)).thenReturn(badges);

    // Act & Assert
    mockMvc
        .perform(get("/api/badges/user/" + testUserId))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$[0].name").value("Test Badge"));
  }

  @Test
  void getUserBadgesByUsername_WithValidUsername_ShouldReturnUserBadges() throws Exception {
    // Arrange
    List<BadgeDto> badges = Arrays.asList(testBadgeDto);
    when(userService.getUserByUsername(testUsername)).thenReturn(testUser);
    when(badgeService.getUserEarnedBadges(testUserId)).thenReturn(badges);

    // Act & Assert
    mockMvc
        .perform(get("/api/badges/user/username/" + testUsername))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$").isArray())
        .andExpect(jsonPath("$[0].name").value("Test Badge"));
  }

  @Test
  void getUserBadgesByUsername_WithInvalidUsername_ShouldReturn404() throws Exception {
    // Arrange
    when(userService.getUserByUsername("nonexistent")).thenReturn(null);

    // Act & Assert
    mockMvc.perform(get("/api/badges/user/username/nonexistent")).andExpect(status().isNotFound());
  }

  @Test
  void toggleBadgeVisibility_WithValidRequest_ShouldToggleVisibility() throws Exception {
    // Arrange
    UUID badgeId = UUID.randomUUID();
    when(jwtUtil.extractUsername("validToken")).thenReturn(testEmail);
    when(userService.getUserByEmail(testEmail)).thenReturn(testUser);
    doNothing().when(badgeService).toggleBadgeVisibility(testUserId, badgeId);

    // Act & Assert
    mockMvc
        .perform(
            post("/api/badges/" + badgeId + "/toggle-visibility")
                .cookie(new Cookie("token", "validToken")))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.message").value("Badge visibility toggled"));
  }

  @Test
  void toggleBadgeVisibility_WithoutToken_ShouldReturn401() throws Exception {
    // Arrange
    UUID badgeId = UUID.randomUUID();

    // Act & Assert
    mockMvc
        .perform(post("/api/badges/" + badgeId + "/toggle-visibility"))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.error").value("Unauthorized"));
  }

  @Test
  void getMyBadgeCount_WithValidToken_ShouldReturnCount() throws Exception {
    // Arrange
    Long expectedCount = 5L;
    when(jwtUtil.extractUsername("validToken")).thenReturn(testEmail);
    when(userService.getUserByEmail(testEmail)).thenReturn(testUser);
    when(badgeService.getUserBadgeCount(testUserId)).thenReturn(expectedCount);

    // Act & Assert
    mockMvc
        .perform(get("/api/badges/me/count").cookie(new Cookie("token", "validToken")))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.count").value(5));
  }

  @Test
  void checkAndAwardMyBadges_WithValidToken_ShouldCheckBadges() throws Exception {
    // Arrange
    Long newCount = 3L;
    when(jwtUtil.extractUsername("validToken")).thenReturn(testEmail);
    when(userService.getUserByEmail(testEmail)).thenReturn(testUser);
    doNothing().when(badgeAwardingService).checkAndAwardAllBadges(testUserId);
    when(badgeService.getUserBadgeCount(testUserId)).thenReturn(newCount);

    // Act & Assert
    mockMvc
        .perform(post("/api/badges/me/check").cookie(new Cookie("token", "validToken")))
        .andExpect(status().isOk())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(jsonPath("$.message").value("Badge check completed successfully"))
        .andExpect(jsonPath("$.badgeCount").value(3))
        .andExpect(jsonPath("$.userId").value(testUserId.toString()));
  }

  @Test
  void checkAndAwardMyBadges_WithServiceException_ShouldReturn500() throws Exception {
    // Arrange
    when(jwtUtil.extractUsername("validToken")).thenReturn(testEmail);
    when(userService.getUserByEmail(testEmail)).thenReturn(testUser);
    doThrow(new RuntimeException("Service error"))
        .when(badgeAwardingService)
        .checkAndAwardAllBadges(testUserId);

    // Act & Assert
    mockMvc
        .perform(post("/api/badges/me/check").cookie(new Cookie("token", "validToken")))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.error").value("Badge check failed: Service error"));
  }
}
