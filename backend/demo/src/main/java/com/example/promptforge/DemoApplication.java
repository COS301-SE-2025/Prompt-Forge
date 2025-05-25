package com.example.promptforge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class DemoApplication {
	public static void main(String[] args) {
	Dotenv dotenv = Dotenv.configure()
				.ignoreIfMissing()
				.load();
				String url = dotenv.get("DB_URL");
				String username = dotenv.get("DB_USER");
				String password = dotenv.get("DB_PASSWORD"); // ⚠️ Don't log this in real apps
		
			
				System.out.println("🔍 DB URL: " + url);
				System.out.println("👤 Username: " + username);
				System.out.println("🔑 Password: " + password); // Only temporarily for debugging

		// Set Spring Boot DB props
		System.setProperty("spring.datasource.url", url);
		System.setProperty("spring.datasource.username", username);
		System.setProperty("spring.datasource.password",password);
		System.setProperty("spring.datasource.driver-class-name", "org.postgresql.Driver");

	
		SpringApplication.run(DemoApplication.class, args);
	}

}
