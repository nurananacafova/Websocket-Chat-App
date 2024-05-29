package com.example.websocketchatapp.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Message {

    private String senderName;
    private String receiverName;
    private String message;
    private MessageStatus status;
    private String sessionId;

}
