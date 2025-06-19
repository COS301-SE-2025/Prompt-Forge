package com.fiveOps.promptforge.user_management.controller;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.fiveOps.promptforge.user_management.dto.UpdateProfileDto;
import com.fiveOps.promptforge.user_management.dto.UserDto;
import com.fiveOps.promptforge.user_management.service.UserService;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/{id}")
    public UserDto getUser(@PathVariable  UUID id) {
        return userService.getUserById(id);
    }

    @PatchMapping("/{id}")
    public UserDto updateUser(@PathVariable  UUID id, @RequestBody UpdateProfileDto dto) {
        return userService.updateUser(id, dto);
    }
}
