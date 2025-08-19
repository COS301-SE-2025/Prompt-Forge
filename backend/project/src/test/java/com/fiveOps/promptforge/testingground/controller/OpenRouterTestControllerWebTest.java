package com.fiveOps.promptforge.testingground.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;

import com.fiveOps.promptforge.securityConfig.JwtFilter;
import com.fiveOps.promptforge.securityConfig.SecurityConfig;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

@WebMvcTest(
    controllers = OpenRouterTestController.class,
    excludeFilters =
        @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = SecurityConfig.class))
@AutoConfigureMockMvc(addFilters = false)
@TestPropertySource(properties = "OPENROUTER_API_KEY=test-key")
class OpenRouterTestControllerWebTest {

  @Autowired private MockMvc mockMvc;

  @MockBean private JwtFilter jwtFilter;

  @Autowired private OpenRouterTestController controller;

  private HttpServer server;

  @AfterEach
  void tearDownServer() {
    if (server != null) {
      server.stop(0);
      server = null;
    }
  }

  private void setControllerBaseUrl(String baseUrl) throws Exception {
    java.lang.reflect.Field f = OpenRouterTestController.class.getDeclaredField("baseUrl");
    f.setAccessible(true);
    f.set(controller, baseUrl);
  }

  private void startMockOpenRouter(int statusCode, String contentType, byte[] responseBody)
      throws Exception {
    server = HttpServer.create(new InetSocketAddress(0), 0);
    server.createContext(
        "/api/v1/chat/completions",
        new HttpHandler() {
          @Override
          public void handle(HttpExchange exchange) throws IOException {
            exchange.getResponseHeaders().set("Content-Type", contentType);
            exchange.sendResponseHeaders(statusCode, responseBody.length);
            try (OutputStream os = exchange.getResponseBody()) {
              os.write(responseBody);
            }
          }
        });
    server.start();
    String baseUrl = "http://127.0.0.1:" + server.getAddress().getPort() + "/api/v1";
    setControllerBaseUrl(baseUrl);
  }

  @Test
  void chat_missingModel_returnsBadRequest() throws Exception {
    mockMvc
        .perform(
            post("/api/test/openrouter/chat").contentType(MediaType.APPLICATION_JSON).content("{}"))
        .andExpect(status().isBadRequest())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(content().json("{\"error\":\"Model field is required\"}"));
  }

  @Test
  void chat_streamTrue_redirectsToStreamEndpoint() throws Exception {
    String body = "{\"model\":\"test-model\",\"stream\":true}";

    mockMvc
        .perform(
            post("/api/test/openrouter/chat").contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isMovedPermanently())
        .andExpect(header().string("Location", "/api/test/openrouter/chat/stream"))
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(
            content().json("{\"message\":\"Use /chat/stream endpoint for streaming requests\"}"));
  }

  @Test
  void chat_regular_success_forwardsBody() throws Exception {
    startMockOpenRouter(200, "application/json", "{\"ok\":true}".getBytes(StandardCharsets.UTF_8));

    String body =
        "{\"model\":\"test-model\",\"messages\":[{\"role\":\"user\",\"content\":\"Hi\"}]}";
    mockMvc
        .perform(
            post("/api/test/openrouter/chat").contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isOk())
        .andExpect(content().json("{\"ok\":true}"));
  }

  @Test
  void chat_regular_clientError_400() throws Exception {
    startMockOpenRouter(400, "text/plain", "bad-request".getBytes(StandardCharsets.UTF_8));

    String body = "{\"model\":\"m\",\"messages\":[{\"role\":\"user\",\"content\":\"Hi\"}]}";
    mockMvc
        .perform(
            post("/api/test/openrouter/chat").contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isBadRequest())
        .andExpect(content().json("{\"error\":\"bad-request\"}"));
  }

  @Test
  void chat_regular_serverError_503_userMessage() throws Exception {
    startMockOpenRouter(503, "text/plain", "unavailable".getBytes(StandardCharsets.UTF_8));

    String body = "{\"model\":\"abc\",\"messages\":[{\"role\":\"user\",\"content\":\"Hi\"}]}";
    mockMvc
        .perform(
            post("/api/test/openrouter/chat").contentType(MediaType.APPLICATION_JSON).content(body))
        .andExpect(status().isServiceUnavailable())
        .andExpect(content().string(Matchers.containsString("\"error\":\"unavailable\"")))
        .andExpect(
            content().string(Matchers.containsString("The model abc is currently unavailable")));
  }

