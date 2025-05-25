package com.example.promptforge.user_profile.config;

import io.github.cdimascio.dotenv.Dotenv;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConfig {

    private static Connection connection;

    static {
        try {
            Dotenv dotenv = Dotenv.load();

            String url = dotenv.get("DB_URL");
            String user = dotenv.get("DB_USER");
            String password = dotenv.get("DB_PASSWORD");

            connection = DriverManager.getConnection(url, user, password);
            System.out.println("✅ Connected to AWS database");

        } catch (SQLException e) {
            e.printStackTrace();
            System.err.println("❌ Failed to connect to database");
        }
    }

    public static Connection getConnection() {
        return connection;
    }
}
