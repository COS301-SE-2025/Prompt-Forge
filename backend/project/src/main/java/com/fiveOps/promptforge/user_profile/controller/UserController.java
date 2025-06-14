package com.fiveOps.promptforge.user_profile.controller;
import java.util.UUID;
import com.fiveOps.promptforge.user_profile.dto.UpdateProfileDto;
import com.fiveOps.promptforge.user_profile.dto.UserDto;
import com.fiveOps.promptforge.user_profile.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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
