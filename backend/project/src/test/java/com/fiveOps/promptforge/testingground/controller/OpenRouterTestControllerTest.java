package com.fiveOps.promptforge.testingground.controller;

import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

class OpenRouterTestControllerTest {

  @Test
  void postConstruct_throwsWhenApiKeyMissing() {
    MockEnvironment env = new MockEnvironment();

    OpenRouterTestController controller = new OpenRouterTestController();
    // Inject Environment via reflection since field is package-private with
    // @Autowired
    try {
      java.lang.reflect.Field envField = OpenRouterTestController.class.getDeclaredField("env");
      envField.setAccessible(true);
      envField.set(controller, env);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }

    assertThrows(IllegalStateException.class, controller::init);
  }

  @Test
  void postConstruct_succeedsWhenApiKeyPresent() {
    MockEnvironment env = new MockEnvironment().withProperty("OPENROUTER_API_KEY", "abc123");

    OpenRouterTestController controller = new OpenRouterTestController();
    try {
      java.lang.reflect.Field envField = OpenRouterTestController.class.getDeclaredField("env");
      envField.setAccessible(true);
      envField.set(controller, env);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }

    controller.init();
  }
}
