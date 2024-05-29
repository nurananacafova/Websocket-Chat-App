package com.example.websocketchatapp.controller;

import com.example.websocketchatapp.model.Message;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Slf4j
public class KafkaController {

    private final KafkaTemplate<String, Message> kafkaTemplate;
    private final SimpMessageSendingOperations messagingTemplate;

    @PostMapping("/send")
    public String sendMessage(@RequestBody Message message) {
        kafkaTemplate.send("message-topic", message);
        messagingTemplate.convertAndSend("/chatroom/public", message);
        log.info("Message sent to '/chatroom/public' from Kafka {}:", message);
        return "Message sent!";
    }

    @PostMapping("/sendTo")
    public String sendMessageToUser(@RequestBody Message message) {
        kafkaTemplate.send("message-topic", message);
        messagingTemplate.convertAndSendToUser(message.getReceiverName(), "/private", message);
        log.info("Message sent to user {} from Kafka {}:", message.getReceiverName(), message);
        return "Message sent!";
    }
}

