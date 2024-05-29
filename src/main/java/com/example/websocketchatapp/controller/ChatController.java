package com.example.websocketchatapp.controller;

import com.example.websocketchatapp.kafka.producer.MessageProducer;
import com.example.websocketchatapp.model.Message;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;


@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final SimpMessagingTemplate simpMessagingTemplate;
    private final MessageProducer messageProducer;

    @MessageMapping("/message")
    public Message receiverMessage(@Payload Message message, SimpMessageHeaderAccessor headerAccessor) {
        message.setSessionId(headerAccessor.getSessionId());
        messageProducer.sendMessage("message-topic", message);
        log.info("Sending message to '/chatroom/public': {}", message);
        simpMessagingTemplate.convertAndSend("/chatroom/public", message);
        log.info("Message sent to '/chatroom/public': {}", message);
        return message;
    }


    @MessageMapping("/private-message")
    public Message privateMessage(@Payload Message message) {
        messageProducer.sendMessage("message-topic", message);
        log.info("Sending message to user: {}", message.getReceiverName());
        simpMessagingTemplate.convertAndSendToUser(message.getReceiverName(), "/private", message);
        log.info("Message sent to user: {}", message.getReceiverName());
        return message;
    }
}


