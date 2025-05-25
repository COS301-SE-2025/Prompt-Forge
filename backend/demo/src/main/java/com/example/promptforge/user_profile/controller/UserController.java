package com.example.promptforge.user_profile.controller;

import com.example.promptforge.user_profile.dto.UpdateProfileDto;
import com.example.promptforge.user_profile.dto.UserDto;
import com.example.promptforge.user_profile.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/{id}")
    public UserDto getUser(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @PutMapping("/{id}")
    public UserDto updateUser(@PathVariable Long id, @RequestBody UpdateProfileDto dto) {
        return userService.updateUser(id, dto);
    }
}
