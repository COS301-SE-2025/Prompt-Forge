
package com.fiveOps.promptforge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class PromptForgeApplication {
	public static void main(String[] args) {

		SpringApplication.run(PromptForgeApplication.class, args);
	}

}

