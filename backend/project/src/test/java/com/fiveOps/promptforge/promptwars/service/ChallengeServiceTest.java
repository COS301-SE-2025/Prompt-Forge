package com.fiveOps.promptforge.promptwars.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;

import com.fiveOps.promptforge.promptwars.model.Challenge;
import com.fiveOps.promptforge.promptwars.model.Game;
import com.fiveOps.promptforge.promptwars.model.GameType;
import com.fiveOps.promptforge.promptwars.repository.ChallengeRepository;
import com.fiveOps.promptforge.promptwars.repository.GameRepository;
import com.fiveOps.promptforge.user_profile.model.User;
import com.fiveOps.promptforge.user_profile.repository.UserRepository;

public class ChallengeServiceTest {

  @Mock private ChallengeRepository challengeRepository;
  @Mock private GameRepository gameRepository;
  @Mock private UserRepository userRepository;
  @Mock private WebSocketService webSocketService;
  @Mock private GameService gameService;

  @InjectMocks private ChallengeService challengeServiceUnderTest;

  @BeforeEach
  public void setup() {
    MockitoAnnotations.openMocks(this);
  }

  @Test
  public void sendChallenge_happyPath_savesAndNotifies() {
    UUID challenger = UUID.randomUUID();
    UUID opponent = UUID.randomUUID();

    when(userRepository.existsById(challenger)).thenReturn(true);
    when(userRepository.existsById(opponent)).thenReturn(true);
    when(challengeRepository.existsPendingChallengeBetweenUsers(any(), any(), any()))
        .thenReturn(false);

    // Make save return the passed challenge
    when(challengeRepository.save(any())).thenAnswer(i -> i.getArgument(0));

    User mockedUser = Mockito.mock(User.class);
    when(mockedUser.getUsername()).thenReturn("challengerName");
    when(userRepository.findById(challenger)).thenReturn(Optional.of(mockedUser));

    doNothing().when(webSocketService).sendChallengeNotification(eq(opponent), any(), any());

    Challenge saved =
        challengeServiceUnderTest.sendChallenge(
            challenger, opponent, "yo", GameType.PROMPT_CREATION);

    assertNotNull(saved);
    verify(challengeRepository).save(any());
    verify(webSocketService).sendChallengeNotification(eq(opponent), any(), any());
  }

  @Test
  public void sendChallenge_sameUser_throws() {
    UUID id = UUID.randomUUID();
    IllegalArgumentException ex =
        assertThrows(
            IllegalArgumentException.class,
            () -> {
              challengeServiceUnderTest.sendChallenge(id, id, "hi");
            });
    assertTrue(ex.getMessage().toLowerCase().contains("cannot challenge yourself"));
  }

  @Test
  public void sendChallenge_opponentOffline_throws() {
    UUID challenger = UUID.randomUUID();
    UUID opponent = UUID.randomUUID();

    when(userRepository.existsById(challenger)).thenReturn(true);
    when(userRepository.existsById(opponent)).thenReturn(false);

    assertThrows(
        IllegalArgumentException.class,
        () -> challengeServiceUnderTest.sendChallenge(challenger, opponent, "msg"));
  }

  @Test
  public void sendChallenge_pendingExists_throws() {
    UUID challenger = UUID.randomUUID();
    UUID opponent = UUID.randomUUID();

    when(userRepository.existsById(challenger)).thenReturn(true);
    when(userRepository.existsById(opponent)).thenReturn(true);
    when(challengeRepository.existsPendingChallengeBetweenUsers(any(), any(), any()))
        .thenReturn(true);

    // Ensure findById returns something so service doesn't NPE while handling the check
    when(userRepository.findById(challenger)).thenReturn(Optional.of(Mockito.mock(User.class)));

    assertThrows(
        IllegalArgumentException.class,
        () -> challengeServiceUnderTest.sendChallenge(challenger, opponent, "msg"));
  }

  @Test
  public void acceptChallenge_wrongPlayer_throws() {
    UUID challenger = UUID.randomUUID();
    UUID opponent = UUID.randomUUID();
    UUID other = UUID.randomUUID();
    UUID challengeId = UUID.randomUUID();

    Challenge ch = new Challenge(challenger, opponent, GameType.PROMPT_CREATION);
    when(challengeRepository.findById(challengeId)).thenReturn(Optional.of(ch));

    assertThrows(
        IllegalArgumentException.class,
        () -> challengeServiceUnderTest.acceptChallenge(challengeId, other));
  }

  @Test
  public void declineChallenge_wrongPlayer_throws() {
    UUID challenger = UUID.randomUUID();
    UUID opponent = UUID.randomUUID();
    UUID other = UUID.randomUUID();
    UUID challengeId = UUID.randomUUID();

    Challenge ch = new Challenge(challenger, opponent, GameType.PROMPT_CREATION);
    when(challengeRepository.findById(challengeId)).thenReturn(Optional.of(ch));

    assertThrows(
        IllegalArgumentException.class,
        () -> challengeServiceUnderTest.declineChallenge(challengeId, other));
  }

  @Test
  public void expireOldChallenges_marksExpired_andNotifies() {
    Challenge ch = new Challenge(UUID.randomUUID(), UUID.randomUUID(), GameType.PROMPT_CREATION);
    ch.setExpiresAt(Instant.now().minusSeconds(10));

  when(challengeRepository.findExpiredChallenges(any(Instant.class)))
    .thenReturn(java.util.List.of(ch));

    challengeServiceUnderTest.expireOldChallenges();

    verify(challengeRepository).save(any());
    verify(webSocketService).sendChallengeExpired(any(), any());
  }

  @Test
  public void acceptChallenge_happyPath_createsGameAndNotifies() {
    UUID challenger = UUID.randomUUID();
    UUID opponent = UUID.randomUUID();
    UUID challengeId = UUID.randomUUID();

    Challenge ch = new Challenge(challenger, opponent, GameType.PROMPT_CREATION);
    // ensure pending
    // using real Challenge object methods

    when(challengeRepository.findById(challengeId)).thenReturn(Optional.of(ch));
    when(gameRepository.isPlayerInActiveGame(any(), any(), any())).thenReturn(false);

    Game g = new Game();
    when(gameService.createGame(ch.getChallengerId(), ch.getOpponentId(), ch.getGameType()))
        .thenReturn(g);

    User u1 = Mockito.mock(User.class);
    User u2 = Mockito.mock(User.class);
    when(userRepository.findById(ch.getChallengerId())).thenReturn(Optional.of(u1));
    when(userRepository.findById(ch.getOpponentId())).thenReturn(Optional.of(u2));

    doNothing().when(webSocketService).sendGameStartNotification(any(), any(), any(), any());

    Game result = challengeServiceUnderTest.acceptChallenge(challengeId, opponent);

    assertSame(g, result);
    // The service notifies both players -> should be called twice
    verify(webSocketService, Mockito.times(2))
        .sendGameStartNotification(any(), any(), any(), any());
  }

  @Test
  public void declineChallenge_happyPath_declinesAndNotifies() {
    UUID challenger = UUID.randomUUID();
    UUID opponent = UUID.randomUUID();
    UUID challengeId = UUID.randomUUID();

    Challenge ch = new Challenge(challenger, opponent, GameType.PROMPT_CREATION);
    when(challengeRepository.findById(challengeId)).thenReturn(Optional.of(ch));

    doNothing().when(webSocketService).sendChallengeDeclined(any(), any());

    challengeServiceUnderTest.declineChallenge(challengeId, opponent);

    verify(challengeRepository).save(any());
    verify(webSocketService).sendChallengeDeclined(any(), any());
  }
}
