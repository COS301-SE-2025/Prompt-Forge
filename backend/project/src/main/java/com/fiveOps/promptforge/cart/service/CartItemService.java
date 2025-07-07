package com.fiveOps.promptforge.cart.service;

import java.util.List;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.fiveOps.promptforge.cart.dto.CartItemDTO;
import com.fiveOps.promptforge.cart.model.CartItem;
import com.fiveOps.promptforge.cart.repository.CartItemRepository;
import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.prompts.repository.PromptRepository;
import com.fiveOps.promptforge.promptstore.service.PromptStoreService;
import com.fiveOps.promptforge.user_profile.model.User;
import com.fiveOps.promptforge.user_profile.repository.UserRepository;

@Service
public class CartItemService {

  private final CartItemRepository cartItemRepository;
  private final UserRepository userRepository;
  private final PromptRepository promptRepository;
  private final PromptStoreService promptStoreService;

  public CartItemService(
      CartItemRepository cartItemRepository,
      UserRepository userRepository,
      PromptRepository promptRepository,
      PromptStoreService promptStoreService) {
    this.cartItemRepository = cartItemRepository;
    this.userRepository = userRepository;
    this.promptRepository = promptRepository;
    this.promptStoreService = promptStoreService;
  }

  public Page<CartItemDTO> getCartItemsForUser(UUID userId, Pageable pageable) {
    Page<Object[]> results = cartItemRepository.findCartItemsWithTagsByUserId(userId, pageable);

    List<CartItemDTO> dtos =
        results.stream()
            .map(
                row -> {
                  UUID cartItemId = (UUID) row[0];
                  UUID fetchedUserId = (UUID) row[1];
                  String username = (String) row[2];
                  UUID promptId = (UUID) row[3];
                  String promptTitle = (String) row[4];
                  String[] promptTags = (String[]) row[5];
                  Double promptPrice = (Double) row[6];

                  return new CartItemDTO(
                      cartItemId,
                      fetchedUserId,
                      username,
                      promptId,
                      promptTitle,
                      promptTags,
                      promptPrice);
                })
            .toList();

    return new PageImpl<>(dtos, pageable, results.getTotalElements());
  }

  public CartItem addItemToCart(UUID userId, UUID promptId) {
    User user =
        userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
    Prompt prompt =
        promptRepository
            .findById(promptId)
            .orElseThrow(() -> new RuntimeException("Prompt not found"));

    CartItem cartItem = new CartItem();
    cartItem.setUser(user);
    cartItem.setPrompt(prompt);

    System.out.println("cartItem: " + cartItem);

    try {
      return cartItemRepository.save(cartItem);
    } catch (DataIntegrityViolationException ex) {
      throw new RuntimeException("Prompt has already been added to your cart.");
    } catch (Exception e) {
      throw new RuntimeException("Failed to save cart item: " + e.getMessage(), e);
    }
  }

  public void removeItemFromCart(UUID userId, UUID promptId) {
    cartItemRepository.deleteByUserIdAndPromptId(userId, promptId);
  }

  public Boolean isPromptAddedToCart(UUID userId, UUID promptId) {
    List<Object[]> records = cartItemRepository.findByUserIdAndPromptId(userId, promptId);
    return records.size() > 0;
  }

  public void checkout(UUID userId, List<CartItemDTO> prompts) {

    try {
      for (int i = 0; i < prompts.size(); i++) {
        CartItemDTO cartItem = prompts.get(i);
        UUID promptId = cartItem.getPromptId();

        Prompt prompt = promptRepository.findById(promptId).orElse(null);
        if (prompt == null) {
          try {
            removeItemFromCart(userId, promptId);
            System.out.println("Removed invalid cart item for prompt: " + promptId);
          } catch (Exception e) {
            System.out.println("Failed to remove invalid cart item: " + e.getMessage());
          }

          // Skip this prompt and continue with others
          continue;
        }

        System.out.println(
            "Found prompt: " + prompt.getTitle() + " (Price: " + prompt.getPrice() + ")");

        // Proceed with purchase
        promptStoreService.purchasePrompt(promptId, userId);
        removeItemFromCart(userId, promptId);
        System.out.println("Successfully purchased prompt: " + promptId);
      }
      System.out.println("Checkout completed successfully");
    } catch (Exception e) {
      System.out.println("error purchasing:");
      System.out.println(e);
      // TODO: handle exception
    }
  }
}
