package com.campus.eventmanagement.service;

import com.campus.eventmanagement.entity.Event;
import java.util.List;

public interface EventService {
    List<Event> getAllEvents();
    List<Event> getActiveEvents();
    Event getEventById(Long id);
    Event createEvent(Event event);
    Event updateEvent(Long id, Event event);
    void deleteEvent(Long id);
    void seedMockEvents();
}
