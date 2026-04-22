package tn.esprit.gestionsession.websocket;

import lombok.Data;

@Data
public class SignalMessage {

    private String type;       // JOIN, OFFER, ANSWER, ICE_CANDIDATE
    private String roomCode;

    private String from;
    private String to;

    // For OFFER / ANSWER
    private String sdp;

    // For ICE
    private String candidate;
    private String sdpMid;
    private Integer sdpMLineIndex;

    // Optional for JOIN
    private String username;
    private Boolean isTrainer;
}