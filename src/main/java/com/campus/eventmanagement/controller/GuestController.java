package com.campus.eventmanagement.controller;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.campus.eventmanagement.entity.Guest;
import com.campus.eventmanagement.repository.GuestRepository;
import java.util.List;

@RestController
@RequestMapping("/api/guests")
public class GuestController {

    private final GuestRepository guestRepository;

    public GuestController(GuestRepository guestRepository) {
        this.guestRepository = guestRepository;
    }

    private void checkAdmin() {
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            throw new RuntimeException("Access Denied: Admin authorization required!");
        }
    }

    @GetMapping
    public List<Guest> getActiveGuests() {
        return guestRepository.findByActiveTrueOrderByPriorityAsc();
    }

    @PostMapping
    public Guest saveGuest(@RequestBody Guest guest) {
        checkAdmin();
        return guestRepository.save(guest);
    }

    @DeleteMapping("/{id}")
    public String deleteGuest(@PathVariable Long id) {
        checkAdmin();
        guestRepository.deleteById(id);
        return "Guest deleted successfully";
    }
}
