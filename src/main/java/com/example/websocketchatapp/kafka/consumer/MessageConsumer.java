package com.example.websocketchatapp.kafka.consumer;

import com.example.websocketchatapp.model.Message;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.user.SimpSession;
import org.springframework.messaging.simp.user.SimpUser;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MessageConsumer {
    private static final Logger logger = LoggerFactory.getLogger(MessageConsumer.class);
    private final SimpMessageSendingOperations messagingTemplate;
    private final SimpUserRegistry userRegistry;

    @KafkaListener(topics = "message-topic", groupId = "message-id")
    public void listen(Message message) {
        logger.info("Received message from Kafka: " + message);
        for (SimpUser user : userRegistry.getUsers()) {
            for (SimpSession session : user.getSessions()) {
                if (!session.getId().equals(message.getSessionId())) {
                    messagingTemplate.convertAndSendToUser(session.getId(), "/chatroom/public", message);
                }
            }
        }
    }

//    @KafkaListener(topics = "message-topic", groupId = "message-id")
//    public void listen(String message) {
//        logger.info("Received message from Kafka: " + message);
////        for (SimpUser user : userRegistry.getUsers()) {
////            for (SimpSession session : user.getSessions()) {
////                if (!session.getId().equals(message.getSessionId())) {
////                    messagingTemplate.convertAndSendToUser(session.getId(), "/chatroom/public", message);
////                }
////            }
////        }
//    }

}