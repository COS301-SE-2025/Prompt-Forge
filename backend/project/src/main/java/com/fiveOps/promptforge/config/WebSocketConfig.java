package com.fiveOps.promptforge.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@EnableWebSocket
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer, WebSocketConfigurer {

  @Autowired private SimpleWebSocketHandler simpleWebSocketHandler;

  @Override
  public void configureMessageBroker(MessageBrokerRegistry config) {
    // Enable a simple memory-based message broker to carry the messages back to the client
    config.enableSimpleBroker("/topic", "/queue");
    // Set the application destination prefix
    config.setApplicationDestinationPrefixes("/app");
    // Set user destination prefix for private messages
    config.setUserDestinationPrefix("/user");
  }

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    // Register the "/api/ws" endpoint for WebSocket connections
    registry
        .addEndpoint("/api/ws")
        .setAllowedOriginPatterns("*")
        .withSockJS(); // Enable SockJS fallback options

    // Also register a direct WebSocket endpoint without SockJS
    registry.addEndpoint("/api/websocket").setAllowedOriginPatterns("*");
  }

  @Override
  public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
    // Register simple WebSocket handler for direct connections
    registry.addHandler(simpleWebSocketHandler, "/api/simple-ws").setAllowedOriginPatterns("*");
  }
}