  @Test
  void chatStream_missingModel_returnsSseError() throws Exception {
    MvcResult mvcResult =
        mockMvc
            .perform(
                post("/api/test/openrouter/chat/stream")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{}"))
            .andExpect(request().asyncStarted())
            .andReturn();

    mockMvc
        .perform(
            org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch(
                mvcResult))
        .andDo(MockMvcResultHandlers.print())
        .andExpect(status().isBadRequest())
        .andExpect(
            content()
                .string(
                    org.hamcrest.Matchers.containsString(
                        "data: {\"error\":{\"message\":\"Model field is required\"}}")))
        .andExpect(content().string(org.hamcrest.Matchers.containsString("data: [DONE]")));
  }

  @Test
  void chatStream_upstreamError_returnsSseError() throws Exception {
    startMockOpenRouter(500, "text/plain", "boom".getBytes(StandardCharsets.UTF_8));

    String body =
        "{\"model\":\"abc\",\"stream\":true,\"messages\":[{\"role\":\"user\",\"content\":\"Hi\"}]}";
    MvcResult mvcResult =
        mockMvc
            .perform(
                post("/api/test/openrouter/chat/stream")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(body))
            .andExpect(request().asyncStarted())
            .andReturn();

    mockMvc
        .perform(
            org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch(
                mvcResult))
        .andExpect(status().isOk())
        .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_EVENT_STREAM))
        .andExpect(content().string(Matchers.containsString("OpenRouter error: boom")))
        .andExpect(content().string(Matchers.containsString("data: [DONE]")));
  }

  @Test
  void chatStream_upstreamNoContent_yieldsNoContentGeneratedError() throws Exception {
    String sseBody = ": keep-alive\n\n" + "data: [DONE]\n\n";
    startMockOpenRouter(200, "text/event-stream", sseBody.getBytes(StandardCharsets.UTF_8));

    String body =
        "{\"model\":\"abc\",\"stream\":true,\"messages\":[{\"role\":\"user\",\"content\":\"Hi\"}]}";
    MvcResult mvcResult =
        mockMvc
            .perform(
                post("/api/test/openrouter/chat/stream")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(body))
            .andExpect(request().asyncStarted())
            .andReturn();

    mockMvc
        .perform(
            org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch(
                mvcResult))
        .andExpect(status().isOk())
        .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_EVENT_STREAM))
        .andExpect(content().string(Matchers.containsString("No content generated by the model")))
        .andExpect(content().string(Matchers.containsString("data: [DONE]")));
  }

  @Test
  void chatStream_upstreamContent_forwardsChunks() throws Exception {
    String sseBody =
        ": keep-alive\n\n"
            + "data: {\\\"choices\\\":[{\\\"delta\\\":{\\\"content\\\":\\\"Hel\\\"}}]}\n\n"
            + "data: {\\\"choices\\\":[{\\\"delta\\\":{\\\"content\\\":\\\"lo\\\"}}]}\n\n"
            + "data: [DONE]\n\n";
    startMockOpenRouter(200, "text/event-stream", sseBody.getBytes(StandardCharsets.UTF_8));

    String body =
        "{\"model\":\"abc\",\"stream\":true,\"messages\":[{\"role\":\"user\",\"content\":\"Hi\"}]}";
    MvcResult mvcResult =
        mockMvc
            .perform(
                post("/api/test/openrouter/chat/stream")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(body))
            .andExpect(request().asyncStarted())
            .andReturn();

    mockMvc
        .perform(
            org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch(
                mvcResult))
        .andExpect(status().isOk())
        .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_EVENT_STREAM))
        .andExpect(content().string(Matchers.containsString("connection established")))
        .andExpect(content().string(Matchers.containsString("data:")))
        .andExpect(content().string(Matchers.containsString("data: [DONE]")))
        .andExpect(content().string(Matchers.not(Matchers.containsString(": keep-alive"))));
  }

  @Test
  void chatStream_nonJsonData_forwarded() throws Exception {
    String sseBody = "data: not-json\n\n" + "data: [DONE]\n\n";
    startMockOpenRouter(200, "text/event-stream", sseBody.getBytes(StandardCharsets.UTF_8));

    String body =
        "{\"model\":\"abc\",\"stream\":true,\"messages\":[{\"role\":\"user\",\"content\":\"Hi\"}]}";
    MvcResult mvcResult =
        mockMvc
            .perform(
                post("/api/test/openrouter/chat/stream")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(body))
            .andExpect(request().asyncStarted())
            .andReturn();

    mockMvc
        .perform(
            org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch(
                mvcResult))
        .andExpect(status().isOk())
        .andExpect(content().string(Matchers.containsString("data: not-json")))
        .andExpect(content().string(Matchers.containsString("data: [DONE]")));
  }

  @Test
  void testConnection_returnsStatusAndApiKeyLength() throws Exception {
    startMockOpenRouter(200, "application/json", "{\"ok\":true}".getBytes(StandardCharsets.UTF_8));

    mockMvc
        .perform(post("/api/test/openrouter/test-connection"))
        .andExpect(status().isOk())
        .andExpect(content().string(Matchers.containsString("\"status\":200")))
        .andExpect(content().string(Matchers.containsString("\"apiKeyLength\":8")));
  }

  @Test
  void chatStream_emptyDataContent_skipped() throws Exception {
    String sseBody = "data: \n\n" + "data: [DONE]\n\n";
    startMockOpenRouter(200, "text/event-stream", sseBody.getBytes(StandardCharsets.UTF_8));

    String body =
        "{\"model\":\"abc\",\"stream\":true,\"messages\":[{\"role\":\"user\",\"content\":\"Hi\"}]}";
    MvcResult mvcResult =
        mockMvc
            .perform(
                post("/api/test/openrouter/chat/stream")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(body))
            .andExpect(request().asyncStarted())
            .andReturn();

    mockMvc
        .perform(
            org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch(
                mvcResult))
        .andExpect(status().isOk())
        .andExpect(content().string(Matchers.containsString("connection established")))
        .andExpect(content().string(Matchers.containsString("data: [DONE]")))
        .andExpect(content().string(Matchers.containsString("No content generated by the model")));
  }

  @Test
  void chatStream_invalidJson_forwardedAsIs() throws Exception {
    String sseBody = "data: {invalid-json\n\n" + "data: [DONE]\n\n";
    startMockOpenRouter(200, "text/event-stream", sseBody.getBytes(StandardCharsets.UTF_8));

    String body =
        "{\"model\":\"abc\",\"stream\":true,\"messages\":[{\"role\":\"user\",\"content\":\"Hi\"}]}";
    MvcResult mvcResult =
        mockMvc
            .perform(
                post("/api/test/openrouter/chat/stream")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(body))
            .andExpect(request().asyncStarted())
            .andReturn();

    mockMvc
        .perform(
            org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch(
                mvcResult))
        .andExpect(status().isOk())
        .andExpect(content().string(Matchers.containsString("data: {invalid-json")))
        .andExpect(content().string(Matchers.containsString("data: [DONE]")));
  }

  @Test
  void chatStream_missingChoicesKey_skipped() throws Exception {
    String sseBody = "data: {\"other\":\"value\"}\n\n" + "data: [DONE]\n\n";
    startMockOpenRouter(200, "text/event-stream", sseBody.getBytes(StandardCharsets.UTF_8));

    String body =
        "{\"model\":\"abc\",\"stream\":true,\"messages\":[{\"role\":\"user\",\"content\":\"Hi\"}]}";
    MvcResult mvcResult =
        mockMvc
            .perform(
                post("/api/test/openrouter/chat/stream")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(body))
            .andExpect(request().asyncStarted())
            .andReturn();

    mockMvc
        .perform(
            org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch(
                mvcResult))
        .andExpect(status().isOk())
        .andExpect(content().string(Matchers.containsString("connection established")))
        .andExpect(content().string(Matchers.containsString("data: [DONE]")))
        .andExpect(
            content().string(Matchers.not(Matchers.containsString("data: {\"other\":\"value\"}"))));
  }

  @Test
  void chatStream_emptyChoicesArray_skipped() throws Exception {
    String sseBody = "data: {\"choices\":[]}\n\n" + "data: [DONE]\n\n";
    startMockOpenRouter(200, "text/event-stream", sseBody.getBytes(StandardCharsets.UTF_8));

    String body =
        "{\"model\":\"abc\",\"stream\":true,\"messages\":[{\"role\":\"user\",\"content\":\"Hi\"}]}";
    MvcResult mvcResult =
        mockMvc
            .perform(
                post("/api/test/openrouter/chat/stream")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(body))
            .andExpect(request().asyncStarted())
            .andReturn();

    mockMvc
        .perform(
            org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch(
                mvcResult))
        .andExpect(status().isOk())
        .andExpect(content().string(Matchers.containsString("connection established")))
        .andExpect(content().string(Matchers.containsString("data: [DONE]")))
        .andExpect(
            content().string(Matchers.not(Matchers.containsString("data: {\"choices\":[]}"))));
  }

  @Test
  void chatStream_missingDeltaKey_skipped() throws Exception {
    String sseBody = "data: {\"choices\":[{\"other\":\"value\"}]}\n\n" + "data: [DONE]\n\n";
    startMockOpenRouter(200, "text/event-stream", sseBody.getBytes(StandardCharsets.UTF_8));

    String body =
        "{\"model\":\"abc\",\"stream\":true,\"messages\":[{\"role\":\"user\",\"content\":\"Hi\"}]}";
    MvcResult mvcResult =
        mockMvc
            .perform(
                post("/api/test/openrouter/chat/stream")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(body))
            .andExpect(request().asyncStarted())
            .andReturn();

    mockMvc
        .perform(
            org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch(
                mvcResult))
        .andExpect(status().isOk())
        .andExpect(content().string(Matchers.containsString("connection established")))
        .andExpect(content().string(Matchers.containsString("data: [DONE]")))
        .andExpect(
            content()
                .string(
                    Matchers.not(
                        Matchers.containsString("data: {\"choices\":[{\"other\":\"value\"}]}"))));
  }

  @Test
  void chatStream_missingContentKey_skipped() throws Exception {
    String sseBody =
        "data: {\"choices\":[{\"delta\":{\"other\":\"value\"}}]}\n\n" + "data: [DONE]\n\n";
    startMockOpenRouter(200, "text/event-stream", sseBody.getBytes(StandardCharsets.UTF_8));

    String body =
        "{\"model\":\"abc\",\"stream\":true,\"messages\":[{\"role\":\"user\",\"content\":\"Hi\"}]}";
    MvcResult mvcResult =
        mockMvc
            .perform(
                post("/api/test/openrouter/chat/stream")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(body))
            .andExpect(request().asyncStarted())
            .andReturn();

    mockMvc
        .perform(
            org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch(
                mvcResult))
        .andExpect(status().isOk())
        .andExpect(content().string(Matchers.containsString("connection established")))
        .andExpect(content().string(Matchers.containsString("data: [DONE]")))
        .andExpect(
            content()
                .string(
                    Matchers.not(
                        Matchers.containsString(
                            "data: {\"choices\":[{\"delta\":{\"other\":\"value\"}}]}"))));
  }

  @Test
  void chatStream_nullContentValue_skipped() throws Exception {
    String sseBody =
        "data: {\"choices\":[{\"delta\":{\"content\":null}}]}\n\n" + "data: [DONE]\n\n";
    startMockOpenRouter(200, "text/event-stream", sseBody.getBytes(StandardCharsets.UTF_8));

    String body =
        "{\"model\":\"abc\",\"stream\":true,\"messages\":[{\"role\":\"user\",\"content\":\"Hi\"}]}";
    MvcResult mvcResult =
        mockMvc
            .perform(
                post("/api/test/openrouter/chat/stream")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(body))
            .andExpect(request().asyncStarted())
            .andReturn();

    mockMvc
        .perform(
            org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch(
                mvcResult))
        .andExpect(status().isOk())
        .andExpect(content().string(Matchers.containsString("connection established")))
        .andExpect(content().string(Matchers.containsString("data: [DONE]")))
        .andExpect(
            content()
                .string(
                    Matchers.not(
                        Matchers.containsString(
                            "data: {\"choices\":[{\"delta\":{\"content\":null}}]}"))));
  }

  @Test
  void chatStream_emptyContentString_skipped() throws Exception {
    String sseBody =
        "data: {\"choices\":[{\"delta\":{\"content\":\"\"}}]}\n\n" + "data: [DONE]\n\n";
    startMockOpenRouter(200, "text/event-stream", sseBody.getBytes(StandardCharsets.UTF_8));

    String body =
        "{\"model\":\"abc\",\"stream\":true,\"messages\":[{\"role\":\"user\",\"content\":\"Hi\"}]}";
    MvcResult mvcResult =
        mockMvc
            .perform(
                post("/api/test/openrouter/chat/stream")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(body))
            .andExpect(request().asyncStarted())
            .andReturn();

    mockMvc
        .perform(
            org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch(
                mvcResult))
        .andExpect(status().isOk())
        .andExpect(content().string(Matchers.containsString("connection established")))
        .andExpect(content().string(Matchers.containsString("data: [DONE]")))
        .andExpect(
            content()
                .string(
                    Matchers.not(
                        Matchers.containsString(
                            "data: {\"choices\":[{\"delta\":{\"content\":\"\"}}]}"))));
  }

  @Test
  void chatStream_validContentWithText_forwarded() throws Exception {
    String sseBody =
        "data: {\"choices\":[{\"delta\":{\"content\":\"Hello World\"}}]}\n\n" + "data: [DONE]\n\n";
    startMockOpenRouter(200, "text/event-stream", sseBody.getBytes(StandardCharsets.UTF_8));

    String body =
        "{\"model\":\"abc\",\"stream\":true,\"messages\":[{\"role\":\"user\",\"content\":\"Hi\"}]}";
    MvcResult mvcResult =
        mockMvc
            .perform(
                post("/api/test/openrouter/chat/stream")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(body))
            .andExpect(request().asyncStarted())
            .andReturn();

    mockMvc
        .perform(
            org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch(
                mvcResult))
        .andExpect(status().isOk())
        .andExpect(
            content()
                .string(
                    Matchers.containsString(
                        "data: {\"choices\":[{\"delta\":{\"content\":\"Hello World\"}}]}")))
        .andExpect(content().string(Matchers.containsString("data: [DONE]")));
  }

  @Test
  void chatStream_multipleValidContentChunks_allForwarded() throws Exception {
    String sseBody =
        "data: {\"choices\":[{\"delta\":{\"content\":\"Hello\"}}]}\n\n"
            + "data: {\"choices\":[{\"delta\":{\"content\":\" \"}}]}\n\n"
            + "data: {\"choices\":[{\"delta\":{\"content\":\"World\"}}]}\n\n"
            + "data: [DONE]\n\n";
    startMockOpenRouter(200, "text/event-stream", sseBody.getBytes(StandardCharsets.UTF_8));

    String body =
        "{\"model\":\"abc\",\"stream\":true,\"messages\":[{\"role\":\"user\",\"content\":\"Hi\"}]}";
    MvcResult mvcResult =
        mockMvc
            .perform(
                post("/api/test/openrouter/chat/stream")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(body))
            .andExpect(request().asyncStarted())
            .andReturn();

    mockMvc
        .perform(
            org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch(
                mvcResult))
        .andExpect(status().isOk())
        .andExpect(
            content()
                .string(
                    Matchers.containsString(
                        "data: {\"choices\":[{\"delta\":{\"content\":\"Hello\"}}]}")))
        .andExpect(
            content()
                .string(
                    Matchers.containsString(
                        "data: {\"choices\":[{\"delta\":{\"content\":\" \"}}]}")))
        .andExpect(
            content()
                .string(
                    Matchers.containsString(
                        "data: {\"choices\":[{\"delta\":{\"content\":\"World\"}}]}")))
        .andExpect(content().string(Matchers.containsString("data: [DONE]")));
  }
}
