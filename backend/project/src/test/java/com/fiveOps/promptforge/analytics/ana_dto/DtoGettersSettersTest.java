package com.fiveOps.promptforge.analytics.ana_dto;
// package com.fiveOps.promptforge.analytics.ana_dto;

// import org.junit.jupiter.api.Test;

// import java.util.UUID;

// import static org.junit.jupiter.api.Assertions.*;

// class DtoGettersSettersTest {

//     @Test
//     void testTrendingPromptDTO() {
//         UUID id = UUID.randomUUID();
//         TrendingPromptDTO dto = new TrendingPromptDTO(id, "Title", 42);

//         assertEquals(id, dto.getPromptId());
//         assertEquals("Title", dto.getTitle());
//         assertEquals(42, dto.getViewCount());

//         dto.setPromptId(null);
//         dto.setTitle("NewTitle");
//         dto.setViewCount(100);

//         assertNull(dto.getPromptId());
//         assertEquals("NewTitle", dto.getTitle());
//         assertEquals(100, dto.getViewCount());
//     }

//     @Test
//     void testFeaturedPromptDTO() {
//         UUID id = UUID.randomUUID();
//         FeaturedPromptDTO dto = new FeaturedPromptDTO(id, "Title", "Desc");

//         assertEquals(id, dto.getPromptId());
//         assertEquals("Title", dto.getTitle());
//         assertEquals("Desc", dto.getDescription());

//         dto.setPromptId(null);
//         dto.setTitle("NewTitle");
//         dto.setDescription("NewDesc");

//         assertNull(dto.getPromptId());
//         assertEquals("NewTitle", dto.getTitle());
//         assertEquals("NewDesc", dto.getDescription());
//     }

//     @Test
//     void testTopRankingPromptDTO() {
//         UUID id = UUID.randomUUID();
//         TopRankingPromptDTO dto = new TopRankingPromptDTO(id, "Title", 4.5);

//         assertEquals(id, dto.getPromptId());
//         assertEquals("Title", dto.getTitle());
//         assertEquals(4.5, dto.getAvgRating());

//         dto.setPromptId(null);
//         dto.setTitle("NewTitle");
//         dto.setAvgRating(5.0);

//         assertNull(dto.getPromptId());
//         assertEquals("NewTitle", dto.getTitle());
//         assertEquals(5.0, dto.getAvgRating());
//     }
// }