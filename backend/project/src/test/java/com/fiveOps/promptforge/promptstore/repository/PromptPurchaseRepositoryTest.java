// package com.fiveOps.promptforge.promptstore.repository;

// import java.time.LocalDateTime;
// import java.util.List;
// import java.util.UUID;

// import static org.junit.jupiter.api.Assertions.assertEquals;
// import static org.junit.jupiter.api.Assertions.assertTrue;
// import org.junit.jupiter.api.Test;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
// import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

// import com.fiveOps.promptforge.promptstore.model.PromptPurchase;

// @DataJpaTest
// class PromptPurchaseRepositoryTest {

//     @Autowired
//     private TestEntityManager entityManager;

//     @Autowired
//     private PromptPurchaseRepository purchaseRepository;

//     @Test
//     void existsByPromptIdAndUserId_ShouldReturnTrueWhenExists() {
//         // Arrange
//         UUID promptId = UUID.randomUUID();
//         UUID userId = UUID.randomUUID();
        
//         PromptPurchase purchase = new PromptPurchase();
//         purchase.setPromptId(promptId);
//         purchase.setUserId(userId);
//         purchase.setPricePaid(10.0);
//         purchase.setPurchasedAt(LocalDateTime.now());
        
//         entityManager.persist(purchase);
//         entityManager.flush();

//         // Act
//         boolean exists = purchaseRepository.existsByPromptIdAndUserId(promptId, userId);

//         // Assert
//         assertTrue(exists);
//     }

//     @Test
//     void findByUserId_ShouldReturnUserPurchases() {
//         // Arrange
//         UUID userId = UUID.randomUUID();
        
//         PromptPurchase purchase1 = new PromptPurchase();
//         purchase1.setPromptId(UUID.randomUUID());
//         purchase1.setUserId(userId);
//         purchase1.setPricePaid(10.0);
        
//         PromptPurchase purchase2 = new PromptPurchase();
//         purchase2.setPromptId(UUID.randomUUID());
//         purchase2.setUserId(UUID.randomUUID());
//         purchase2.setPricePaid(15.0);
        
//         entityManager.persist(purchase1);
//         entityManager.persist(purchase2);
//         entityManager.flush();

//         // Act
//         List<PromptPurchase> result = purchaseRepository.findByUserId(userId);

//         // Assert
//         assertEquals(1, result.size());
//         assertEquals(purchase1.getPromptId(), result.get(0).getPromptId());
//     }

//     @Test
//     void countByPromptId_ShouldReturnPurchaseCount() {
//         // Arrange
//         UUID promptId = UUID.randomUUID();
        
//         PromptPurchase purchase1 = new PromptPurchase();
//         purchase1.setPromptId(promptId);
//         purchase1.setUserId(UUID.randomUUID());
        
//         PromptPurchase purchase2 = new PromptPurchase();
//         purchase2.setPromptId(promptId);
//         purchase2.setUserId(UUID.randomUUID());
        
//         entityManager.persist(purchase1);
//         entityManager.persist(purchase2);
//         entityManager.flush();

//         // Act
//         Long count = purchaseRepository.countByPromptId(promptId);

//         // Assert
//         assertEquals(2, count);
//     }
// }