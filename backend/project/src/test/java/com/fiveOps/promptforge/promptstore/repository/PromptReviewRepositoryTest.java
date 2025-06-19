// package com.fiveOps.promptforge.promptstore.repository;

// import java.util.List;
// import java.util.UUID;

// import static org.junit.jupiter.api.Assertions.assertEquals;
// import static org.junit.jupiter.api.Assertions.assertTrue;
// import org.junit.jupiter.api.Test;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
// import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

// import com.fiveOps.promptforge.promptstore.model.PromptReview;

// @DataJpaTest
// class PromptReviewRepositoryTest {

//     @Autowired
//     private TestEntityManager entityManager;

//     @Autowired
//     private PromptReviewRepository reviewRepository;

//     @Test
//     void findByPromptId_ShouldReturnPromptReviews() {
//         // Arrange
//         UUID promptId = UUID.randomUUID();
        
//         PromptReview review1 = new PromptReview();
//         review1.setPromptId(promptId);
//         review1.setUserId(UUID.randomUUID());
//         review1.setRating(4.5);
        
//         PromptReview review2 = new PromptReview();
//         review2.setPromptId(UUID.randomUUID());
//         review2.setUserId(UUID.randomUUID());
//         review2.setRating(3.5);
        
//         entityManager.persist(review1);
//         entityManager.persist(review2);
//         entityManager.flush();

//         // Act
//         List<PromptReview> result = reviewRepository.findByPromptId(promptId);

//         // Assert
//         assertEquals(1, result.size());
//         assertEquals(review1.getPromptId(), result.get(0).getPromptId());
//     }

//     @Test
//     void existsByPromptIdAndUserId_ShouldReturnTrueWhenExists() {
//         // Arrange
//         UUID promptId = UUID.randomUUID();
//         UUID userId = UUID.randomUUID();
        
//         PromptReview review = new PromptReview();
//         review.setPromptId(promptId);
//         review.setUserId(userId);
//         review.setRating(5.0);
        
//         entityManager.persist(review);
//         entityManager.flush();

//         // Act
//         boolean exists = reviewRepository.existsByPromptIdAndUserId(promptId, userId);

//         // Assert
//         assertTrue(exists);
//     }

//     @Test
//     void calculateAverageRating_ShouldReturnCorrectAverage() {
//         // Arrange
//         UUID promptId = UUID.randomUUID();
        
//         PromptReview review1 = new PromptReview();
//         review1.setPromptId(promptId);
//         review1.setUserId(UUID.randomUUID());
//         review1.setRating(4.0);
        
//         PromptReview review2 = new PromptReview();
//         review2.setPromptId(promptId);
//         review2.setUserId(UUID.randomUUID());
//         review2.setRating(5.0);
        
//         entityManager.persist(review1);
//         entityManager.persist(review2);
//         entityManager.flush();

//         // Act
//         Double average = reviewRepository.calculateAverageRating(promptId);

//         // Assert
//         assertEquals(4.5, average);
//     }
// }