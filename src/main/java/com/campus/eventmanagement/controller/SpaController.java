package com.campus.eventmanagement.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Forwards all non-API, non-static routes to index.html
 * so React Router can handle client-side navigation.
 */
@Controller
public class SpaController {

    @RequestMapping(value = {
        "/",
        "/login",
        "/signup",
        "/dashboard",
        "/events",
        "/gallery",
        "/highlights",
        "/register/**",
        "/my-enrolls",
        "/profile",
        "/admin/**"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
