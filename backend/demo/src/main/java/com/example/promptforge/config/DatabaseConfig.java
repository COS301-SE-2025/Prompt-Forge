package com.example.promptforge.config;

import java.sql.Connection;
import java.sql.SQLException;

import javax.sql.DataSource;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.github.cdimascio.dotenv.Dotenv;

@Configuration
public class DatabaseConfig {

    @Bean
    public DataSource dataSource() {
        Dotenv dotenv = Dotenv.configure()
                              .ignoreIfMissing()
                              .load();

        String url = dotenv.get("DB_URL");
        String username = dotenv.get("DB_USER");
        String password = dotenv.get("DB_PASSWORD");

        DataSource dataSource = DataSourceBuilder.create()
                .url(url)
                .username(username)
                .password(password)
                .driverClassName("org.postgresql.Driver") // or your actual DB driver
                .build();

        // ✅ Test connection during startup
        try (Connection conn = dataSource.getConnection()) {
            if (conn != null && !conn.isClosed()) {
                System.out.println("✅ Connected to DB");
            } else {
                System.err.println("❌ DB connection is null or closed");
            }
        } catch (SQLException e) {
            System.err.println("❌ DB connection failed: " + e.getMessage());
        }

        return dataSource;
    }
}
