package com.fiveOps.promptforge.analytics.dto;

import static org.junit.jupiter.api.Assertions.*;

import java.util.UUID;

import org.junit.jupiter.api.Test;

import com.fiveOps.promptforge.analytics.dto.FeaturedPromptDTO;
import com.fiveOps.promptforge.analytics.dto.TopRankingPromptDTO;
import com.fiveOps.promptforge.analytics.dto.TrendingPromptDTO;

class DtoGettersSettersTest {

  @Test
  void testTrendingPromptDTO() {
    UUID id = UUID.randomUUID();
    TrendingPromptDTO dto = new TrendingPromptDTO(id, "Title", 42);

    assertEquals(id, dto.getPromptId());
    assertEquals("Title", dto.getTitle());
    assertEquals(42, dto.getViewCount());

    dto.setPromptId(null);
    dto.setTitle("NewTitle");
    dto.setViewCount(100);

    assertNull(dto.getPromptId());
    assertEquals("NewTitle", dto.getTitle());
    assertEquals(100, dto.getViewCount());
  }

  @Test
  void testFeaturedPromptDTO() {
    UUID id = UUID.randomUUID();
    FeaturedPromptDTO dto = new FeaturedPromptDTO(id, "Title", "Desc");

    assertEquals(id, dto.getPromptId());
    assertEquals("Title", dto.getTitle());
    assertEquals("Desc", dto.getDescription());

    dto.setPromptId(null);
    dto.setTitle("NewTitle");
    dto.setDescription("NewDesc");

    assertNull(dto.getPromptId());
    assertEquals("NewTitle", dto.getTitle());
    assertEquals("NewDesc", dto.getDescription());
  }

  @Test
  void testTopRankingPromptDTO() {
    UUID id = UUID.randomUUID();
    TopRankingPromptDTO dto = new TopRankingPromptDTO(id, "Title", 4.5);

    assertEquals(id, dto.getPromptId());
    assertEquals("Title", dto.getTitle());
    assertEquals(4.5, dto.getAvgRating());

    dto.setPromptId(null);
    dto.setTitle("NewTitle");
    dto.setAvgRating(5.0);

    assertNull(dto.getPromptId());
    assertEquals("NewTitle", dto.getTitle());
    assertEquals(5.0, dto.getAvgRating());
  }

  @Test
  void testTrendingPromptDTONullAndNegativeValues() {
    TrendingPromptDTO dto = new TrendingPromptDTO(null, null, -1);

    assertNull(dto.getPromptId());
    assertNull(dto.getTitle());
    assertEquals(-1, dto.getViewCount());

    dto.setViewCount(0);
    assertEquals(0, dto.getViewCount());
  }

  @Test
  void testFeaturedPromptDTONullAndEmptyValues() {
    FeaturedPromptDTO dto = new FeaturedPromptDTO(null, "", null);

    assertNull(dto.getPromptId());
    assertEquals("", dto.getTitle());
    assertNull(dto.getDescription());

    dto.setTitle(null);
    assertNull(dto.getTitle());
  }

  @Test
  void testTopRankingPromptDTONegativeAndZeroRating() {
    TopRankingPromptDTO dto = new TopRankingPromptDTO(null, "test", -2.0);

    assertNull(dto.getPromptId());
    assertEquals("test", dto.getTitle());
    assertEquals(-2.0, dto.getAvgRating());

    dto.setAvgRating(0.0);
    assertEquals(0.0, dto.getAvgRating());
  }

  @Test
  void testTrendingPromptDTOSettersChaining() {
    TrendingPromptDTO dto = new TrendingPromptDTO(null, null, 0);
    dto.setPromptId(UUID.randomUUID());
    dto.setTitle("Chain");
    dto.setViewCount(123);

    assertNotNull(dto.getPromptId());
    assertEquals("Chain", dto.getTitle());
    assertEquals(123, dto.getViewCount());
  }

  @Test
  void testFeaturedPromptDTOSettersChaining() {
    FeaturedPromptDTO dto = new FeaturedPromptDTO(null, null, null);
    dto.setPromptId(UUID.randomUUID());
    dto.setTitle("Chain");
    dto.setDescription("ChainDesc");

    assertNotNull(dto.getPromptId());
    assertEquals("Chain", dto.getTitle());
    assertEquals("ChainDesc", dto.getDescription());
  }

  @Test
  void testTopRankingPromptDTOSettersChaining() {
    TopRankingPromptDTO dto = new TopRankingPromptDTO(null, null, 0.0);
    dto.setPromptId(UUID.randomUUID());
    dto.setTitle("Chain");
    dto.setAvgRating(3.14);

    assertNotNull(dto.getPromptId());
    assertEquals("Chain", dto.getTitle());
    assertEquals(3.14, dto.getAvgRating());
  }
}
