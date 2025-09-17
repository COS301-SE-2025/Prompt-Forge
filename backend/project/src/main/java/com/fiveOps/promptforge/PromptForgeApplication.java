package com.fiveOps.promptforge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PromptForgeApplication {
  public static void main(String[] args) {

    SpringApplication.run(PromptForgeApplication.class, args);
  }
}
