package com.campus.eventmanagement.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.campus.eventmanagement.entity.PastHighlight;
import com.campus.eventmanagement.repository.PastHighlightRepository;
import java.util.List;

@RestController
@RequestMapping("/api/highlights")
public class PastHighlightController {

    private final PastHighlightRepository pastHighlightRepository;

    public PastHighlightController(PastHighlightRepository pastHighlightRepository) {
        this.pastHighlightRepository = pastHighlightRepository;
    }

    private void checkAdmin() {
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            throw new RuntimeException("Access Denied: Admin authorization required!");
        }
    }

    @GetMapping
    public List<PastHighlight> getActiveHighlights() {
        return pastHighlightRepository.findByActiveTrue();
    }

    @PostMapping
    public PastHighlight createHighlight(@RequestBody PastHighlight highlight) {
        checkAdmin();
        return pastHighlightRepository.save(highlight);
    }

    @PostMapping("/bulk")
    public List<PastHighlight> createHighlights(@RequestBody List<PastHighlight> highlights) {
        checkAdmin();
        return pastHighlightRepository.saveAll(highlights);
    }

    @PutMapping("/album")
    public ResponseEntity<String> updateAlbumInfo(
            @RequestParam String yearTitle,
            @RequestParam String folderType,
            @RequestParam String oldTitle,
            @RequestParam String newTitle,
            @RequestParam String newDescription) {
        
        checkAdmin();
        List<PastHighlight> items = pastHighlightRepository.findByYearTitleAndFolderTypeAndTitle(yearTitle, folderType, oldTitle);
        for (PastHighlight h : items) {
            h.setTitle(newTitle);
            h.setDescription(newDescription);
            pastHighlightRepository.save(h);
        }
        return ResponseEntity.ok("Album info updated successfully");
    }

    @DeleteMapping("/{id}")
    public String deleteHighlight(@PathVariable Long id) {
        checkAdmin();
        pastHighlightRepository.deleteById(id);
        return "Highlight deleted successfully";
    }
}
