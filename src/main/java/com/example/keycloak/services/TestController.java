package com.example.keycloak.services;

import org.springframework.http.*;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/test")
public class TestController {

    private static final Pattern WHITESPACES = Pattern.compile("\\s+");

    @RequestMapping(value = "/anonymous", method = RequestMethod.GET)
    public ResponseEntity<String> getAnonymous() {
        return ResponseEntity.ok("Hello Anonymous");
    }

    @Secured({"ROLE_user"})
    @RequestMapping(value = "/user", method = RequestMethod.GET)
    public ResponseEntity<String> getUser(@RequestHeader Map<String, String> headers)
    {
        final String url = "http://localhost:8888/auth/realms/demo-realm/custom-endpoints/attribute-search/?attributeName=userId&attributeValue=RN0000";

        RestTemplate template = new RestTemplate();

        HttpHeaders headers2 = new HttpHeaders();
        headers2.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
        headers2.setContentType(MediaType.APPLICATION_JSON);
        headers2.setBearerAuth(getAuthorizationToken(headers));

        HttpEntity entity = new HttpEntity("", headers2);

        ResponseEntity<String> response = template.exchange(
                url, HttpMethod.GET, entity, String.class);

        return response;
    }


    @Secured({"ROLE_admin"})
    @RequestMapping(value = "/admin", method = RequestMethod.GET)
    public ResponseEntity<String> getAdmin() {
        return ResponseEntity.ok("Hello Admin");
    }

    @Secured({"ROLE_admin"})
    @RequestMapping(value = "/all-user", method = RequestMethod.GET)
    public ResponseEntity<String> getAllUser() {
        return ResponseEntity.ok("Hello All User");
    }

    private String getAuthorizationToken(@RequestHeader Map<String, String> headers) {
        return WHITESPACES.split(headers.get("authorization").trim())[1];
    }
}
