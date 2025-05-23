package com.example.promptforge.user_profile.controller;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.stereotype.Controller;

@Controller
public class UserController {
    // Add your controller methods here
    // For example, you can create a method to handle user profile requests

    @RequestMapping("/")
  
    public String index() {
        return "index";
    }
    
}
