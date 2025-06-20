package com.fiveOps.promptforge;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // 400 - Bad Request
    @ExceptionHandler({
        IllegalArgumentException.class,
        MethodArgumentTypeMismatchException.class
    })
    public ResponseEntity<Map<String, Object>> handleBadRequest(Exception ex) {
        logger.warn("Bad request: {}", ex.getMessage());

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Bad Request");
        body.put("message", ex.getMessage());
        body.put("path", getRequestPath());

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    // 401 - Unauthorized
    @ExceptionHandler({
        org.springframework.security.core.AuthenticationException.class
    })
    public ResponseEntity<Map<String, Object>> handleUnauthorized(Exception ex) {
        logger.warn("Unauthorized: {}", ex.getMessage());

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.UNAUTHORIZED.value());
        body.put("error", "Unauthorized");
        body.put("message", "Authentication failed");
        body.put("path", getRequestPath());

        return new ResponseEntity<>(body, HttpStatus.UNAUTHORIZED);
    }

    // 403 - Forbidden
    @ExceptionHandler({
        AccessDeniedException.class
    })
    public ResponseEntity<Map<String, Object>> handleForbidden(AccessDeniedException ex) {
        logger.warn("Forbidden: {}", ex.getMessage());

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.FORBIDDEN.value());
        body.put("error", "Forbidden");
        body.put("message", "You don't have permission to access this resource");
        body.put("path", getRequestPath());

        return new ResponseEntity<>(body, HttpStatus.FORBIDDEN);
    }

    // 404 - Not Found
    // @ExceptionHandler({
    //     UserNotFoundException.class,
    //     jakarta.persistence.EntityNotFoundException.class
    // })
    // public ResponseEntity<Map<String, Object>> handleNotFound(Exception ex) {
    //     logger.warn("Not found: {}", ex.getMessage());

    //     Map<String, Object> body = new HashMap<>();
    //     body.put("timestamp", LocalDateTime.now());
    //     body.put("status", HttpStatus.NOT_FOUND.value());
    //     body.put("error", "Not Found");
    //     body.put("message", ex.getMessage());
    //     body.put("path", getRequestPath());

    //     return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    // }

    // 422 - Validation Errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        logger.warn("Validation errors: {}", ex.getMessage());

        Map<String, String> errors = ex.getBindingResult().getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fieldError -> fieldError.getDefaultMessage() != null 
                            ? fieldError.getDefaultMessage() 
                            : "Validation error"
                ));

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.UNPROCESSABLE_ENTITY.value());
        body.put("error", "Validation Error");
        body.put("message", "Validation failed for one or more fields");
        body.put("errors", errors);
        body.put("path", getRequestPath());

        return new ResponseEntity<>(body, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    // 500 - Internal Server Error
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(Exception ex) {
        logger.error("Unhandled exception", ex);

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        body.put("error", "Internal Server Error");
        body.put("message", "An unexpected error occurred");
        body.put("path", getRequestPath());

        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Helper method to get request path
    private String getRequestPath() {
        // Implementation depends on how you want to get the current request path
        // You might need to inject HttpServletRequest or use RequestContextHolder
        return "Unknown"; // Placeholder - implement as needed
    }
}