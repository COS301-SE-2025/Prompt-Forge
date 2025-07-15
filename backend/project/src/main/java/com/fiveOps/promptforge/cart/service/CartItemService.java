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
import com.fiveOps.promptforge.user_profile.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartItemService {

  private final CartItemRepository cartItemRepository;
  private final UserRepository userRepository;
  private final PromptRepository promptRepository;
  private final PromptStoreService promptStoreService;
  private final UserService userService;

  public Page<CartItemDTO> getCartItemsForUser(UUID userId, Pageable pageable) {
    Page<Object[]> results = cartItemRepository.findCartItemsWithTagsByUserId(userId, pageable);

    List<CartItemDTO> dtos = results.stream()
        .map(
            row -> {
              UUID cartItemId = (UUID) row[0];
              UUID fetchedUserId = (UUID) row[1];
              String authorName = (String) row[2];
              UUID promptId = (UUID) row[3];
              String promptTitle = (String) row[4];
              String[] promptTags = (String[]) row[5];
              Double promptPrice = (Double) row[6];

              return new CartItemDTO(
                  cartItemId,
                  fetchedUserId,
                  authorName,
                  promptId,
                  promptTitle,
                  promptTags,
                  promptPrice);
            })
        .toList();

    return new PageImpl<>(dtos, pageable, results.getTotalElements());
  }

  public CartItem addItemToCart(UUID userId, UUID promptId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));
    Prompt prompt = promptRepository
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

  public void removeItemsFromCartByUserID(UUID userId) {
    cartItemRepository.deletebyUserID(userId);
  }

  public Boolean isPromptAddedToCart(UUID userId, UUID promptId) {
    List<Object[]> records = cartItemRepository.findByUserIdAndPromptId(userId, promptId);
    return records.size() > 0;
  }

  public void purchase(String customerEmail, List<CartItemDTO> prompts) 
  throws Exception{
    UUID userId = userService.getUserIdByEmail(customerEmail);

    try{
      for (int i = 0; i < prompts.size(); i++) {
        UUID promptId = prompts.get(i).getPromptId();
        promptStoreService.purchasePrompt(promptId, userId);
        System.out.println("Successfully purchased prompt: " + promptId);
      }
      removeItemsFromCartByUserID(userId);
      System.out.println("\n\nCheckout completed successfully");
    } 
    catch (Exception e) {
      System.out.println("error adding to cart:");
      System.out.println(e);
      throw e;
      // TODO: handle exception
    }
  }

}
