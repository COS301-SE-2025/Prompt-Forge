package com.fiveOps.promptforge.cart;

import com.fiveOps.promptforge.cart.dto.CartItemDTO;
import com.fiveOps.promptforge.cart.model.CartItem;
import com.fiveOps.promptforge.cart.repository.CartItemRepository;
import com.fiveOps.promptforge.cart.service.CartItemService;
import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.prompts.repository.PromptRepository;
import com.fiveOps.promptforge.promptstore.service.PromptStoreService;
import com.fiveOps.promptforge.user_profile.model.User;
import com.fiveOps.promptforge.user_profile.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartItemServiceTest {
    @Mock private CartItemRepository cartItemRepository;
    @Mock private UserRepository userRepository;
    @Mock private PromptRepository promptRepository;
    @Mock private PromptStoreService promptStoreService;
    @InjectMocks private CartItemService service;

    private UUID userId;
    private UUID promptId;
    private User user;
    private Prompt prompt;
    private CartItem cartItem;
    private Pageable pageable;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        promptId = UUID.randomUUID();
        user = mock(User.class);
        prompt = mock(Prompt.class);
        cartItem = new CartItem();
        pageable = mock(Pageable.class);
    }

    @Test
    void getCartItemsForUser_ShouldReturnPage() {
        Page<Object[]> page = mock(Page.class);
        when(cartItemRepository.findCartItemsWithTagsByUserId(userId, pageable)).thenReturn(page);
        when(page.stream()).thenReturn(Collections.<Object[]>emptyList().stream());
        when(page.getTotalElements()).thenReturn(0L);
        Page<CartItemDTO> result = service.getCartItemsForUser(userId, pageable);
        assertNotNull(result);
    }

    @Test
    void addItemToCart_ShouldAddSuccessfully() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(promptRepository.findById(promptId)).thenReturn(Optional.of(prompt));
        when(cartItemRepository.save(any(CartItem.class))).thenReturn(cartItem);
        CartItem result = service.addItemToCart(userId, promptId);
        assertNotNull(result);
    }

    @Test
    void addItemToCart_ShouldThrowIfUserNotFound() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.addItemToCart(userId, promptId));
    }

    @Test
    void addItemToCart_ShouldThrowIfPromptNotFound() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(promptRepository.findById(promptId)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.addItemToCart(userId, promptId));
    }

    // @Test
    // void addItemToCart_ShouldThrowIfAlreadyAdded() {
    //     when(userRepository.findById(userId)).thenReturn(Optional.of(user));
    //     when(promptRepository.findById(promptId)).thenReturn(Optional.of(prompt));
    //     when(cartItemRepository.save(any(CartItem.class))).thenThrow(new DataIntegrityViolationException("already added"));
    //     //assertThrows(RuntimeException.class, () -> service.addItemToCart(userId, promptId));
    // }

    @Test
    void addItemToCart_ShouldThrowOnOtherException() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(promptRepository.findById(promptId)).thenReturn(Optional.of(prompt));
        when(cartItemRepository.save(any(CartItem.class))).thenThrow(new RuntimeException("fail"));
        assertThrows(RuntimeException.class, () -> service.addItemToCart(userId, promptId));
    }

    @Test
    void removeItemFromCart_ShouldCallRepository() {
        doNothing().when(cartItemRepository).deleteByUserIdAndPromptId(userId, promptId);
        assertDoesNotThrow(() -> service.removeItemFromCart(userId, promptId));
    }

    @Test
    void isPromptAddedToCart_ShouldReturnFalse() {
        when(cartItemRepository.findByUserIdAndPromptId(userId, promptId)).thenReturn(Collections.emptyList());
        assertFalse(service.isPromptAddedToCart(userId, promptId));
    }

    @Test
    void checkout_ShouldSkipInvalidPrompts() {
        CartItemDTO dto = mock(CartItemDTO.class);
        when(dto.getPromptId()).thenReturn(promptId);
        when(promptRepository.findById(promptId)).thenReturn(Optional.empty());
        doNothing().when(cartItemRepository).deleteByUserIdAndPromptId(userId, promptId);
        service.checkout(userId, List.of(dto));
        verify(cartItemRepository).deleteByUserIdAndPromptId(userId, promptId);
        verify(promptStoreService, never()).purchasePrompt(any(), any());
    }

} 